// server/models/tool.js
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {TOOL_TYPES} = require('../config/constants');

// Define all supported tool types here or import from a constants file


const toolSchema = new Schema({
  // Unique name of the tool (e.g. "File Search", "Escalation Function")
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // Internal type identifier (used when registering with OpenAI)
  type: {
    type: String,
    required: true,
    enum: TOOL_TYPES,
  },
  // For function-type tools, the name of the function to call
  functionName: {
    type: String,
    default: null,
  },
  // Optional human-readable description of what the tool does
  description: {
    type: String,
    default: '',
    trim: true,
  },
  // Whether this tool is active/enabled in the system
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Tool', toolSchema);
