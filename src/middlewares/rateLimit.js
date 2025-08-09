// server/src/middleware/rateLimit.js
const FailedAttempt = require('../models/failedAttempt');
const IPAttempt = require('../models/ipAttempt');
const User = require('../models/user');

const rateLimit = async (req, res, next) => {
  const ip = req.ip;
  const { email } = req.body;

  // Check IP-level block
  const ipAttempts = await IPAttempt.countDocuments({
    ip,
    timestamp: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
  });

  if (ipAttempts >= 100) {
    return res.status(429).json({ message: 'Too many requests from this IP' });
  }

  // if (email) {
  //   const user = await User.findOne({ email });
  //   if (user && user.isSuspended && user.suspensionEnd > new Date()) {
  //     return res.status(403).json({ message: 'Account temporarily suspended' });
  //   }
  // }

  next();
};

module.exports = rateLimit;