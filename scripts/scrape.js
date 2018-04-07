// scrape script
// =============

// Require request and cheerio
var request = require("request");
var cheerio = require("cheerio");

// function to scrape NYTimes website (cb is callback)
var scrape = function(cb) {
  // request package takes in body of page's html
  request("http://www.nytimes.com", function(err, res, body) {
    // body is actual page HTML - Load into cheerio

    // $ -> create a virtual HTML page to traverse with methods use in jQuery
    var $ = cheerio.load(body);

    // Make an empty array to save our article info
    var articles = [];

    // find and loop through each section (theme-summary) holding the articles)
    $(".theme-summary").each(function(i, element) {

      // grab the inner text of the children with class story-heading and store it to the article head
      var head = $(this).children(".story-heading").text().trim();

      // Grab the URL of the article
      var url = $(this).children(".story-heading").children("a").attr("href");

      // grab the inner text of the children with class summary and store it to the article summary
      var sum = $(this).children(".summary").text().trim();

      // If not headline and sum and url not empty
      if (head && sum && url) {
        // Regex to remove extra lines, spacing, tabs
        var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

        // Object to push to articles array

        var dataToAdd = {
          headline: headNeat,
          summary: sumNeat,
          url: url
        };

        articles.push(dataToAdd);
      }
    });
    // callback function to send articles back
    cb(articles);
  });
};

// Export the function, so other BE files can use
module.exports = scrape;
