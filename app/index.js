const path = require('path');
const {
  uploadFileToOpenAI,
  listAllFiles,
  deleteFileById,
} = require('../helpers/openAI');


(async () => {
  try {
    // 1. Upload a file
    const filePath = path.join(__dirname, '../..', 'knowledge_bank_material', 'test2.faqs.json');

    const uploadedFile = await uploadFileToOpenAI(filePath);
    console.log('✅ Uploaded File:', uploadedFile);

    // 2. List all files
    const allFiles = await listAllFiles();
    console.log('📄 All Files:');
    allFiles.forEach((file) => {
      console.log(`• ${file.filename} (${file.id})`);
    });

    // 3. Delete the file we just uploaded
    const deleted = await deleteFileById(uploadedFile.id);
    console.log('Deleted File:', deleted);
  } catch (err) {
    console.error('Test script failed:', err.message);
  }
})();

