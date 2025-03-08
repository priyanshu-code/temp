import mongoose from 'mongoose';

const BankSchema = new mongoose.Schema({
    BIC: { type: String, index: true, unique: true },
    Charge: Number,
});

export default mongoose.model('Bank', BankSchema); 