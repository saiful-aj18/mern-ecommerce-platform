const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");

const router = express.Router();

router.use("/api/health", healthRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/products", productRoutes);

module.exports = router;