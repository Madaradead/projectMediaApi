import {type NextFunction, type Response} from "express";
import {type AuthRequest} from "../../middlewares/auth.middleware.js";
import {PrismaClient} from "@prisma/client";
import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg" ;
import path from 'path'
import fs from 'fs'
import {id} from "zod/locales";

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
    const userId = req.user.userId;

    const mediaType = getMediaType(req.file.mimetype);

    const mediaFile = await prisma.mediaFile.create({
        data:{
            title: req.body.title || req.file.originalname,
            description: req.body.description || null,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
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

const getPaginationAndSorting = (query: any) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    const allowedSortFields = ['createdAT', 'size', 'title'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'createdAT';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return {skip, take: limit, orderBy: {[sortBy]: sortOrder}, page, limit};
};







export const getAllMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {skip, take, orderBy, page, limit} = getPaginationAndSorting(req.query);

        const where: any = {
            visibility: 'PUBLIC',
            status: 'ACTIVE'

        };
        if (req.query.type) where.type = req.query.type;

        const [files, total] = await Promise.all([
            prisma.mediaFile.findMany({where, skip, take, orderBy}),
            prisma.mediaFile.count({where}),
        ]);
        res.status(200).json({
            data: files,
            meta: {total, page, limit, totalPage: Math.ceil(total / limit)}
        });
    } catch (err) {
        console.error('GetAllMedia Error:', err);
        res.status(500).json({errors: 'Internal server error while uploading file'});
    }

};

export const getMyMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {skip, take, orderBy, page, limit} = getPaginationAndSorting(req.query);
        const userId = req.user.id;

        const where: any = {ownerId: userId};

        if (req.query.type) where.type = req.query.type;
        if (req.query.visibility) where.visibility = req.query.visibility;
        if (req.query.status) where.status = req.query.status;

        const [files, total] = await Promise.all([
            prisma.mediaFile.findMany({where, skip, take, orderBy}),
            prisma.mediaFile.count({where})
        ]);
        res.status(200).json({
            data: files,
            meta: {total, page, limit, totalPage: Math.ceil(total / limit)}

        });
    }catch(err){
        console.error('GetMyMedia Error:', err);
        res.status(500).json({errors: 'Internal server error while uploading file'});
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
        const filePath = path.join(process.cwd(), 'uploads', mediaFile.filename);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({errors: 'No file found with the file name'});
            return;
        }
        res.sendFile(filePath);
    }catch(err){
        console.error('Stream Error:', err);
        res.status(500).json({errors: 'Internal server error while uploading file'});
    }
};

export const updateMetadata = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const id = req.params.id as string;
        const userId = req.user.userId;
        const {title, description, visibility} = req.body;


        const mediaFile = await prisma.mediaFile.findUnique({
            where: {id}
        });
        if (!mediaFile) {
            res.status(404).json({errors: 'No media file found'});
            return;
        }
        const updatedFile = await prisma.mediaFile.update({
            where: {id},
            data: {
                title :title !== undefined ? title : mediaFile.title,
                description : description !== undefined ? description : mediaFile.description,
                visibility : visibility !== undefined ? visibility : mediaFile.visibility,

            }
        });
        res.status(200).json({
            message: 'Updated metadata successfully',
            file: updatedFile
        });
    }catch(err){
        console.error('Update error:', err);
    res.status(500).json({errors: 'Internal server error while uploading file'});
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
        res.status(200).json({message: 'Deleted successfully'});
    }catch(err){
        console.error('Delete error:', err);
        res.status(500).json({errors: 'Internal server error while deleting file'});
    }
};

export const searchMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const searchQuery = req.query.q as string;
        const userId = req.user.userId;

        if(!searchQuery || searchQuery.trim().length === 0){
            res.status(404).json({errors: 'The search query cannot be empty'});
            return;
        }
        console.log(`[SECURITY AUDIT] User ID: ${userId} searched for: "${searchQuery}"`);

        const files  = await prisma.mediaFile.findMany({
            where:{
                ownerId:userId,
                status:'ACTIVE',
                OR:[
                    {title:{ contains: searchQuery, mode: 'insensitive'}},
                    {description: { contains: searchQuery, mode: 'insensitive'}}
                ]
            },
            orderBy: {createdAT: 'desc'}
        });
        res.status(200).json({
            message: 'Search media results successfully',
            count: files.length,
            data: files
        });
    }catch(err){
        console.error('Search error:', err);
        res.status(500).json({errors: 'Internal server error while searching file'});
    }
};