import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
    FromBIC: { type: String, index: true, ref: 'Bank' },
    ToBIC: { type: String, index: true, ref: 'Bank' },
    TimeTakenInMinutes: Number,
});

export default mongoose.model('Link', LinkSchema); 