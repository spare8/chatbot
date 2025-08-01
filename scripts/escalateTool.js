// tools/escalateTool.js

async function escalateToHuman({issue_description}) {
  console.log('🚨 escalateToHuman CALLED with:', issue_description);
  return {
    status: 'success',
    message: 'This is a test. Escalation was triggered successfully.',
  };
}

module.exports = {
  schema: {
    type: 'function',
    function: {
      name: 'escalateToHuman',
      description: 'Escalate the issue to a human support team member.',
      parameters: {
        type: 'object',
        properties: {
          issue_description: {
            type: 'string',
            description: 'Description of the user issue or complaint.',
          },
        },
        required: ['issue_description'],
      },
    },
  },
  handler: escalateToHuman,
};
