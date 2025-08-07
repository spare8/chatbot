// __tests__/helpers/s3Helpers.test.js
require('dotenv').config();
const {PassThrough} = require('stream');

// Mock AWS SDK S3Client and capture send calls
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  class S3Client {
    constructor() {}
    send(cmd) {
      return mockSend(cmd);
    }
  }
  const {
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    GetObjectCommand,
  } = jest.requireActual('@aws-sdk/client-s3');
  return {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    GetObjectCommand,
    __sendMock: mockSend,
  };
});

const {
  createFolder,
  fetchAllFolders,
  createFile,
  deleteFile,
  listFilesInFolder,
  streamFileToResponse,
} = require('../../helpers/s3Helpers');
const {__sendMock} = require('@aws-sdk/client-s3');

describe('S3 Helper Functions', () => {
  beforeEach(() => {
    __sendMock.mockReset();
  });

  test('createFolder sends PutObjectCommand with trailing slash', async () => {
    await createFolder({folderName: 'my-folder'});
    expect(__sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {Bucket: process.env.S3_BUCKET_NAME, Key: 'my-folder/'},
        }),
    );
  });

  test('createFolder with trailing slash does not add extra slash', async () => {
    await createFolder({folderName: 'my-folder/'});
    expect(__sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {Bucket: process.env.S3_BUCKET_NAME, Key: 'my-folder/'},
        }),
    );
  });

  test('fetchAllFolders returns prefixes without slash', async () => {
    __sendMock.mockResolvedValue({CommonPrefixes: [{Prefix: 'a/'}, {Prefix: 'b/'}]});
    const folders = await fetchAllFolders();
    expect(folders).toEqual(['a', 'b']);
  });

  test('fetchAllFolders returns empty array if no prefixes', async () => {
    __sendMock.mockResolvedValue({});
    const folders = await fetchAllFolders();
    expect(folders).toEqual([]);
  });

  test('createFile sends PutObjectCommand with correct body', async () => {
    const content = Buffer.from('hello');
    await createFile({folderName: 'fld', fileName: 'file.txt', fileContent: content});
    expect(__sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {Bucket: process.env.S3_BUCKET_NAME, Key: 'fld/file.txt', Body: content},
        }),
    );
  });

  test('deleteFile sends DeleteObjectCommand', async () => {
    await deleteFile('fld', 'file.txt');
    expect(__sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {Bucket: process.env.S3_BUCKET_NAME, Key: 'fld/file.txt'},
        }),
    );
  });

  test('listFilesInFolder returns file names without prefix', async () => {
    __sendMock.mockResolvedValue({Contents: [{Key: 'fld/a.txt'}, {Key: 'fld/b.jpg'}]});
    const files = await listFilesInFolder('fld');
    expect(files).toEqual(['a.txt', 'b.jpg']);
  });

  test('normalize folder name', async () => {
    __sendMock.mockResolvedValue({Contents: [{Key: 'fld/a.txt'}, {Key: 'fld/b.jpg'}]});
    const files = await listFilesInFolder('fld/');
    expect(files).toEqual(['a.txt', 'b.jpg']);
  });

  test('listFilesInFolder returns empty array if no contents', async () => {
    __sendMock.mockResolvedValue({});
    const files = await listFilesInFolder('fld');
    expect(files).toEqual([]);
  });

  describe('streamFileToResponse', () => {
    const makeMockStream = (data) => {
      const stream = new PassThrough();
      stream.end(Buffer.from(data));
      return stream;
    };

    test('streams small file and sets headers', async () => {
      const mockBody = makeMockStream('data');
      __sendMock.mockResolvedValue({
        ContentLength: 4,
        ContentType: 'text/plain',
        Body: mockBody,
      });

      const res = new PassThrough();
      res.status = jest.fn().mockReturnThis();
      res.send = jest.fn();
      res.setHeader = jest.fn();

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));

      await streamFileToResponse('fld', 'file.txt', res);
      await new Promise((resolve) => res.on('end', resolve));

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 4);
      expect(res.setHeader).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="file.txt"',
      );
      expect(chunks).toEqual([Buffer.from('data')]);
    });

    test('streams file with no ContentType', async () => {
      const mockBody = makeMockStream('xyz');
      __sendMock.mockResolvedValue({
        Body: mockBody,
      });

      const res = new PassThrough();
      res.status = jest.fn().mockReturnThis();
      res.send = jest.fn();
      res.setHeader = jest.fn();

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));

      await streamFileToResponse('fld', 'noType.txt', res);
      await new Promise((resolve) => res.on('end', resolve));

      expect(res.setHeader).not.toHaveBeenCalledWith('Content-Type', expect.anything());
      expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 0);
      expect(res.setHeader).toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="noType.txt"',
      );
      expect(chunks).toEqual([Buffer.from('xyz')]);
    });

    test('returns 413 for large file', async () => {
      __sendMock.mockResolvedValue({ContentLength: 10485761});
      const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};

      await streamFileToResponse('fld', 'big.file', res);
      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('File too large'));
    });

    test('handles stream error', async () => {
      const mockBody = new PassThrough();
      __sendMock.mockResolvedValue({
        ContentLength: 4,
        ContentType: 'text/plain',
        Body: mockBody,
      });
      const res = new PassThrough();
      res.status = jest.fn().mockReturnThis();
      res.send = jest.fn();
      res.setHeader = jest.fn();

      await streamFileToResponse('fld', 'file.txt', res);
      const error = new Error('Stream broken');
      mockBody.emit('error', error);
      await new Promise(process.nextTick);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error streaming file');
    });
  });
});
