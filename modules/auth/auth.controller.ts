import { type Request, type Response } from "express";
import bcrypt from 'bcrypt';
import { z } from "zod";
import {prisma} from "../../lib/prisma.js";
import jwt from 'jsonwebtoken';
import {type AuthRequest} from "../../middlewares/auth.middleware.js";
import {Env} from "../../config/env.js";

const RegisterSchema = z.object({
    email: z.email('invalid format email'),
    username: z.string().min(3, 'must have at least 3 characters'),
    password: z.string().min(6, 'must have at least 6 characters'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = RegisterSchema.parse(req.body);

        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: validateData.email }
        });

        if (existingUserByEmail) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const existingUserByUsername = await prisma.user.findUnique({
            where: { username: validateData.username }
        });

        if (existingUserByUsername) {
            res.status(400).json({ error: 'Username already taken' });
            return;
        }

        const saltRandom = 10;
        const passwordHash = await bcrypt.hash(validateData.password, saltRandom);

        const newUser = await prisma.user.create({
            data: {
                email: validateData.email,
                username: validateData.username,
                passwordHash: passwordHash
            }
        });

        res.status(201).json({
            message: "User successfully registered",
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            }
        });

    } catch (err: any) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Conflict: User with this email or username already exists' });
            return;
        }

        console.error("Registration Error ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// ЛОГИН

const LoginSchema = z.object({
    email: z.email('invalid format email'),
    password: z.string().min(1, 'password is required'),
});

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = LoginSchema.parse(req.body);

        const user = await prisma.user.findFirst({
            where: {email: validateData.email}
        });

        if (!user) {
            res.status(401).json({error: 'Invalid email or password'});
            return;
        }

        const isPasswordValid = await bcrypt.compare(validateData.password, user.passwordHash);

        if (!isPasswordValid) {
            res.status(401).json({error: 'Invalid email or password'});
            return;
        }

        const secret = Env.JWT_SECRET!;
        const token = jwt.sign(
            {userId: user.id, role: user.role},
            secret,
            {expiresIn: '24h'}
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });





    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: err.message});
            return;
        }
        console.error("Login Error ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const getMe = async (req:AuthRequest, res:Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });
        if (!user) {
            res.status(401).json({message: 'Invalid user'});
            return;
        }
        res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role

        });
    } catch (err) {
        console.error("getMe Error", err);
        res.status(500).json({error: 'Internal Server Error'});
    }
};