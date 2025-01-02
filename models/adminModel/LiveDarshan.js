const mongoose = require('mongoose');

const LiveDarshan = new mongoose.Schema({
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


const LiveDarshanLink = mongoose.model('livePuja', LiveDarshan);

module.exports = LiveDarshanLink;
