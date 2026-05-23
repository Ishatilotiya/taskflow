const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entity: { type: String }, // 'task', 'project', 'member'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  meta: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);