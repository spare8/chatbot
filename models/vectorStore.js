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
      toJSON: {
        virtuals: true,
        transform(doc, ret) {
          // if you want your client to see the populated docs under `files` instead of `vsFiles`:
          ret.files = ret.vsFiles;
          delete ret.vsFiles;
          return ret;
        }
      },
      toObject: { virtuals: true },
    },
);

vectorStoreSchema.virtual('vsFiles', {
  ref: 'VSFile',            // the model to use
  localField: 'files',      // this array of openaiId strings
  foreignField: 'openaiId', // in VSFile documents
  justOne: false,           // returns an array
});

const VectorStores = mongoose.model('VectorStore', vectorStoreSchema);
module.exports = VectorStores;
