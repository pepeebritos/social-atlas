const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();
const storage = new Storage();

exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const contentType = object.contentType;
  const fileName = path.basename(filePath);

  // Only process image files inside "photos/"
  if (!contentType.startsWith('image/') || !filePath.startsWith('photos/')) {
    console.log('Not an image or not inside photos/, skipping...');
    return null;
  }

  // Avoid processing thumbnails (prevent loop)
  if (filePath.includes('/thumbnails/')) {
    console.log('Already a thumbnail, skipping...');
    return null;
  }

  const bucket = storage.bucket(object.bucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const thumbnailFileName = `thumb_${fileName}`;
  const thumbnailPath = `photos/thumbnails/${thumbnailFileName}`;
  const tempThumbPath = path.join(os.tmpdir(), thumbnailFileName);

  // Download image to temp folder
  await bucket.file(filePath).download({ destination: tempFilePath });
  console.log('Image downloaded locally to', tempFilePath);

  // Resize using sharp (e.g. 1200px width, auto height)
  await sharp(tempFilePath)
    .resize({ width: 1200 })
    .jpeg({ quality: 80 })
    .toFile(tempThumbPath);
  console.log('Thumbnail created at', tempThumbPath);

  // Upload the thumbnail
  await bucket.upload(tempThumbPath, {
    destination: thumbnailPath,
    metadata: {
      contentType: 'image/jpeg',
    },
  });
  console.log('Thumbnail uploaded to', thumbnailPath);

  // Cleanup temp files
  fs.unlinkSync(tempFilePath);
  fs.unlinkSync(tempThumbPath);

  return null;
});
