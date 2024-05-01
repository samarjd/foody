const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors({credentials:true,origin:process.env.ORIGIN}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/uploads/profiles', express.static(__dirname + '/uploads/profiles'));

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

process.on('SIGINT', () => {
    mongoose.connection.close();
    console.log('MongoDB connection closed due to application termination');
    process.exit(0);
});


//routes
const userRouter = require('./routes/UserRouter');
const logRouter = require('./routes/LogRouter');
const emailRouter = require('./routes/EmailRouter');
const postRouter = require('./routes/PostRouter');
const categoryRouter = require('./routes/CategoryRouter');
const commentRouter = require('./routes/CommentRouter');

app.use(userRouter);
app.use(logRouter);
app.use(emailRouter);
app.use(postRouter);
app.use(categoryRouter);
app.use(commentRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
