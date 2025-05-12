import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


dotenv.config();

import './config/firebase.js';

import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';
import excelRouter from './routes/excelRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/user', userRouter);
app.use('/api/v1/excel', excelRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

connectDB();
app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}`);
})