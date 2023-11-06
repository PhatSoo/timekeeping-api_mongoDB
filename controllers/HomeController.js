const EmployeeModel = require('../models/employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config');

// // Register
// const register = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const existingEmployee = await EmployeeModel.findOne({ email });
//     if (existingEmployee) {
//       return res.status(422).json({ success: false, message: 'Email already exists.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newEmployee = new Employee({ name, email, password: hashedPassword });
//     await newEmployee.save();

//     res.status(201).json({ success: true, message: `Employee registered with ID: ${newEmployee.id}` });
//   } catch (error) {
//     res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
//   }
// };

// Login

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingEmployee = await EmployeeModel.findOne({ email });
    if (!existingEmployee || !(await bcrypt.compare(password, existingEmployee.password))) {
      return res.status(200).json({ success: false, message: 'Thông tin đăng nhập chưa chính xác.' });
    }

    const token = jwt.sign({ id: existingEmployee.id }, process.env.JWT_PASS, { expiresIn: '1h' });

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: `An error occurred: ${error.message}` });
  }
};

module.exports = {
  //   register,
  login,
};
