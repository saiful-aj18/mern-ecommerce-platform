const express = require("express");
const { register ,login,
    me,
    refresh,
    logout, } = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/refresh", refresh);
router.post("/logout", protect, logout);

module.exports = router;