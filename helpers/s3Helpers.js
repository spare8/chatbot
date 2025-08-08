const contentDisposition = require('content-disposition');
const {S3Client, PutObjectCommand, ListObjectsV2Command, CopyObjectCommand,
  DeleteObjectCommand, GetObjectCommand} = require('@aws-sdk/client-s3');
const {AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME} = require('../config/config');

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Define your S3 bucket name in .env as S3_BUCKET_NAME
const bucketName = S3_BUCKET_NAME;

// Maximum allowable file size for streaming (in bytes)
// const MAX_STREAM_SIZE = parseInt(process.env.MAX_S3_STREAM_SIZE || '10485760'); // default 10MB
const MAX_STREAM_SIZE = '10485760'; // default 10MB

/**
 * Creates a "folder" in S3 by making a zero-byte object with a trailing slash.
 * @param {string} folderName
 */
async function createFolder({folderName}) {
  const key = folderName.endsWith('/') ? folderName : `${folderName}/`;
  await s3Client.send(new PutObjectCommand({Bucket: bucketName, Key: key}));
}

/**
 * Lists all folders (top-level prefixes) in the bucket.
 * @returns {Promise<string[]>}
 */
async function fetchAllFolders() {
  const cmd = new ListObjectsV2Command({Bucket: bucketName, Delimiter: '/'});
  const resp = await s3Client.send(cmd);
  return resp.CommonPrefixes?.map((p) => p.Prefix.replace(/\/$/, '')) || [];
}

/**
 * Uploads a file to the specified folder.
 * @param {string} folderName
 * @param {string} fileName
 * @param {*} fileContent
 */
async function createFile({folderName, fileName, fileContent}) {
  const key = `${folderName}/${fileName}`;
  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  }));
}

/**
 * Lists all files (objects) in a given folder.
 * @param {string} folderName
 * @returns {Promise<string[]>}
 */
async function listFilesInFolder(folderName) {
  const prefix = folderName.endsWith('/') ? folderName : `${folderName}/`;
  const cmd = new ListObjectsV2Command({Bucket: bucketName, Prefix: prefix});
  const resp = await s3Client.send(cmd);
  return resp.Contents?.map((obj) => obj.Key.replace(prefix, '')) || [];
}

/**
 * Streams a file directly to an Express.js response.
 * Automatically checks file size against MAX_STREAM_SIZE.
 * @param {string} folderName
 * @param {string} fileName
 * @param {object} res - Express.js response object
 */
async function streamFileToResponse({folderName, fileName, res}) {
  const key = `${folderName}/${fileName}`;
  const cmd = new GetObjectCommand({Bucket: bucketName, Key: key});
  const resp = await s3Client.send(cmd);

  const contentLength = resp.ContentLength || 0;
  if (contentLength > MAX_STREAM_SIZE) {
    res.status(413).send(`File too large to stream (${contentLength} bytes).`);
    return;
  }

  // Set headers for client
  if (resp.ContentType) {
    res.setHeader('Content-Type', resp.ContentType);
  }
  res.setHeader('Content-Length', contentLength);
  const disposition = contentDisposition(fileName);
  res.setHeader('Content-Disposition', disposition);

  // Pipe the S3 object stream to response
  const stream = resp.Body;
  stream.pipe(res);
  stream.on('error', (err) => {
    res.status(500).send('Error streaming file');
  });
}

/**
 * Renames an entire “folder” in S3 by copying each object
 * under the old prefix into a new prefix, then deleting the old ones.
 */
async function renameFolder({oldFolderName, newFolderName}) {
  // 1) List everything under the old prefix
  const listCmd = new ListObjectsV2Command({Bucket: bucketName, Prefix: oldFolderName});
  const listResp = await s3Client.send(listCmd);
  const items = listResp.Contents || [];

  // 2) Copy each object to the new prefix
  for (const {Key: oldKey} of items) {
    const newKey = oldKey.replace(oldFolderName, newFolderName);
    await s3Client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey,
    }));
  }

  // 3) Delete the originals
  for (const {Key: oldKey} of items) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldKey,
    }));
  }
}

async function renameFile({folderName, oldFileName, newFileName}) {
  const prefix = folderName.endsWith('/') ? folderName : `${folderName}/`;
  const oldKey = `${prefix}${oldFileName}`;
  const newKey = `${prefix}${newFileName}`;

  // 1) Copy the object to the new key
  await s3Client.send(new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${oldKey}`,
    Key: newKey,
  }));

  // 2) Delete the original
  await s3Client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: oldKey,
  }));
}

async function deleteFolder({folderName}) {
  const oldFolderName = folderName.endsWith('/') ?
      folderName : `${folderName}/`;
  const newFolderName = folderName.endsWith('/') ?
      `${folderName.slice(0, -1)}-deleted/` : `${folderName}-deleted/`;
  await renameFolder({oldFolderName, newFolderName});
}
async function deleteFile({fileName, folderName}) {
  await renameFile({folderName, oldFileName: fileName, newFileName: `${fileName}-deleted`});
}

module.exports = {
  createFolder,
  fetchAllFolders,
  createFile,
  listFilesInFolder,
  streamFileToResponse,
  deleteFolder,
  deleteFile,
};
