const authorize = (req, res, next) => {
  const userRole = req.user.role; // Giả sử thông tin về vai trò của người dùng được lưu trong token

  if (userRole !== 'admin') {
    // Thay 'admin' bằng vai trò bạn muốn kiểm tra
    return res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
  }

  // Nếu không có lỗi, tiếp tục
  next();
};

module.exports = authorize;
