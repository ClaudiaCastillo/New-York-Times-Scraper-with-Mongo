/* gloabl bootbox */
// Bootbox.js is a small JavaScript library which allows you to create programmatic dialog boxes using Bootstrap modals, 
// thout having to worry about creating, managing or removing any of the required DOM elements or JS event handlers.
$(document).ready(function() {
  // Setting a reference to the article-container div where all the dynamic content will go
  // Adding event listeners to any dynamically generated "save article" and "scrape new article" buttons
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);

  // run initPage to start
  initPage();

  function initPage() {
    // empty article container
    articleContainer.empty();
    // AJAX request for headlines not already saved
    $.get("/api/headlines?saved=false").then(function(data) {
      // If headline data, render to page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // render no articles message
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    // function appends HTML (containing article data) to page
    // articles -> array of JSON containing available articles in DB
    var articlePanels = [];
    // pass article JSON object to createPanel function
    for (var i = 0; i < articles.length; i++) {
      articlePanels.push(createPanel(articles[i]));
    }
    // append articlePanels array (all HTML for the articles) to the articlePanels container
    articleContainer.append(articlePanels);
  }

  function createPanel(article) {
    // function takes in single JSON object for article/headline returns a bootstrap panel with article data inside
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='" + article.url + "'>",
        article.headline,
        "</a>",
        "<a class='btn btn-success save'>",
        "Save Article",
        "</a>",
        "</h3>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
      ].join("")
    );
    // constructs jQuery element containing all of the formatted HTML for the article panel
    // attach the article id to the jQuery element to use to figure out which article user wants to save
    panel.data("_id", article._id);
    // return constructed panel jQuery element
    return panel;
  }

  function renderEmpty() {
    // function renders HTML to the page explaining no articles to view
    // Use joined array of HTML string data -> easier to read/change vs. concatenated string
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    // Appending this data to the page
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    // function triggered when user wants to save an article
    // retrieve the article that was rendered initially via the createPanel function
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = true;
    // Using a put method (to be semantic) as this is an update to an existing record in collection
    $.ajax({
      method: "PUT",
      url: "/api/headlines",
      data: articleToSave
    }).then(function(data) {
      // If successful, mongoose will send back an object containing a key of "ok" with the value of 1 (true)
      if (data.ok) {
        // Run the initPage function to reload the entire list of articles
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    // This function handles user click on "scrape new article" buttons
    $.get("/api/fetch").then(function(data) {
      // scrape the NYTIMES, compare the articles to those in collection, re-render articles on page
      // then let user know how many unique articles able to save
      initPage();
      bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
    });
  }
});
