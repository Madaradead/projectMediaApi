import {Router} from "express";
import {getMe, login, register} from "./auth.controller.js";
import {authMiddleware} from "../../middlewares/auth.middleware.js";
import {loginLimiter} from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", register);



router.get("/me", authMiddleware, getMe);

router.post("/login", loginLimiter, login);
export default router;
