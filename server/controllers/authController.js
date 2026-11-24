import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';
import { issueRefreshToken, findRefreshSession, revokeRefreshToken, revokeAllRefreshTokens } from '../utils/refreshTokens.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;


  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });


  const token = generateToken(user._id);
  const refreshToken = await issueRefreshToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    refreshToken,
    user,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;


  const user = await User.findOne({ email }).select("+password");


  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }


  const passwordMatch = await user.matchPassword(password);


  if (!passwordMatch) {
    throw new ApiError(401, "Invalid email or password");
  }


  const token = generateToken(user._id);
  const refreshToken = await issueRefreshToken(user._id);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    refreshToken,
    user,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  await revokeRefreshToken(req.body?.refreshToken);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @desc    Update profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar, currentPassword } = req.body;
  const emailChanging = email && email !== req.user.email;

  if (emailChanging) {
    // a stolen session must not be able to take over the account by swapping the email
    const withPassword = await User.findById(req.user._id).select("+password");
    if (!currentPassword || !(await withPassword.matchPassword(currentPassword))) {
      throw new ApiError(401, "Current password is required to change your email");
    }
    const emailTaken = await User.findOne({ email });

    if (emailTaken) {
      throw new ApiError(400, "That email is already in use");
    }
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;

  await user.save();

  // Sign out every other device, then give this one a fresh session
  await revokeAllRefreshTokens(user._id);
  const refreshToken = await issueRefreshToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    token: generateToken(user._id),
    refreshToken,
  });
});
/**
 * @desc    Exchange a refresh token for a new access token
 * @route   POST /api/auth/refresh
 * @access  Public (the refresh token is the credential)
 */
export const refresh = asyncHandler(async (req, res) => {
  const userId = await findRefreshSession(req.body?.refreshToken);
  if (!userId) {
    throw new ApiError(401, "Session expired, please log in again");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "Session expired, please log in again");
  }

  // shortcut: the refresh token is not rotated, so two tabs refreshing together never log each other out; rotate if tokens ever move to untrusted storage
  res.status(200).json({ success: true, token: generateToken(user._id), user });
});
