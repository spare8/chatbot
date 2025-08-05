const {applyCacheAndMock} = require('../../setupTests');
const {createAssistant, updateAssistant, getAllAssistants, getAssistantById, deleteAssistant} = require('../../../server/admin/dbInteractions');
const Assistants = require('../../../models/assistant');
const {ObjectId} = require('mongoose').Types;

applyCacheAndMock(Assistants);

const assistantId = new ObjectId();

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
    expect(Assistants.findByIdAndUpdate).toHaveBeenCalledWith(assistantId, updateData, {new: true});
  });
});

describe('getAssistantById', () => {
  it('should retrieve an assistant by ID', async () => {
    await getAssistantById({assistantId});
    expect(Assistants.findById).toHaveBeenCalledWith(assistantId);
  });
});

describe('getAllAssistants', () => {
  it('should retrieve all assistants', async () => {
    await getAllAssistants();
    expect(Assistants.find).toHaveBeenCalledWith({isDeleted: {$ne: true}});
  });
});

describe('deleteAssistant', () => {
  it('should delete an assistant by ID', async () => {
    await deleteAssistant({assistantId});
    expect(Assistants.findByIdAndUpdate).toHaveBeenCalledWith(assistantId, {isDeleted: true});
  });
});
