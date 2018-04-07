// Note model
// ==========

// Require mongoose
var mongoose = require("mongoose");
// Create Schema class using mongoose schema method
var Schema = mongoose.Schema;

// Create noteSchema with Schema object
var noteSchema = new Schema({
  // headline (article associate with the note)
  _headlineId: {
    type: Schema.Types.ObjectId,
    ref: "Headline"
  },
  date: String,
  noteText: String
});

// Create Note model using noteSchema
var Note = mongoose.model("Note", noteSchema);

// Export the Note model
module.exports = Note;
