import {type Response} from "express";
import {type AuthRequest} from "../../middlewares/auth.middleware.js";
import {PrismaClient} from "@prisma/client";
import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg" ;
import path from 'path'
import fs from 'fs'
import {fileTypeFromFile} from "file-type";
import { z } from "zod";
import {ALLOWED_MIME_TYPES} from "../../middlewares/upload.middleware.js";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({connectionString});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});


const getMediaType = (mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'  => {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
};

export const uploadMedia = async (req: AuthRequest, res: Response):Promise<void> => {
try {
    if (!req.file){
        res.status(400).json( {errors: 'The file was not uploaded or is in an invalid format.'});
        return;
    }
    const meta = await fileTypeFromFile(req.file.path)

    let detectedMime: string;

    if (!meta) {
        if (req.file.mimetype === 'text/plain') {
            detectedMime = 'text/plain';
        } else {
            fs.unlinkSync(req.file.path);
            res.status(400).json({errors: 'Alert: Invalid file type.'});
            return;
        }
    }else{
        detectedMime = meta.mime;
    }
    if(!ALLOWED_MIME_TYPES.includes(detectedMime)){
        fs.unlinkSync(req.file.path);
        res.status(400).json({errors: 'Alert: Invalid file type.'});
        return;
    }

    const userId = req.user.userId;

    const mediaType = getMediaType(detectedMime);

    const mediaFile = await prisma.mediaFile.create({
        data:{
            title: req.body.title || req.file.originalname,
            description: req.body.description || null,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: detectedMime,
            size: req.file.size,
            type: mediaType,
            ownerId: userId

        }
    });
    res.status(201).json({
        message: 'Successfully uploaded media',
        file: mediaFile,
    });
}catch(err){
    console.error('Error while uploading media', err);
    res.status(500).json({errors: 'Internal server error while uploading file'});
}
};

const querySchema = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(['createdAt', 'size', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT']).optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
    status: z.enum(['ACTIVE', 'DELETED']).optional()
});
const updateMetadataSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
});









export const getAllMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsedQuery = querySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            res.status(400).json({
                errors: 'Invalid query parameters',
                details: z.treeifyError(parsedQuery.error)
            });
            return;
        }
        const { page, limit, sortBy, sortOrder, type } = parsedQuery.data;

        const skip = (page - 1) * limit;
        const where: any = {
            visibility: 'PUBLIC',
            status: 'ACTIVE'
        };
        if (type) {
            where.type = type;
        }

        const [files, total] = await Promise.all([
            prisma.mediaFile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.mediaFile.count({ where }),
        ]);

        res.status(200).json({
            data: files,
            meta: { total, page, limit, totalPage: Math.ceil(total / limit) }
        });
    } catch (err) {
        console.error('GetAllMedia Error:', err);
        res.status(500).json({ errors: 'Internal server error while fetching media files' });
    }
};

export const getMyMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsedQuery = querySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            res.status(400).json({ errors: 'Invalid query parameters',
                details: z.treeifyError(parsedQuery.error)
            });
            return;
        }

        const { page, limit, sortBy, sortOrder, type, visibility, status } = parsedQuery.data;
        const skip = (page - 1) * limit;
        const userId = req.user.userId;

        const where: any = { ownerId: userId };
        if (type) where.type = type;
        if (visibility) where.visibility = visibility;
        if (status) where.status = status;

        const [files, total] = await Promise.all([
            prisma.mediaFile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.mediaFile.count({ where })
        ]);

        res.status(200).json({
            data: files,
            meta: { total, page, limit, totalPage: Math.ceil(total / limit) }
        });
    } catch(err) {
        console.error('GetMyMedia Error:', err);
        res.status(500).json({ errors: 'Internal server error while fetching user media' });
    }
};




export const streamFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const id = req.params.id as string;
        const mediaFile = await prisma.mediaFile.findUnique({
            where:{id}
        });
        if (!mediaFile) {
            res.status(404).json({errors: 'No media file found'});
            return;
        }
        if (mediaFile.status === 'DELETED') {
            res.status(404).json({ error: ' File has been deleted'});
            return;
        }

        if (mediaFile.visibility === 'PRIVATE') {
            if(!req.user){
                res.status(401).json({errors: 'Authorization is required to view a private file.'});
                return;
            }
            const userId = req.user.userId;

            if(mediaFile.ownerId !== userId && req.user.role !== 'ADMIN'){
                res.status(403).json({errors: 'Access denied.Private file.'});
                return;
            }

        }


        const filePath = path.join(process.cwd(), 'uploads', mediaFile.filename);

        try {
            await fs.promises.access(filePath);
        } catch (err) {
            res.status(404).json({errors: 'No file found with the file name'});
            return;
        }

        res.sendFile(filePath);
    }catch(err){
        console.error('Stream Error:', err);
        res.status(500).json({errors: 'Internal server error while streaming file'});
    }
};

export const updateMetadata = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const id = req.params.id as string;
        const userId = req.user.userId;

        const parsedBody = updateMetadataSchema.safeParse(req.body);
        if(!parsedBody.success) {
            res.status(400).json({
                errors: 'Invalid request body',
                details: z.treeifyError(parsedBody.error)
            });
            return;
        }


        const mediaFile = await prisma.mediaFile.findUnique({
            where: {id}
        });
        if (!mediaFile) {
            res.status(404).json({errors: 'No media file found'});
            return;
        }
        if (mediaFile.ownerId !== userId && req.user.role  !== 'ADMIN') {
            res.status(403).json({errors: 'You dont have permission to update this file'});
            return;
        }


        const updatedFile = await prisma.mediaFile.update({
            where: {id},
            data: parsedBody.data  as any

        });
        res.status(200).json({
            message: 'Updated metadata successfully',
            file: updatedFile
        });
    }catch(err){
        console.error('Update error:', err);
        res.status(500).json({errors: 'Internal server error while updating metadata'});
    }

};

const deleteFileWithRetry = async (filePath: string, retries = 3, delayMs = 1000) => {
    for(let i =0; i < retries; i++) {
        try{
            await fs.promises.unlink(filePath);
            return
        }catch(err: any){
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, delayMs));
    }
    }
};

export const deleteMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const id = req.params.id as string;
        const userId = req.user.userId;

        const mediaFile = await prisma.mediaFile.findUnique({
            where: {id}
        });
        if (!mediaFile) {
            res.status(404).json({errors: 'No media file found'});
            return;
        }
        if (mediaFile.ownerId !== userId && req.user.role !== 'ADMIN') {
            res.status(403).json({errors: 'You do not have permission to delete this file'});
            return;
        }
        if(mediaFile.status === 'DELETED') {
            res.status(400).json({errors: 'This file has already been deleted previously.'});
            return;
        }
        await prisma.mediaFile.update({
            where: {id},
            data: {status: 'DELETED'}
        });

        const filePath = path.join(process.cwd(), 'uploads', mediaFile.filename);
        try {
            await deleteFileWithRetry(filePath, 3, 1000);
        } catch (fsErr) {
            console.warn(`[ORPHAN FILE] Failed to delete file after retries: ${filePath}`, fsErr);
        }

        res.status(200).json({message: 'Deleted successfully'});
    }catch(err){
        console.error('Delete error:', err);
        res.status(500).json({errors: 'Internal server error while deleting file'});
    }
};

export const searchMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const q = req.query.q;
        if (!q || typeof q !== 'string' || q.trim() === '') {
            res.status(400).json({errors: 'Search query parameter is required and cannot be empty '});
            return;
        }

        const searchQuery = q.trim();

        const parsedQuery = querySchema.safeParse(req.query);
        if (!parsedQuery.success) {
            res.status(400).json({ errors: 'Invalid pagination parameters' });
            return;
        }

        const { page, limit, sortBy, sortOrder } = parsedQuery.data;
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'ACTIVE',
            visibility: 'PUBLIC',
            OR:[
                { title: { contains: searchQuery, mode: 'insensitive' }},
                {description: { contains: searchQuery, mode: 'insensitive' }}
    ]
        };

        const [files, total] = await Promise.all([
            prisma.mediaFile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.mediaFile.count({ where })
        ]);

        res.status(200).json({
            data: files,
            meta: {
                total,
                page,
                limit,
                totalPage: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        console.error('SearchMedia Error:', err);
        res.status(500).json({ errors: 'Internal server error while searching media' });
    }
};