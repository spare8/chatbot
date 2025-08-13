// server/controller/config/testOpenAI.js
const axios = require('axios');
const {OPENAI_API_KEY} = require('../../../../config/config');

async function testOpenAI(req, res) {
  // Prefer an override from the request (user-typed), otherwise use current env
  const apiKey = (req.body && req.body.OPENAI_API_KEY) || OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ok: false, error: 'Missing OPENAI_API_KEY'});
  }

  try {
    await axios.get('https://api.openai.com/v1/models', {
      headers: {Authorization: `Bearer ${apiKey}`},
      timeout: 7000,
    });
    return res.json({ok: true});
  } catch (e) {
    // Return 200 with ok:false so UI logic is simple
    const msg = e.response?.data?.error?.message || e.message;
    return res.status(200).json({ok: false, error: msg});
  }
}

module.exports = {testOpenAI};
