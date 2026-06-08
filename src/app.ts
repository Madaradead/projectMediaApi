import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import { errorHandler} from "../middlewares/error.middleware.js";
import {setupSwagger} from "../utils/swagger.js";


const app = express();


app.get('/health', (req, res) => {
    res.status(200).json({status: 'OK'});
});

setupSwagger(app);
app.use(express.json({limit: "5mb"}));
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/media", mediaRoutes);
app.use(errorHandler);
export default app;