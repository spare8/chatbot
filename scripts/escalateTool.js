// tools/escalateTool.js

function escalateToHuman({issueDescription}) {
  console.log('🚨 escalateToHuman CALLED with:', issueDescription);
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
          issueDescription: {
            type: 'string',
            description: 'Description of the user issue or complaint.',
          },
        },
        required: ['issueDescription'],
      },
    },
  },
  handler: escalateToHuman,
};
