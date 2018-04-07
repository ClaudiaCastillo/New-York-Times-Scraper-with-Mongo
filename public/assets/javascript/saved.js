/* global bootbox */
// Bootbox.js is a small JavaScript library which allows you to create programmatic dialog boxes using Bootstrap modals, 
// thout having to worry about creating, managing or removing any of the required DOM elements or JS event handlers.
$(document).ready(function() {
  // Getting a reference to the article container div to render all articles inside of
  var articleContainer = $(".article-container");
  console.log("buttons");
  // Adding event listeners for dynamically generated buttons for deleting articles,
  // pulling up article notes, saving article notes, and deleting article notes
  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  // initPage kicks off when the page is loaded
  initPage();

  function initPage() {
    // Empty the article container, run an AJAX request for any saved headlines
    articleContainer.empty();
    $.get("/api/headlines?saved=true").then(function(data) {
      // If headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // Otherwise render message that there are no articles
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    // function handles appending HTML containing article data to the page
    // passed an array of JSON containing all available articles in database
    var articlePanels = [];
    // pass each article JSON object to the createPanel function which returns a bootstrap panel with article data inside
    for (var i = 0; i < articles.length; i++) {
      articlePanels.push(createPanel(articles[i]));
    }
    // append all of the HTML for the articles stored in articlePanels array to the articlePanels container
    articleContainer.append(articlePanels);
  }

  function createPanel(article) {
    // function takes in single JSON object for an article/headline, constructs a jQuery element containing all of the 
    // formatted HTML for the article panel
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='" + article.url + "'>",
        article.headline,
        "</a>",
        "<a class='btn btn-danger delete'>",
        "Delete From Saved",
        "</a>",
        "<a class='btn btn-info notes'>Article Notes</a>",
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
    // This function renders some HTML to the page explaining there are no articles to view
    // Use a joined array of HTML string data as it is easier to read/change
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>Would You Like to Browse Available Articles?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    // Appending this data to the page
    articleContainer.append(emptyAlert);
  }

  function renderNotesList(data) {
    // function handles rendering note list items to notes modal, Setting up an array of notes to render after finished
    // Also setting up a currentNote variable to temporarily store each note
    console.log("render notes ", data, " ", data.notes.length);
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      // If no notes, just display a message explaing
      currentNote = ["<li class='list-group-item'>", "No notes for this article yet.", "</li>"].join("");
      notesToRender.push(currentNote);
    }
    else {
      // If have notes, go through each one
      for (var i = 0; i < data.notes.length; i++) {
        // Constructs an li element to contain noteText and a delete button
        currentNote = $(
          [
            "<li class='list-group-item note'>",
            data.notes[i].noteText,
            "<button class='btn btn-danger note-delete'>x</button>",
            "</li>"
          ].join("")
        );
        // Store note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // Adding currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
    }
    // append notesToRender to the note-container inside the note modal
    $(".note-container").append(notesToRender);
  }

  function handleArticleDelete() {
    // function handles deleting articles/headlines
    // grab the id of the article to delete from the panel element the delete button sits inside
    var articleToDelete = $(this).parents(".panel").data();
    // Using delete method (to be semantic), delete an article/headline
    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function(data) {
      // If works, run initPage again which will rerender list of saved articles
      if (data.ok) {
        initPage();
      }
    });
  }

  function handleArticleNotes() {
    // function handles opending the notes modal and displaying notes
    // grab the id of the article to get notes for from the panel element the delete button sits inside
    var currentArticle = $(this).parents(".panel").data();
    // Grab any notes with this headline/article id
    console.log("handle article notes 1 ", currentArticle._id);

    $.get("/api/notes/" + currentArticle._id).then(function(data) {

      console.log("handle article notes 2 ", data);

      // Constructing initial HTML to add to the notes modal
      var modalText = [
        "<div class='container-fluid text-center'>",
        "<h4>Notes For Article: ",
        currentArticle._id,
        "</h4>",
        "<hr />",
        "<ul class='list-group note-container'>",
        "</ul>",
        "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
        "<button class='btn btn-success save'>Save Note</button>",
        "</div>"
      ].join("");
      // Adding the formatted HTML to the note modal
      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };
      // Adding some information about the article and article notes to the save button for easy access
      // When trying to add a new note
      $(".btn.save").data("article", noteData);
      // renderNotesList will populate the actual note HTML inside of the modal just created/opened
      renderNotesList(noteData);
    });
  }

  function handleNoteSave() {
    // function handles when a user tries to save a new note for an article, by setting a variable to hold some 
    // formatted data about note, then grabbing the note typed into the input box
    var noteData;
    var newNote = $(".bootbox-body textarea").val().trim();
    // If actually have data typed into the note input field, format it
    // and post it to the "/api/notes" route and send the formatted noteData as well
    if (newNote) {
      noteData = {
        _id: $(this).data("article")._id,
        noteText: newNote
      };
      $.post("/api/notes", noteData).then(function() {
        // When complete, close the modal
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    // function handles the deletion of notes by first grabbing the id of the note to delete
    // which was stored on the delete button when it was created
    var noteToDelete = $(this).data("_id");
    // Perform an DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      // When done, hide the modal
      bootbox.hideAll();
    });
  }
});
