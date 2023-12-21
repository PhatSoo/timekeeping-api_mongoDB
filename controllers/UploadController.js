const EmployeeModel = require('../models/employee');
const fs = require('fs');
const path = require('path');
const { cloudinaryUploader, cloudinaryMover } = require('../config/cloudinary');

const uploadAvatar = async (req, res) => {
  const { _id } = req.body;
  const file = req.file;

  if (!file) {
    res.status(200).json({ success: false, message: 'Chưa chọn ảnh' });
  }

  try {
    const uploaded = await cloudinaryUploader(file, 'avatars');

    if (uploaded) {
      let oldImage = '';
      const employee = await EmployeeModel.findById(_id);

      if (employee.avatar) {
        oldImage = employee.avatar;
      }
      const result = await EmployeeModel.findByIdAndUpdate(_id, { avatar: uploaded.url }, { new: true });

      if (!result) {
        fs.unlink(path.join(path.join(process.cwd(), 'uploads', file.filename)), (err) => {});
        return res.status(404).json({ success: false, message: 'Upload Avatar Failed!' });
      }

      // Lấy thông tin về ảnh cũ từ cơ sở dữ liệu
      if (oldImage) {
        // Chuyển avatar cũng sang file tạm
        await cloudinaryMover(oldImage);
      }
    } else {
      return res.status(500).json({ success: false, message: 'Upload Avatar Failed!' });
    }

    fs.unlink(path.join(path.join(process.cwd(), 'uploads', file.filename)), (err) => {});
    res.status(201).json({ success: true, message: 'Update Employee Avatar successfully' });
  } catch (error) {
    // Xóa ảnh khỏi thư mục tạm thời nếu có lỗi
    fs.unlink(path.join(path.join(process.cwd(), 'uploads', file.filename)), (err) => {});

    return res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi cập nhật: ' + error });
  }
};

module.exports = {
  uploadAvatar,
};
