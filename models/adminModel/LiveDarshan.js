const mongoose = require('mongoose');

const Darshan = new mongoose.Schema({
    VideoLink: {
        type: String,
    },
    fromTimeOfArti: { 
        type: String,
        default: null,
    },
    toTimeOfArti: { 
        type: String,
        default: null,
    },
    TempleName: {
        type: String,
    },
    Description: {
        type: String,
    },
});

module.exports = mongoose.model('livePuja', Darshan);
