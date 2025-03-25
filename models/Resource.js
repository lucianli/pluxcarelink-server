const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: {type: String, required: true},
    location: {
        type: {
          type: String,
          enum: ['Point'], // GeoJSON type must be "Point"
          required: true
        },
        coordinates: {
          type: [Number], // Array of numbers [longitude, latitude]
          required: true
        }
    },
    phone: { type: String },
    website: { type: String },
    summary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create a 2dsphere index on the location field
resourceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Resource', resourceSchema);