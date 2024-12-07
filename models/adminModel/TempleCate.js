const mongoose = require('mongoose');

const TempleCateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: { type: [String], required: false },
    selectMusic: { type: [String], required: false },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temp',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('TempleSub', TempleCateSchema);
