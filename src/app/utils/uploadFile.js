const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const config = require('../../config');

// Initialize the S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: config.digitalOcean.endpoint,
  region: "nyc3", // DigitalOcean Spaces uses nyc3 as region
  credentials: {
    accessKeyId: config.digitalOcean.accessKeyId,
    secretAccessKey: config.digitalOcean.secretAccessKey,
  },
});

const uploadFile = async (file) => {
  try {
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Generate unique filename
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `files/${uuidv4()}.${fileExtension}`;

    // Define the upload parameters
    const uploadParams = {
      Bucket: config.digitalOcean.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    // Upload the file to the Space
    const command = new PutObjectCommand(uploadParams);
    
    try {
      await s3Client.send(command);

      // Generate public URL
      const imageUrl = `${config.digitalOcean.endpoint}/${config.digitalOcean.bucket}/${fileName}`;

      return {
        success: true,
        url: imageUrl,
      };
    } catch (uploadError) {
      console.error("Error uploading file:", uploadError);
      return {
        success: false,
        error: `DigitalOcean Spaces upload failed: ${uploadError.message || 'Unknown error'}`,
      };
    }
  } catch (error) {
    console.error("Unexpected error in uploadFile:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
};

module.exports = { uploadFile };
