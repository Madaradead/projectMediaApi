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

const fileFilter = (req:any , file:Express.Multer.File, cb:multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        "image/png", "image/jpeg", "image/gif",
        'video/mp4',
        'audio/mpeg',
        'audio/wav',
        'application/pdf', 'text/plain',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type") as any, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const singleUpload = upload.single('file');

    singleUpload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            // Ловим ошибку размера файла (строка 45)
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(413).json({ errors: 'Payload Too Large: File size exceeds the 10MB limit.' });
                return;
            }
            // Ловим остальные системные ошибки multer
            res.status(400).json({ errors: `Upload Error: ${err.message}` });
            return;
        } else if (err) {
            res.status(400).json({ errors: err.message });
            return;
        }

        next();
    });
};