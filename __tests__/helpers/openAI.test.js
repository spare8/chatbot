jest.mock('axios');
const axios = require('axios');
const {createAssistant} = require('../../helpers/openAI');
const {OPENAI_API_KEY} = require('../../config/config');

describe('createAssistant', () => {
  const mockHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'OpenAI-Beta': 'assistants=v2',
  };

  it('should create an assistant with the correct parameters', async () => {
    const input = {
      instructions: 'You are a helpful assistant.',
      name: 'Test Assistant',
      tools: ['code_interpreter'],
      model: 'gpt-3.5-turbo',
    };

    const mockResponse = {data: {id: 'test-assistant-id'}};
    axios.post.mockResolvedValueOnce(mockResponse);

    const result = await createAssistant(input);

    expect(result).toBe('test-assistant-id');
    expect(axios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/assistants',
        {
          instructions: input.instructions,
          name: input.name,
          tools: input.tools,
          model: input.model,
        },
        {headers: mockHeaders},
    );
  });

  it('should throw an error if required parameters are missing', async () => {
    await expect(createAssistant({})).rejects.toThrow(
        'insufficient params passed to create a new assistant',
    );
  });

  it('should return null and log error if OpenAI API fails', async () => {
    const input = {
      instructions: 'Failure scenario.',
      name: 'Fail Assistant',
      tools: ['retrieval'],
      model: 'gpt-3.5-turbo',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValueOnce({response: {data: 'API Error'}});

    const result = await createAssistant(input);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating assistant:',
        'API Error',
    );

    consoleSpy.mockRestore();
  });

  it('should return null and log error if OpenAI API fails', async () => {
    const input = {
      instructions: 'Failure scenario.',
      name: 'Fail Assistant',
      tools: ['retrieval'],
      model: 'gpt-3.5-turbo',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('API Error');
    axios.post.mockRejectedValueOnce(testError);

    const result = await createAssistant(input);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating assistant:',
        'API Error',
    );

    consoleSpy.mockRestore();
  });
});
