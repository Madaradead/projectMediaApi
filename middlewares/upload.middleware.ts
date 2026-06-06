import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";


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

export const uploadMiddleware = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024
        }
});
