import {Router} from 'express';
import {authMiddleware} from "../../middlewares/auth.middleware.js";
import {uploadMiddleware} from "../../middlewares/upload.middleware.js";
import {
    uploadMedia,
    getAllMedia,
    getMyMedia,
    streamFile,
    updateMetadata,
    deleteMedia, searchMedia
} from "./media.controller.js";
import {apiLimiter} from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.get('/', getAllMedia);
router.get('/my',authMiddleware, getMyMedia);
router.get('/search', apiLimiter, searchMedia);
router.get('/:id/stream', streamFile);
router.use(authMiddleware);



router.post('/upload', uploadMiddleware, uploadMedia);



router.patch('/:id', authMiddleware, updateMetadata);
router.delete('/:id', authMiddleware ,deleteMedia);

export default router;