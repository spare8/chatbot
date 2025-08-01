const mongoose = require('mongoose');
const {Schema} = mongoose;

const errorLog = new Schema({
  source: {
    type: String,
  },
  name: {
    type: String,
  },
  message: {
    type: String,
  },
  error: {
    type: Object,
  },
  stack: {
    type: String,
  },
  code: {
    type: String,
  },
  isExceptionError: {
    type: Boolean,
  },
  data: {
    type: Object,
  },
  userId: {
    type: Schema.Types.ObjectId,
  },
  mobileNumber: {
    type: String,
  },
}, {
  timestamps: true,
});

const errorLogModel = mongoose.model('errorLogs', errorLog);
module.exports = errorLogModel;
