// server/models/thread.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const ThreadSchema = new Schema({
  // Stable room key for WebSocket routing
  roomId: {type: String, required: true, unique: true, index: true},

  // OpenAI linkage
  assistantOpenAIId: {type: String, required: true, index: true}, // asst_*
  threadOpenAIId: {type: String, default: null}, // thread_*

  // Optional ownership/cosmetics
  userId: {type: String, default: null}, // if you have auth
  title: {type: String, default: ''},

  // Fast list/sorting
  lastMessageAt: {type: Date, default: Date.now, index: true},
  archived: {type: Boolean, default: false, index: true},

  // Recent message cache (ids only; full messages live in Message collection)
  recentMessageIds: {type: [Schema.Types.ObjectId], default: []}, // capped by Message hook
  lastMessageId: {type: Schema.Types.ObjectId, default: null},
  messagesCount: {type: Number, default: 0},

  metadata: {type: Schema.Types.Mixed, default: {}},
}, {timestamps: true});

module.exports = mongoose.model('Thread', ThreadSchema);
