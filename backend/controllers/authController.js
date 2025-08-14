import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await authService.registerUser({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await authService.loginUser({ email, password });
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
