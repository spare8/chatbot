const SUPPORTED_MODELS = {
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'gpt-4': 'gpt-4',
  'gpt-4o': 'gpt-4o',
};
const DEFAULT_MODEL = SUPPORTED_MODELS['gpt-3.5-turbo'];
const TOOL_TYPES = ['file_search', 'function'];

const LOGGING_COLORS = {
  RED: '\x1b[31m%s\x1b[0m',
  GREEN: '\x1b[32m%s\x1b[0m',
  YELLOW: '\x1b[33m%s\x1b[0m',
  BLUE: '\x1b[34m%s\x1b[0m',
  MAGENTA: '\x1b[35m%s\x1b[0m',
  CYAN: '\x1b[36m%s\x1b[0m',
};

module.exports = {SUPPORTED_MODELS, DEFAULT_MODEL, TOOL_TYPES, LOGGING_COLORS};
