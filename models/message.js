const mongoose = require('mongoose');
const {Schema} = mongoose;

const UsageSchema = new Schema(
    {
      prompt_tokens: {type: Number, default: 0},
      completion_tokens: {type: Number, default: 0},
      total_tokens: {type: Number, default: 0},
    },
    {_id: false},
);

const MessageSchema = new Schema(
    {
    // Link to the thread
      threadId: {
        type: Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
        index: true,
      },

      // Who sent it
      role: {
        type: String,
        enum: ['user', 'assistant', 'system', 'tool'],
        required: true,
        index: true,
      },

      content: {
        type: String,
        required: true,
        trim: true,
      },

      // Minimal sender/ownership info
      userId: {type: String, default: null, index: true},
      assistantId: {type: String, default: null, index: true}, // openai asst_* id

      // Optional extras
      attachments: {type: [Schema.Types.Mixed], default: []},

      status: {
        type: String,
        enum: ['queued', 'in_progress', 'completed', 'error'],
        default: 'completed',
        index: true,
      },

      runId: {type: String, default: null}, // openai run_* id
      usage: {type: UsageSchema, default: undefined},

      error: {type: Schema.Types.Mixed, default: null},
    },
    {timestamps: true},
);

// For fast per-thread pagination
MessageSchema.index({threadId: 1, _id: 1});
MessageSchema.index({threadId: 1, createdAt: -1});

module.exports = mongoose.model('Message', MessageSchema);
