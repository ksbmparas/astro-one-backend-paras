const mongoose = require('mongoose');

const mudraSchema = new mongoose.Schema(
  {
    sno: {
      type: String,
      unique: true,
    },
    gifts: {
      type: String,
    },
    credit: {
      type: Number,
      default: 0,
      min: [0, "Credit cannot be negative"], 
    },
    debited: {
      type: Number,
      default: 0,
      min: [0, "Debited amount cannot be negative"], 
    },
    amount: {
      type: Number,
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String, 
      required: true,
    },
  },
  {
    collection: 'Mudra', 
    timestamps: true,
  }
);

const Mudra = mongoose.model('Mudra', mudraSchema);

module.exports = Mudra;
