// // import asyncHandler from 'express-async-handler';
// // import User from '../models/User.js';
// // import ApiError from '../utils/ApiError.js';
// // import generateToken from '../utils/generateToken.js';

// // /**
// //  * @desc    Register a new user
// //  * @route   POST /api/auth/signup
// //  * @access  Public
// //  */
// // export const signup = asyncHandler(async (req, res) => {
// //   const { name, email, password } = req.body;

// //   const existingUser = await User.findOne({ email });
// //   if (existingUser) {
// //     throw new ApiError(400, 'An account with this email already exists');
// //   }

// //   const user = await User.create({ name, email, password });
// //   const token = generateToken(user._id);

// //   res.status(201).json({
// //     success: true,
// //     message: 'Account created successfully',
// //     token,
// //     user,
// //   });
// // });

// // /**
// //  * @desc    Authenticate user & return token
// //  * @route   POST /api/auth/login
// //  * @access  Public
// //  */
// // export const login = asyncHandler(async (req, res) => {
// //   const { email, password } = req.body;

// //   // Explicitly select password since the schema excludes it by default
// //   const user = await User.findOne({ email }).select('+password');

// //   if (!user || !(await user.matchPassword(password))) {
// //     throw new ApiError(401, 'Invalid email or password');
// //   }

// //   const token = generateToken(user._id);

// //   res.status(200).json({
// //     success: true,
// //     message: 'Logged in successfully',
// //     token,
// //     user,
// //   });
// // });

// // /**
// //  * @desc    Log out the current user
// //  * @route   POST /api/auth/logout
// //  * @access  Private
// //  *
// //  * JWTs are stateless, so "logout" is primarily a client-side action
// //  * (discard the token). This endpoint exists for a consistent API contract
// //  * and as the hook point if token blacklisting is added later.
// //  */
// // export const logout = asyncHandler(async (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     message: 'Logged out successfully',
// //   });
// // });

// // /**
// //  * @desc    Get the currently authenticated user's profile
// //  * @route   GET /api/auth/me
// //  * @access  Private
// //  */
// // export const getMe = asyncHandler(async (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     user: req.user,
// //   });
// // });

// // /**
// //  * @desc    Update name/email/avatar for the logged-in user
// //  * @route   PUT /api/auth/me
// //  * @access  Private
// //  */
// // export const updateProfile = asyncHandler(async (req, res) => {
// //   const { name, email, avatar } = req.body;

// //   if (email && email !== req.user.email) {
// //     const emailTaken = await User.findOne({ email });
// //     if (emailTaken) {
// //       throw new ApiError(400, 'That email is already in use');
// //     }
// //   }

// //   const user = await User.findById(req.user._id);
// //   if (name) user.name = name;
// //   if (email) user.email = email;
// //   if (avatar !== undefined) user.avatar = avatar;

// //   await user.save();

// //   res.status(200).json({
// //     success: true,
// //     message: 'Profile updated',
// //     user,
// //   });
// // });

// // /**
// //  * @desc    Change the logged-in user's password
// //  * @route   PUT /api/auth/change-password
// //  * @access  Private
// //  */
// // export const changePassword = asyncHandler(async (req, res) => {
// //   const { currentPassword, newPassword } = req.body;

// //   const user = await User.findById(req.user._id).select('+password');

// //   if (!(await user.matchPassword(currentPassword))) {
// //     throw new ApiError(401, 'Current password is incorrect');
// //   }

// //   user.password = newPassword; // pre('save') hook rehashes it
// //   await user.save();

// //   res.status(200).json({
// //     success: true,
// //     message: 'Password changed successfully',
// //   });
// // });
















// import asyncHandler from 'express-async-handler';
// import User from '../models/User.js';
// import ApiError from '../utils/ApiError.js';
// import generateToken from '../utils/generateToken.js';

// /**
//  * @desc    Register a new user
//  * @route   POST /api/auth/signup
//  * @access  Public
//  */
// export const signup = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new ApiError(400, 'An account with this email already exists');
//   }

//   const user = await User.create({ name, email, password });
//   const token = generateToken(user._id);

//   res.status(201).json({
//     success: true,
//     message: 'Account created successfully',
//     token,
//     user,
//   });
// });

// /**
//  * @desc    Authenticate user & return token
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// export const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   console.log('================ LOGIN DEBUG ================');
//   console.log('Email Entered:', email);
//   console.log('Password Entered:', password);

//   // Get user including password
//   const user = await User.findOne({ email }).select('+password');

//   console.log('User Found:', !!user);

//   if (user) {
//     console.log('Database Email:', user.email);
//     console.log('Stored Password Hash:', user.password);

//     const passwordMatch = await user.matchPassword(password);

//     console.log('Password Match:', passwordMatch);

//     if (!passwordMatch) {
//       console.log('❌ Password comparison failed');
//     }
//   }

//   console.log('=============================================');

//   if (!user || !(await user.matchPassword(password))) {
//     throw new ApiError(401, 'Invalid email or password');
//   }

//   const token = generateToken(user._id);

//   res.status(200).json({
//     success: true,
//     message: 'Logged in successfully',
//     token,
//     user,
//   });
// });

// /**
//  * @desc    Log out the current user
//  * @route   POST /api/auth/logout
//  * @access  Private
//  */
// export const logout = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Logged out successfully',
//   });
// });

// /**
//  * @desc    Get current user
//  * @route   GET /api/auth/me
//  * @access  Private
//  */
// export const getMe = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     success: true,
//     user: req.user,
//   });
// });

// /**
//  * @desc    Update profile
//  * @route   PUT /api/auth/me
//  * @access  Private
//  */
// export const updateProfile = asyncHandler(async (req, res) => {
//   const { name, email, avatar } = req.body;

//   if (email && email !== req.user.email) {
//     const emailTaken = await User.findOne({ email });
//     if (emailTaken) {
//       throw new ApiError(400, 'That email is already in use');
//     }
//   }

//   const user = await User.findById(req.user._id);

//   if (name) user.name = name;
//   if (email) user.email = email;
//   if (avatar !== undefined) user.avatar = avatar;

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: 'Profile updated',
//     user,
//   });
// });

// /**
//  * @desc    Change password
//  * @route   PUT /api/auth/change-password
//  * @access  Private
//  */
// export const changePassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   const user = await User.findById(req.user._id).select('+password');

//   if (!(await user.matchPassword(currentPassword))) {
//     throw new ApiError(401, 'Current password is incorrect');
//   }

//   user.password = newPassword;

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: 'Password changed successfully',
//   });
// });







// export const signup = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   console.log("=========== SIGNUP DEBUG ===========");
//   console.log("Name:", name);
//   console.log("Email:", email);
//   console.log("Password Received:", password);

//   const existingUser = await User.findOne({ email });

//   if (existingUser) {
//     throw new ApiError(400, "An account with this email already exists");
//   }

//   const user = await User.create({ name, email, password });

//   console.log("User Created:", user.email);
//   console.log("===================================");

//   const token = generateToken(user._id);

//   res.status(201).json({
//     success: true,
//     message: "Account created successfully",
//     token,
//     user,
//   });
// });













import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  console.log("=========== SIGNUP DEBUG ===========");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password Received:", password);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  console.log("User Created:", user.email);
  console.log("===================================");

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
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

  console.log("=============== LOGIN DEBUG ===============");
  console.log("Email Entered:", email);
  console.log("Password Entered:", password);

  const user = await User.findOne({ email }).select("+password");

  console.log("User Found:", !!user);

  if (!user) {
    console.log("User not found");
    throw new ApiError(401, "Invalid email or password");
  }

  console.log("Database Email:", user.email);
  console.log("Stored Password Hash:", user.password);

  const passwordMatch = await user.matchPassword(password);

  console.log("Password Match:", passwordMatch);

  if (!passwordMatch) {
    console.log("Password comparison failed");
    throw new ApiError(401, "Invalid email or password");
  }

  console.log("===========================================");

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
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
  const { name, email, avatar } = req.body;

  if (email && email !== req.user.email) {
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

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});