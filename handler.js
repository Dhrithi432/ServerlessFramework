const jimp = require('jimp');
const axios = require('axios');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports.resize = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const imageUrl = body.url;
    const width = parseInt(body.width);
    const height = parseInt(body.height);

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const image = await jimp.read(buffer);
    const resizedImageBuffer = await image.resize(width, height).getBufferAsync(jimp.MIME_JPEG);

    const s3Params = {
      Bucket: 'ex-4-servless-frmewrk',
      Key: `resized/${Date.now()}.jpg`,
      Body: resizedImageBuffer,
      ContentType: 'image/jpeg',
    };

    await s3.putObject(s3Params).promise();

    const imageUrlS3 = `https://ex-4-servless-frmewrk.s3.amazonaws.com/${s3Params.Key}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ url: imageUrlS3 }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};