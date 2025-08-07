const {applyCacheAndMock} = require('../../setupTests');
const {createAssistant, updateAssistant, getAllAssistants, getAssistantById, deleteAssistant,
  createVectorStore, getAllVectorStores, deleteVectorStore, updateVectorStore, getVectorStoreById,
  createFile, deleteFile,
} = require('../../../server/admin/dbInteractions');
const Assistants = require('../../../models/assistant');
const VectorStores = require('../../../models/vectorStore');
const VSFiles = require('../../../models/VSFile');
const {ObjectId} = require('mongoose').Types;

applyCacheAndMock(Assistants);
applyCacheAndMock(VectorStores);
applyCacheAndMock(VSFiles);

const assistantId = new ObjectId();
const vectorStoreId = new ObjectId();

// Create
describe('createAssistant', () => {
  it('should throw an error if no name provided', async () => {
    const assistantData = {
      openaiId: 'test-openai-id',
      description: 'This is a test assistant',
      instructions: 'Test instructions',
      model: 'gpt-3.5-turbo',
    };
    await expect(createAssistant(assistantData)).rejects.toThrow('Name, model and openaiId are required to create an assistant');
  });
  it('should throw an error if no model provided', async () => {
    const assistantData = {
      name: 'Test Assistant',
      openaiId: 'test-openai-id',
      description: 'This is a test assistant',
      instructions: 'Test instructions',
    };
    await expect(createAssistant(assistantData)).rejects.toThrow('Name, model and openaiId are required to create an assistant');
  });
  it('should throw an error if no model provided', async () => {
    const assistantData = {
      name: 'Test Assistant',
      description: 'This is a test assistant',
      instructions: 'Test instructions',
      model: 'gpt-3.5-turbo',
    };
    await expect(createAssistant(assistantData)).rejects.toThrow('Name, model and openaiId are required to create an assistant');
  });
  it('should create a new assistant with valid data', async () => {
    const assistantData = {
      name: 'Test Assistant',
      openaiId: 'test-openai-id',
      description: 'This is a test assistant',
      instructions: 'Test instructions',
      model: 'gpt-3.5-turbo',
    };
    await createAssistant(assistantData);
    expect(Assistants.create).toHaveBeenCalledWith(assistantData);
  });
});
describe('createVectorStore', () => {
  let vectorStoreData;
  beforeEach(() => {
    vectorStoreData = {
      name: 'Test Vector Store',
      openaiId: 'test-openai-id',
      description: 'This is a test vector store',
      maxChunkSize: 10,
      maxChunkOverlap: 10,
    };
  });
  it('should throw an error if no name provided', async () => {
    vectorStoreData.name = null;
    await expect(createVectorStore(vectorStoreData)).rejects
        .toThrow('Insufficient Params to create a vector store');
  });
  it('should throw an error if no description provided', async () => {
    vectorStoreData.description = null;
    await expect(createVectorStore(vectorStoreData)).rejects
        .toThrow('Insufficient Params to create a vector store');
  });
  it('should throw an error if no openaiId provided', async () => {
    vectorStoreData.openaiId = null;
    await expect(createVectorStore(vectorStoreData)).rejects
        .toThrow('Insufficient Params to create a vector store');
  });
  it('should throw an error if no maxChunkSize provided', async () => {
    vectorStoreData.maxChunkSize = null;
    await expect(createVectorStore(vectorStoreData)).rejects
        .toThrow('Insufficient Params to create a vector store');
  });
  it('should throw an error if no maxChunkSize provided', async () => {
    vectorStoreData.maxChunkSize = null;
    await expect(createVectorStore(vectorStoreData)).rejects
        .toThrow('Insufficient Params to create a vector store');
  });
  it('should create a new vector store with valid data', async () => {
    const vectorStoreData = {
      name: 'Test Vector Store',
      openaiId: 'test-openai-id',
      description: 'This is a test vector store',
      maxChunkOverlap: 10,
      maxChunkSize: 10,
    };
    await createVectorStore(vectorStoreData);
    expect(VectorStores.create).toHaveBeenCalledWith(vectorStoreData);
  });
});
describe('createFile', () => {
  let fileData;
  beforeEach(() => {
    fileData = {
      fileName: 'test-file.txt',
      openaiId: 'test-openai-id',
      vectorStoreId: vectorStoreId,
    };
  });
  it('should throw an error if no fileName provided', async () => {
    fileData.fileName = null;
    await expect(createFile(fileData)).rejects.toThrow('Insufficient Params to create a vector store');
  });
  it('should throw an error if no vectorStoreId provided', async () => {
    fileData.vectorStoreId = null;
    await expect(createFile(fileData)).rejects.toThrow('Insufficient Params to create a vector store');
  });
  it('should throw an error if no openaiId provided', async () => {
    fileData.openaiId = null;
    await expect(createFile(fileData)).rejects.toThrow('Insufficient Params to create a vector store');
  });
  it('should create a new file with valid data', async () => {
    await createFile(fileData);
    expect(VSFiles.create).toHaveBeenCalledWith(fileData);
    expect(VectorStores.findOneAndUpdate).toHaveBeenCalledWith(
        {openaiId: vectorStoreId},
        {$push: {files: fileData.openaiId}},
    );
  });
});

// Update
describe('updateAssistant', () => {
  it('should update an existing assistant with valid data', async () => {
    const updateData = {
      name: 'Updated Assistant',
      description: 'Updated description',
      instructions: 'Updated instructions',
      model: 'gpt-4',
      vectorStoreId: 'test-vector-store-id',
    };
    await updateAssistant({assistantId, ...updateData});
    expect(Assistants.findOneAndUpdate).toHaveBeenCalledWith({openaiId: assistantId}, updateData, {new: true});
  });
});
describe('updateVectorStore', () => {
  it('should update an existing assistant with valid data', async () => {
    const updateData = {
      name: 'Updated Assistant',
      description: 'Updated description',
    };
    await updateVectorStore({vectorStoreId, ...updateData});
    expect(VectorStores.findOneAndUpdate).toHaveBeenCalledWith({openaiId: vectorStoreId}, updateData, {new: true});
  });
});

// Fetch
describe('getAssistantById', () => {
  it('should retrieve an assistant by ID', async () => {
    await getAssistantById({assistantId});
    expect(Assistants.findOne).toHaveBeenCalledWith({openaiId: assistantId});
  });
});
describe('getVectorStoreById', () => {
  it('should retrieve an VS by ID', async () => {
    await getVectorStoreById({vectorStoreId});
    expect(VectorStores.findOne).toHaveBeenCalledWith({openaiId: vectorStoreId});
  });
});
describe('getAllAssistants', () => {
  it('should retrieve all assistants', async () => {
    await getAllAssistants();
    expect(Assistants.find).toHaveBeenCalledWith({isDeleted: {$ne: true}});
  });
});
describe('getAllVectorStores', () => {
  it('should retrieve all assistants', async () => {
    await getAllVectorStores();
    expect(VectorStores.find).toHaveBeenCalledWith({isDeleted: {$ne: true}});
  });
});

// Delete
describe('deleteAssistant', () => {
  it('should delete an assistant by ID', async () => {
    await deleteAssistant({assistantId});
    expect(Assistants.findOneAndUpdate).toHaveBeenCalledWith({openaiId: assistantId}, {isDeleted: true});
  });
});
describe('deleteVectorStore', () => {
  it('should delete a VS by ID', async () => {
    await deleteVectorStore({vectorStoreId});
    expect(VectorStores.findOneAndUpdate).toHaveBeenCalledWith({openaiId: vectorStoreId}, {isDeleted: true});
  });
});
describe('deleteFile', () => {
  it('should delete a file and remove it from the vector store', async () => {
    const fileId = 'test-file-id';
    await deleteFile({vectorStoreId, fileId});
    expect(VSFiles.findOneAndUpdate).toHaveBeenCalledWith({openaiId: fileId}, {isDeleted: true});
    expect(VectorStores.findOneAndUpdate).toHaveBeenCalledWith(
        {openaiId: vectorStoreId},
        {$pull: {files: fileId}},
    );
  });
});


