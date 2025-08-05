// server/models/assistant.js
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {SUPPORTED_MODELS, DEFAULT_MODEL} = require('../config/constants.js');

// const assistantSchema = new Schema(
//     {
//       name: {
//         type: String,
//         required: true,
//       },
//       openaiId: {
//         type: String,
//         required: true,
//       },
//       description: {
//         type: String,
//         default: '',
//       },
//       instructions: {
//         type: String,
//         default: '',
//       },
//       model: {
//         type: String,
//         required: true,
//         enum: Object.values(SUPPORTED_MODELS),
//         default: DEFAULT_MODEL,
//       },
//       temperature: {
//         type: Number,
//         default: 0.7,
//       },
//       vectorStoreId: {
//         type: String,
//       },
//       isDeleted: {
//         type: Boolean,
//       },
//     },
//     {
//       timestamps: true,
//     },
// );

// const Assistants = mongoose.model('Assistant', assistantSchema);
// module.exports = Assistants;


// // server/models/assistant.js
// const mongoose = require('mongoose');
// const { Schema } = mongoose;
// const { SUPPORTED_MODELS, DEFAULT_MODEL } = require('../config/constants.js');

// Sub-schema for tools configuration
const toolSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  // for function-type tools (e.g. escalate)
  function: {
    type: String,
    default: null,
  },
}, {_id: false});

const assistantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  openaiId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  instructions: {
    type: String,
    default: '',
  },
  model: {
    type: String,
    enum: Object.values(SUPPORTED_MODELS),
    default: DEFAULT_MODEL,
    required: true,
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 2,
  },
  tools: {
    type: [toolSchema],
    default: [],
  },
  // dynamic resource mapping for registered tools
  toolResources: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {},
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assistant', assistantSchema);

