// makeDate script
// ===============

// This function will make a formatted date for our scraped data
var makeDate = function() {
  var d = new Date();
  var formattedDate = "";
  // concatenate the current month of d
  formattedDate += (d.getMonth() + 1) + "_";
  // concatenate day in the month from d
  formattedDate += d.getDate() + "_";
  // add the full year
  formattedDate += d.getFullYear();

  return formattedDate;
};

// Export the makeDate function so other BE files can use
module.exports = makeDate;
