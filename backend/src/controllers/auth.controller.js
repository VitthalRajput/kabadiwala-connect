import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

const register = asyncHandler(async (req, res) => {
  const { phone, name, password, role, location, address } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new ApiError(409, 'User already exists with this phone number');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    phone,
    name,
    password: hashedPassword,
    role,
    location,
    address,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userResponse = user.toObject();
  delete userResponse.password;

  return res
    .status(201)
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        201,
        { user: userResponse, accessToken },
        'User registered successfully'
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  const userResponse = user.toObject();
  delete userResponse.password;

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { user: userResponse, accessToken },
        'Login successful'
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user._id);

    return res
      .status(200)
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

export {
  register,
  login,
  logout,
  refreshAccessToken,
};