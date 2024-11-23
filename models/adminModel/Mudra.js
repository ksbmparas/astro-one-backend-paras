const mongoose = require('mongoose');

const mudraSchema = new mongoose.Schema(
  {
    sno: {
      type: String,
      required: true,
      unique: true,
    },
    gifts: {
      type: String,
      required: true
    },
    credit: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Credit cannot be negative"], // Ensures credit is non-negative
    },
    debited: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Debited amount cannot be negative"], // Ensures debited is non-negative
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"], // Ensures amount is non-negative
    },
    dateTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'Mudra', // Specify the collection name
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

const Mudra = mongoose.model('Mudra', mudraSchema);

module.exports = Mudra;
