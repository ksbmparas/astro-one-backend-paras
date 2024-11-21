const mongoose = require('mongoose');

// Define the Post schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    image: {
      type: String,
      required: [true, 'Image path is required'],
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Post', postSchema);
