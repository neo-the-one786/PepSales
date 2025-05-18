import 'dotenv/config';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import Notification from './models/Notification.js';

const sendNotification = async (notification) => {
    console.log(`Sending ${notification.type} notification to user ${notification.userID}: ${notification.message}`);
    if (notification.retries < 2 && notification.type !== 'in-app') {
        throw new Error('Simulated send failure');
    }
    notification.status = 'sent';
    await notification.save();
};

const processMessage = async (msg, channel) => {
    const {id} = JSON.parse(msg.content.toString());
    const notification = await Notification.findById(id);
    if (!notification) {
        channel.ack(msg);
        return;
    }
    try {
        await sendNotification(notification);
        channel.ack(msg);
    } catch (err) {
        notification.retries++;
        if (notification.retries >= 3) {
            notification.status = 'failed';
            await notification.save();
            channel.ack(msg);
        } else {
            await notification.save();
            channel.nack(msg, false, true);
        }
    }
};

const startWorker = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('notifications');
    channel.consume('notifications', msg => processMessage(msg, channel));
    console.log('Worker started, waiting for messages...');
};

await startWorker();