const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true 
  },
  image: {
    type: String,
    required: true,
  },
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astrologer' // Reference to Astrologer model
  },
  description: String,
  youtubeLink: {
    type: String,
    required: true,
  }
}, { collection: 'Testimonial', timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
