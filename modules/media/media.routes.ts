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
router.get('/my', getMyMedia);
router.get('/search', apiLimiter, searchMedia);
router.get('/:id/stream', streamFile);
router.use(authMiddleware);



router.post('/upload', uploadMiddleware, uploadMedia);



router.patch('/:id', updateMetadata);
router.delete('/:id', deleteMedia);

export default router;