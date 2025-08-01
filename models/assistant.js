// server/models/assistant.js
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {SUPPORTED_MODELS, DEFAULT_MODEL} = require('../config/constants.js');

const assistantSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      openaiId: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
      instructions: {
        type: String,
        default: '',
      },
      model: {
        type: String,
        required: true,
        enum: Object.values(SUPPORTED_MODELS),
        default: DEFAULT_MODEL,
      },
      temperature: {
        type: Number,
        default: 0.7,
      },
      vectorStoreId: {
        type: String,
      },
      isDeleted: {
        type: Boolean,
      },
    },
    {
      timestamps: true,
    },
);

const Assistants = mongoose.model('Assistant', assistantSchema);
module.exports = Assistants;

