import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import pathRoutes from './src/routes/pathRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to database
connectDB();

// Routes
app.use('/api', pathRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));