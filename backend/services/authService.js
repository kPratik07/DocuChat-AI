import User from "../models/userModel.js";
import { generateToken } from "../utils/jwtUtil.js";

export const registerUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists");

  const user = await User.create({ name, email, password });
  return { ...user._doc, token: generateToken(user) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid credentials");
  }
  return { ...user._doc, token: generateToken(user) };
};
