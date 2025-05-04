import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();

import './config/firebase.js';

import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json());

app.use('/api/v1/user', userRouter);

connectDB();
app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}`);
})