const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const routes = require("./routes");
const swaggerSpec = require("./docs/swagger");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const redis = require("./config/redis");

const cookieParser = require("cookie-parser");

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/openapi.json", (req, res) => res.json(swaggerSpec));
app.get("/api/health/redis", async (req, res) => {
    try {
        const pong = await redis.ping();
        const { successResponse } = require("./utils/apiResponse");
        return successResponse(res, 200, "Redis health check successful", {
            service: "redis",
            ping: pong,
        });
    } catch (err) {
        return res.status(503).json({
            success: false,
            message: "Redis unavailable",
            error: err.message,
        });
    }
});
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "E-commerce API is running",
        endpoints: {
            health: "/api/health",
            docs: "/api-docs",
            openapi: "/openapi.json",
            auth: "/api/auth",
        },
    });
});
app.use(routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;