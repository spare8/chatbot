const {createAssistant, listAssistants, retrieveAssistant} = require('../helpers/openAI');

async function test() {
  // Create
  // const newAssistant = await createAssistant({
  //   instructions: 'You are a helpful assistant for CLI chatbot queries.',
  //   name: 'My CLI Assistant',
  //   tools: [],
  //   model: 'gpt-3.5-turbo',
  // });
  // console.log('New Assistant ID:', newAssistant);

  // List
  // const allAssistants = await listAssistants();
  // console.log('All Assistants:', allAssistants);

  const testAssistant = await retrieveAssistant({assistantId: 'asst_cB2hp1D6pyINPOg0uGU08m5Y'});
  console.log(testAssistant);
}

test();
