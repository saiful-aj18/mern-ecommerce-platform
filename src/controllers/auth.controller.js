const jwt = require("jsonwebtoken");
const { z } = require("zod");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");

const tokenService = require("../services/token.service");
const sessionService = require("../services/session.service");


const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
});


const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});


const cookieOptions = () => ({
    httpOnly: true,                       
    secure: process.env.NODE_ENV === "production", 
    sameSite: "lax",                     
    path: "/",                          
    maxAge: 7 * 24 * 60 * 60 * 1000,      
});

const setRefreshCookie = (res,token) => res.cookie("rt", token, cookieOptions());
const clearRefreshCookie = (res) => res.clearCookie("rt", cookieOptions());

const register = asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
        const error = new Error("Email already exist!");
        error.statusCode = 409;
        throw error;
    }

    const user = await User.create(body);

    successResponse(res, 201, "User registered successfully", { user });
});

const login = asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({email: body.email});

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }
    const ok = await user.comparePassword(body.password);
    if (!ok) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const sid = tokenService.newSessionId();
    const accessToken = tokenService.signAccessToken(user);
    const refreshToken = tokenService.signRefreshToken(user,sid);

    await sessionService.saveSession({
        sid,
        userId: user._id,
        refreshToken,
          userAgent: req.headers["user-agent"] || "unknown"
    });
    setRefreshCookie(res, refreshToken);
    return successResponse(res, 200, "Login successful", { accessToken })
});

const me = asyncHandler(async (req, res) => {
    return successResponse(res, 200, "Current user", { user: req.user });
});

const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.rt;
    if(!token){
        const error = new Error("Invalid or expired refresh token");
        error.statusCode = 401;
        throw error;
    }

    let decoded;

    try {
        decoded = tokenService.verifyRefreshToken(token);
    } catch (err) {
        const message =
            err.name === "TokenExpiredError"
                ? "Refresh token expired"
                : "Invalid refresh token";
        const error = new Error(message);
        error.statusCode = 401;
        throw error;
    }
    const session = await sessionService.getSession(decoded.sid);
    console.log("Hello2",session);
    if (!session) {
        const error = new Error("Session not found");
        error.statusCode = 401;
        throw error;
    }
    const presentedHash = tokenService.hashToken(token)
    if (presentedHash !== session.refreshHash) {
        const error = new Error("Refresh token does not match session");
        error.statusCode = 401;
        throw error;
    }
    const dbUser = await User.findById(session.userId).select("-password");
    if (!dbUser) {
        const error = new Error("User no longer exists");
        error.statusCode = 401;
        throw error;
    }
    const newSid = tokenService.newSessionId();
    const newRefreshToken = tokenService.signRefreshToken(dbUser, newSid);
    const newAccessToken = tokenService.signAccessToken(dbUser); 

    await sessionService.rotateSession({
        oldSid: decoded.sid,
        sid: newSid,
        newRefreshToken,                    
        userId: session.userId,
        userAgent: req.headers["user-agent"] || "unknown",
    });

    setRefreshCookie(res, newRefreshToken);
    return successResponse(res, 200, "Token refreshed", {accessToken: newAccessToken});
});

const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.rt;
    if (token) {
        try {
            const decoded = jwt.decode(token);
            if (decoded?.sid) await sessionService.deleteSession(decoded.sid);
        } catch (_) { /* swallow */ }
    }
    clearRefreshCookie(res);
    successResponse(res, 200, "Logged out", null);
});

module.exports = {
    register,
    registerSchema,
    login,
    loginSchema,
    me,
    refresh,
    logout,
};