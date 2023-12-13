const canvas = require('canvas');
const { Image, Canvas } = canvas;
const sharp = require('sharp');
const face_api = require('face-api.js');
const path = require('path');
const fs = require('fs');

face_api.env.monkeyPatch({ Canvas, Image });

const loadingModels = async () => {
  await face_api.nets.ssdMobilenetv1.loadFromDisk('./ai_models');
  await face_api.nets.faceLandmark68Net.loadFromDisk('./ai_models');
  await face_api.nets.faceRecognitionNet.loadFromDisk('./ai_models');
  await face_api.nets.tinyFaceDetector.loadFromDisk('./ai_models');
};

const convert2PNGinLocal = async (apiEndpoint) => {
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

const convert2PNGinCloud = (apiEndpoint) => {
  return fetch(apiEndpoint)
    .then((response) => response.blob())
    .then(async (blob) =>
      sharp(await blob.arrayBuffer())
        .png()
        .rotate()
        .toBuffer()
    )
    .then(async (pngBuffer) => {
      const img = await canvas.loadImage(pngBuffer);
      const imgDetection = await face_api.detectSingleFace(img, new face_api.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (imgDetection) {
        return imgDetection.descriptor;
      }
      return null;
    });
};

const compare2Images = async (employeeImage, captureImage) => {
  // Load face recognition models
  await loadingModels();

  try {
    const image1 = await convert2PNGinCloud(employeeImage);
    const image2 = await convert2PNGinLocal(captureImage);

    if (image1 && image2) {
      const distance = face_api.euclideanDistance(image1, image2);

      if (distance < 0.5) {
        return distance;
      }
    }

    return -1;
  } catch (error) {
    console.error(error);
  }
};

const checkRecognizeFace = async (buffer) => {
  await loadingModels();

  try {
    return sharp(buffer)
      .png()
      .rotate()
      .toBuffer()
      .then(async (pngBuffer) => {
        const img = await canvas.loadImage(pngBuffer);
        const imgDetection = await face_api.detectSingleFace(img, new face_api.TinyFaceDetectorOptions());
        if (imgDetection) {
          return true;
        }
        return false;
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { compare2Images, checkRecognizeFace };
