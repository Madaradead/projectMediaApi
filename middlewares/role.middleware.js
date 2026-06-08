import {} from "express";
import {} from "./auth.middleware.js";
export const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }
            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({ message: "Access denied.Insufficient privileges" });
                return;
            }
            next();
        }
        catch (e) {
            res.status(500).json({ message: "Server Error" });
        }
    };
};
//# sourceMappingURL=role.middleware.js.map