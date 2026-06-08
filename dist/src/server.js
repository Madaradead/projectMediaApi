import 'dotenv/config';
import app from "./app.js";
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
    }
    else {
        console.error('Failed to start server', err);
    }
    process.exit(1);
});
//# sourceMappingURL=server.js.map