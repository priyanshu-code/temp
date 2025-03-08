import csvParser from 'csv-parser';
import fs from 'fs';
import Bank from '../models/Bank.js';
import Link from '../models/Link.js';

export const uploadCSVData = async () => {
    try {
        await Bank.deleteMany();
        await Link.deleteMany();

        const bankStream = fs.createReadStream('./banks.csv').pipe(csvParser());
        for await (const row of bankStream) {
            await Bank.create(row);
        }

        const linkStream = fs.createReadStream('./links.csv').pipe(csvParser());
        for await (const row of linkStream) {
            row.TimeTakenInMinutes = Number(row.TimeTakenInMinutes);
            await Link.create(row);
        }

        return { success: true, message: 'CSV data uploaded successfully' };
    } catch (error) {
        throw new Error('Error uploading CSV data');
    }
}; 