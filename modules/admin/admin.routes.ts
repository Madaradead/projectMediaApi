import { Router } from 'express';
import {getAllUsers} from "./admin.controller.js";
import {authMiddleware} from "../../middlewares/auth.middleware.js";
import  {roleMiddleware} from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), getAllUsers);

export default router;