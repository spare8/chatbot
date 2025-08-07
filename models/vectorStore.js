// server/models/vectorStore.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const vectorStoreSchema = new Schema(
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
        required: true,
      },
      maxChunkOverlap: {
        type: Number,
        required: true,
      },
      maxChunkSize: {
        type: Number,
        required: true,
      },
      files: [
        {
          type: String,
        },
      ],
      isDeleted: {
        type: Boolean,
      },
    },
    {
      timestamps: true,
    },
);

const VectorStores = mongoose.model('VectorStore', vectorStoreSchema);
module.exports = VectorStores;
