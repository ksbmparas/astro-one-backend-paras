const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Image", ImageSchema);
