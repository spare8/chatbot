const SUPPORTED_MODELS = {
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'gpt-4': 'gpt-4',
  'gpt-4o': 'gpt-4o',
};
const DEFAULT_MODEL = SUPPORTED_MODELS['gpt-3.5-turbo'];
const TOOL_TYPES = ['file_search', 'function'];


module.exports = {SUPPORTED_MODELS, DEFAULT_MODEL, TOOL_TYPES};
