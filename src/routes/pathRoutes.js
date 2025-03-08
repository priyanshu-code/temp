import express from 'express';
import { dijkstra, findCheapestPath } from '../utils/algorithms.js';
import { uploadCSVData } from './../services/csvUploader.js';

const router = express.Router();

router.post('/upload', async (req, res) => {
    try {
        const result = await uploadCSVData();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/fastest-path', async (req, res) => {
    const { from, to } = req.query;
    const result = await dijkstra(from, to);
    res.json(result);
});

router.get('/cheapest-path', async (req, res) => {
    const { from, to } = req.query;
    const result = await findCheapestPath(from, to);
    res.json(result);
});

export default router; 