require('dotenv/config');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const createCurrentDateFolder = () => {
  // create folder current date
  const date = new Date();
  const options = { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' };
  const dateString = date.toLocaleDateString('vi-VN', options);
  const currentDate = dateString.split('/').join('-');

  return currentDate;
};

const cloudinaryUploader = async (file, url) => {
  let urlFolder = '';
  try {
    if (url === 'avatars') {
      urlFolder = `${process.env.CLOUDINARY_FOLDER}/${url}`;
    } else {
      urlFolder = `${process.env.CLOUDINARY_FOLDER}/${url}/${createCurrentDateFolder()}`;
    }

    return await cloudinary.uploader.upload(file.path, { use_filename: true, folder: urlFolder });
  } catch (error) {
    console.error(error);
  }
};

const cloudinaryMover = async (oldImageURL) => {
  try {
    const public_id = oldImageURL.split('/').slice(-1)[0].split('.')[0];
    const from_public_id = `${process.env.CLOUDINARY_FOLDER}/avatars/${public_id}`;
    const to_public_id = `${process.env.CLOUDINARY_FOLDER}/oldAvatars/${public_id}`;
    return await cloudinary.uploader.rename(from_public_id, to_public_id);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { cloudinaryUploader, cloudinaryMover };
