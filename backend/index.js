import express from 'express'
import dotenv from 'dotenv'
dotenv.config();

import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';

const app = express();

app.use(express.json());

app.use('/api/v1/user', userRouter);

connectDB();
app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}`);
})