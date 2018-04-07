// Headline model
// ==============

// Require mongoose
var mongoose = require("mongoose");

// Create Schema class using mongoose schema method
var Schema = mongoose.Schema;

// Create headlineSchema with Schema class
var headlineSchema = new Schema({
  headline: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  date: String,
  saved: {
    type: Boolean,
    default: false
  }
});

// Create Headline model using headlineSchema
var Headline = mongoose.model("Headline", headlineSchema);

// Export Headline model
module.exports = Headline;
