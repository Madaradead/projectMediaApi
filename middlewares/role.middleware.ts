import {type Response, type  NextFunction} from "express";
import {type AuthRequest} from "./auth.middleware.js";

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try{
            if(!req.user) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }
            if(!allowedRoles.includes(req.user.role)) {
                res.status(403).json({ message: "Access denied.Insufficient privileges" });
            }

            next()
        }catch(e){
            res.status(500).json({message:"Server Error"});
        }
    }
}