import {OpenAI} from 'openai';

import OPEN_AI_API_TOKEN from '../config/config.js';

console.log('Loaded key:', OPEN_AI_API_TOKEN);
const openai = new OpenAI({
  apiKey: OPEN_AI_API_TOKEN,
});

const create = async () => {
  const assistant = await openai.beta.assistants.create({
    name: 'My CLI Assistant',
    instructions: 'You are a helpful assistant for CLI chatbot queries.',
    tools: [], // e.g., [{ type: "code_interpreter" }] if you want tools
    model: 'gpt-3.5-turbo', // or gpt-3.5-turbo for lower cost
  });

  console.log('✅ Assistant created:');
  console.log('ID:', assistant.id);
};

create();
