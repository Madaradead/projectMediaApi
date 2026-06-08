import { z } from "zod";
import 'dotenv/config'

const EnvSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    PORT: z.coerce.number().default(5000),
})

export const Env = EnvSchema.parse(process.env);