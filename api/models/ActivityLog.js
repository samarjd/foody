const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const activityLogSchema = new Schema(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String
  },
  action: {
    type: String,
    required: true
  }
},
{
    timestamps: true,
}
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
