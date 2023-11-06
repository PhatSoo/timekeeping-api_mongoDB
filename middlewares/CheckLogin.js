const jwt = require('jsonwebtoken');
require('dotenv/config');

// Middleware để kiểm tra xem người dùng đã đăng nhập chưa
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ success: false, message: 'No token provided.' });
  }

  await jwt.verify(token, process.env.JWT_PASS, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
    }

    // Nếu không có lỗi, lưu thông tin người dùng vào req.user và tiếp tục
    req.userId = decoded.id;
    next();
  });
};

module.exports = authenticate;
