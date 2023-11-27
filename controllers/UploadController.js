const EmployeeModel = require('../models/employee');
const fs = require('fs');
const path = require('path');

const uploadAvatar = async (req, res) => {
  const { _id } = req.body;

  if (!req.file) {
    res.status(200).json({ success: false, message: 'Chưa chọn ảnh' });
  }

  const file = req.file;

  try {
    // Lấy thông tin về ảnh cũ từ cơ sở dữ liệu
    const employee = await EmployeeModel.findById(_id);
    let oldImage = '';

    if (employee.avatar) {
      oldImage = employee.avatar;
    }

    const result = await EmployeeModel.findByIdAndUpdate(_id, { avatar: file.filename }, { new: true });
    if (!result) {
      fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', file.filename)), (err) => {});
      return res.status(404).json({ success: false, message: 'Update Failed' });
    }

    if (oldImage) {
      // Xóa ảnh cũ khỏi thư mục
      fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', oldImage)), (err) => {
        if (err) {
          return res.status(404).json({ success: false, message: 'Có lỗi xảy ra khi xóa ảnh: ' + err });
        }
      });
    }

    res.status(201).json({ success: true, message: 'Update Employee Image successfully' });
  } catch (error) {
    // Xóa ảnh khỏi thư mục tạm thời nếu có lỗi
    fs.unlink(path.join(path.join(process.cwd(), 'uploads/avatars', file.filename)), (err) => {});

    return res.status(422).json({ success: false, message: 'Có lỗi xảy ra khi cập nhật: ' + error });
  }
};

module.exports = {
  uploadAvatar,
};
