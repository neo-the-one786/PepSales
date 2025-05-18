# PepSales Notification Service

This is a simple notification microservice I built using Express, MongoDB, and RabbitMQ. It lets you queue notifications for users—like emails, SMS, or in-app messages—and then processes them asynchronously using a worker. It also tracks whether notifications were sent successfully or if they failed, and retries sending if needed.

---

## What it does

* Provides an API to add new notifications and fetch existing ones
* Stores all notifications in MongoDB
* Uses RabbitMQ as a message queue to process notifications in the background
* A worker script that sends notifications and retries if sending fails
* Tracks notification status as `pending`, `sent`, or `failed`

---

## Technologies used

* Node.js with Express for the API
* MongoDB with Mongoose for database
* RabbitMQ with amqplib for messaging
* dotenv to handle environment variables

---

## Project layout

```
.
├── models/
│   └── Notification.js      # Notification schema  
├── app.js                   # Main Express server  
├── worker.js                # Worker that processes notifications  
├── .env                     # Environment variables  
├── package.json             # Project dependencies and scripts  
└── README.md                # This document  
```

---

## Setting up

Create a `.env` file with these variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/notifications
RABBITMQ_URL=amqp://localhost
```

---

## How to run

1. Clone the repository:

   ```bash
   git clone https://your.repo.url
   cd PepSales
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB and RabbitMQ services:

   ```bash
   sudo service mongod start
   sudo service rabbitmq-server start
   ```

4. Run the API server:

   ```bash
   node app.js
   ```

5. In another terminal, start the worker process:

   ```bash
   node worker.js
   ```

---

## API Endpoints

---

### POST /notifications

Use this to queue a new notification.

**Request body example:**

```json
{
  "userID": "user1",
  "type": "email",
  "message": "Hello from Notification Service"
}
```

**Response example:**

```json
{
  "message": "Notification queued",
  "notificationId": "6829ff0e46eb8c58c3945e06"
}
```

---

### GET /users/\:id/notifications

Fetch all notifications for a specific user.

**Example request:**

`GET /users/user1/notifications`

**Response example:**

```json
[
  {
    "_id": "6829ff0e46eb8c58c3945e06",
    "userId": "user1",
    "type": "email",
    "message": "Hello from Notification Service",
    "status": "sent",
    "retries": 1,
    "createdAt": "2025-05-18T15:38:54.489Z",
    "__v": 0
  }
]
```

---

## How retry works

* If sending a notification fails, it tries again up to 3 times.
* After 3 failures, it marks the notification as `failed`.

---

## What could be done next

* Integrate real email or SMS services like SendGrid or Twilio
* Add pagination and filters to the notification list
* Add user authentication
* Build a front-end dashboard for easier management

---

## Author

Divyanshu Mishra