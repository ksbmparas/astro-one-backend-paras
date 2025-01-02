const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    bulkAudioUpload: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        artist: { type: String, required: true },
        artwork: { type: String, required: true },
      },
    ],
    bulkImageUpload: { type: [String], default: [] }
  },
  {
    timestamps: true 
  }
);

const ContentDarshan = mongoose.model("Content", ContentSchema);

module.exports = ContentDarshan;
