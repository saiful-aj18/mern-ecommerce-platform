const jwt = require('jsonwebtoken');
const {z} = require('zod');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const {successResponse} = require('../utils/apiResponse');

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").max(50, "Name must be at most 50 characters long"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const register = asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
        const error = new Error('Email already in use');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create(body);
    successResponse(res, 201, "User registered successfully", { user });

});   



module.exports = { register };