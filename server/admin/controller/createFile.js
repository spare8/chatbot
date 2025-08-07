const {createFile: createFileS3Helper} = require('../../../helpers/s3Helpers');
const {uploadFileToOpenAI, addFileToVectorStore} = require('../../../helpers/openAI');
const {createFile: createFileDBInteraction} = require('../dbInteractions');

async function createFile({file, body: {vectorStoreId}}, res) {
    if (!file || !file.buffer || !file.originalname || !vectorStoreId) {
        console.log({file, vectorStoreId});
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('HERE');
    const fileName = file.originalname
    const fileContent = file.buffer;
    const openaiId = await uploadFileToOpenAI({buffer: file.buffer, fileName});
    await Promise.all([
        addFileToVectorStore({fileId: openaiId, vectorStoreId}),
        createFileDBInteraction({fileName, openaiId, vectorStoreId}),
        createFileS3Helper({
            folderName: vectorStoreId, 
            fileName, 
            fileContent}),
    ]);
    
    return res.status(200).json({ message: 'File uploaded successfully' });
}

module.exports = { createFile };