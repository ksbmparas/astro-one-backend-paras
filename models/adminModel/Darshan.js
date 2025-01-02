const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    bulkAudioUpload: { type: [String], default: [] },
    bulkImageUpload: { type: [String], default: [] }
  },
  {
    timestamps: true 
  }
);

const ContentDarshan = mongoose.model("Content", ContentSchema);

module.exports = ContentDarshan;
