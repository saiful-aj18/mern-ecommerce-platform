require('dotenv').config();

const app = require('./src/app.js');
const connectDB = require('./src/config/db');



const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        const apiUrl = `http://localhost:${PORT}`;
        const swaggerUrl = `${apiUrl}/api-docs`;
        // Mongo Express runs in docker-compose on host port 8081.
        //const mongoExpressUrl = `http://localhost:8081`;

        console.log("\n🚀 E-commerce API is up");
        console.log("------------------------------------------------------------");
        console.log(`  API          → ${apiUrl}`);
        console.log(`  Swagger UI   → ${swaggerUrl}`);
        console.log(`  OpenAPI JSON → ${apiUrl}/openapi.json`);
       // console.log(`  Mongo UI     → ${mongoExpressUrl}  (user: teacher / pass: teacher123)`);
        console.log("  Redis        →", process.env.REDIS_URL);
        console.log("  Redis-insight ", process.env.REDIS_GUI);
        console.log("------------------------------------------------------------\n");
    });
};

startServer();