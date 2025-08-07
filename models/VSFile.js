// server/models/VSFile.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const VSfileSchema = new Schema(
    {
      fileName: {
        type: String,
        required: true,
      },
      openaiId: {
        type: String,
        required: true,
      },
      vectorStoreId: {
        type: String,
        default: '',
      },
      isDeleted: {
        type: Boolean,
      },
    },
    {
      timestamps: true,
    },
);

const VSFiles = mongoose.model('VSFile', VSfileSchema);
module.exports = VSFiles;
