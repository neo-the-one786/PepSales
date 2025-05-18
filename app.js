import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import Notification from './models/Notification.js';

const app = express();
app.use(express.json());
const QUEUE_NAME = 'notifications';
let channel;

async function connectQueue() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'));

connectQueue();

app.post('/notifications', async (req, res) => {
    const {userID, type, message} = req.body;
    if (!userID || !type || !message) {
        return res.status(400).json({error: 'Missing required fields'});
    }
    if (!['email', 'sms', 'in-app'].includes(type)) {
        return res.status(400).json({error: 'Invalid notification type'});
    }
    const notification = new Notification({userID, type, message});
    await notification.save();
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({id: notification._id})));
    res.status(202).json({message: 'Notification queued', notificationId: notification._id});
});

app.get('/users/:id/notifications', async (req, res) => {
    const notifications = await Notification.find({userID: req.params.id}).sort({createdAt: -1});
    res.json(notifications);
});

app.listen(process.env.PORT, () => console.log(`API running on port ${process.env.PORT}`));