// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants.js";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
            match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            required: [true, "User role is required"],
            default: USER_ROLES.COLLECTOR,
        },
        profilePicture: {
            type: String,
            default: null,
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
            coordinates: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number],
                    default: [0, 0],
                },
            },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: {
            type: String,
        },
        deviceToken: {
            type: String,
            default: null,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries
userSchema.index({ "address.coordinates": "2dsphere" });

// Hash password before saving - using async/await
userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            phoneNumber: this.phoneNumber,
            fullName: this.fullName,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);