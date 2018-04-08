// Controller for Notes
// ============================

// Bring in scrape script & makeDate script
var scrape = require("../scripts/scrape");
var makeDate = require("../scripts/date");

// Bring in Headline & Note mongoose models
var Headline = require("../models/Headline");
var Note = require("../models/Note")

module.exports = {
  delete: function(query, cb) {
    Note.remove(query, cb);
  },
  get: function(query, cb) {
    //console.log("get functiion query: ", query);
    // Prepare a query to get the note data, & sort starting from most recent (sorted by id num)
    // ..and populate all of the notes associated with it
    
    Note.find({headlineId: query._id})

      // Execute query
      .exec(function(err, doc) {
        // Once finished, pass the list into the callback function
        cb(err, doc);
        //console.log("query", query, "doc: ", doc, "err: ", err);
      });
     
  },
  save: function(query, cb) {
    // Update the Note with the id supplied & set it to be equal to any new values passed in on query
    //var mdate = makeDate();

    Note.collection.save({headlineId: query._id, date: makeDate(), noteText: query.noteText}, function(err, docs) {
        cb(err, docs);
    });
  }
};

