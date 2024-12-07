const mongoose = require('mongoose');

const TempleSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  image:{
    type:String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Temp', TempleSchema);
