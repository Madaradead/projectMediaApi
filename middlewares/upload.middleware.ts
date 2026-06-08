import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { type Request, type  Response, type  NextFunction } from "express";


const uploadDir = path.join(process.cwd(), "uploads");


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir,{recursive:true});

}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
        cb(null, `${uniqueName}`);
    }
});

export const ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "video/mp4",
    "audio/mpeg",
    "audio/wav",
    "application/pdf",
    "text/plain"
];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type") as any, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const singleUpload = upload.single('file');

    singleUpload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(413).json({ errors: 'Payload Too Large: File size exceeds the 10MB limit.' });
                return;
            }
            res.status(400).json({ errors: `Upload Error: ${err.message}` });
            return;
        } else if (err) {
            res.status(400).json({ errors: err.message });
            return;
        }

        next();
    });
};