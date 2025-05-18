import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'in-app'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    retries: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Notification', notificationSchema);