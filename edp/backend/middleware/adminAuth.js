// backend/middleware/adminAuth.js
const authMiddleware = require('./authMiddleware');

function adminAuth(req, res, next) {
  // First run the normal authMiddleware
  authMiddleware(req, res, () => {
    // Then check if role is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    next();
  });
}

module.exports = adminAuth;
