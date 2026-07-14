const express = require("express");
const mongoose = require("mongoose");
const {successResponse} = require("../utils/apiResponse");

const router = express.Router();

router.get("/health",(req,res)=>{
    const dbState = mongoose.connection.readyState;
    successResponse(res,200,"API is running",{
        service: "Ecommerce API",
        database: dbState === 1 ? "Connected" : "Not Connected",
        timestamp: new Date()
    });

});

module.exports = router;    