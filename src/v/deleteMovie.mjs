/**
 * @fileOverview  Contains various view functions for the use case deleteMovie
 * @author Mircea Diaconescu
 * @author Gerd Wagner
 */
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

console.log("delete movie")
const formEl = document.forms["Movie"],
      deleteButton = formEl["commit"],
      selectMovieEl = formEl["selectMovie"];
// load all book records
Movie.retrieveAll();
// set up the book selection list
fillSelectWithOptions( selectMovieEl, Movie.instances,
  {keyProp:"id", displayProp:"title"});
// Set an event handler for the submit/delete button
deleteButton.addEventListener("click", function () {
  const id = selectMovieEl.value;
  if (!id) return;
  Movie.destroy( id);
  // remove deleted book from select options
  selectMovieEl.remove( selectMovieEl.selectedIndex);
});
// Set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Movie.saveAll);
