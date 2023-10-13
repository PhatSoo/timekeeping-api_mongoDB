const jwt = require('jsonwebtoken');

// Middleware để kiểm tra xem người dùng đã đăng nhập chưa
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ success: false, message: 'No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
    }

    // Nếu không có lỗi, lưu thông tin người dùng vào req.user và tiếp tục
    req.user = decoded;
    next();
  });
};

module.exports = authenticate;
