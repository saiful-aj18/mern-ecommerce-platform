const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");


const router = express.Router();

router.use("/api/health", healthRoutes);
router.use("/api/auth", authRoutes);


module.exports = router;