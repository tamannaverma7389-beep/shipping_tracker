const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  trackingNumber: String,
  status: String,
  location: String,
  eta: String,
  details: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Tracking", trackingSchema);
