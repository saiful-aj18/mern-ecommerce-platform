const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const signAccessToken = (user) => {
    return jwt.sign(
        {id: user._id.toString(), role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || "15m"}
    );
};

const signRefreshToken = (user, sessionId) => {
    return jwt.sign(
        { id: user._id.toString(), sid: sessionId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
    );
};

const verifyRefreshToken = (token) =>
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

const newSessionId = () => crypto.randomBytes(24).toString("base64url");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");


module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    newSessionId,
    hashToken,
};