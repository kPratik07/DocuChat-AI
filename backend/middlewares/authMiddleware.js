const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Please log in to continue.' });
    }

    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User account not found.' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
};

module.exports = { protect };
