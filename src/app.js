const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const routes = require("./routes");
const openApiDocumentation = require("./docs/openapi");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");


const app = express();
app.use(helmet());
app.use(cors({origin: process.env.CROSS_ORIGIN || "*"}));
app.use(morgan("dev"));
app.use(express.json({limit: "1mb"}));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
app.get("/api-docs", (req, res) => {res.json(openApiDocumentation)});
app.use(routes);
app.use("/api",routes)
app.use(notFound);
app.use(errorHandler);





module.exports = app;