const canvas = require('canvas');
const { Image, Canvas } = canvas;
const fs = require('fs');
const sharp = require('sharp');
const face_api = require('face-api.js');
const path = require('path');

face_api.env.monkeyPatch({ Canvas, Image });

const loadingModels = async () => {
  await face_api.nets.ssdMobilenetv1.loadFromDisk('./ai_models');
  await face_api.nets.faceLandmark68Net.loadFromDisk('./ai_models');
  await face_api.nets.faceRecognitionNet.loadFromDisk('./ai_models');
  await face_api.nets.tinyFaceDetector.loadFromDisk('./ai_models');
};

const convert2PNG = async (apiEndpoint) => {
  return sharp(apiEndpoint)
    .png()
    .rotate()
    .toBuffer()
    .then(async (pngBuffer) => {
      const img = await canvas.loadImage(pngBuffer);
      const imgDetection = await face_api.detectSingleFace(img, new face_api.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (imgDetection) {
        return imgDetection.descriptor;
      }
      return null;
    });
};

const compare2Images = async (imageName1, imageName2) => {
  // Load face recognition models
  await loadingModels();

  const imageURL1 = path.join(process.cwd(), 'uploads', 'avatars', imageName1);
  const imageURL2 = path.join(process.cwd(), imageName2);

  try {
    const image1 = await convert2PNG(imageURL1);
    const image2 = await convert2PNG(imageURL2);

    if (image1 && image2) {
      const distance = face_api.euclideanDistance(image1, image2);

      if (distance < 0.5) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { compare2Images };
