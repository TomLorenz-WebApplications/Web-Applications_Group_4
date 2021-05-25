import Movie from "../m/Movie.js";
import Person from "../m/Person.js";
import {createListFromMap, fillSelectWithOptions, createMultipleChoiceWidget} from "../../lib/util.js";

//loading data
Movie.getAllMovies();
Person.getAllPersons();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", Movie.saveAll);

/**********************************************
 Use case Retrieve/List All Movies
 **********************************************/
document.getElementById("getAllMovies")
  .addEventListener("click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-R").style.display = "block";
    const tableBodyEl = document.querySelector("section#Movie-R>table>tbody");
    tableBodyEl.innerHTML = "";  // drop old content
    for (const key of Object.keys(Movie.instances)) {
      const movie = Movie.instances[key];
      console.log("movies.js movie.instances[key]", Movie.instances[key])
      console.log("movies.js movie.actors", movie.actors);
      // create list of actors for this movie
      const actorList = createListFromMap(movie.actors, "name");
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = movie.movieID;
      row.insertCell().textContent = movie.title;
      row.insertCell().textContent = movie.releaseDate;
      console.log(Person.instances);
      row.insertCell().textContent = Person.instances[movie.director].name;
      var actorstring = "";
      for (var i = 0, max = movie.actors.length; i < max; i++) {
        actorstring = Person.instances[movie.actors[i]]._name + ";" + actorstring;
      }
      row.insertCell().textContent = actorstring;
    }
  });

/**********************************************
 Use case Create Movie
 **********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
  selectActorsEl = createFormEl.selectActors,
  selectDirectorEl = createFormEl.selectDirector;
document.getElementById("create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  // set up a single selection list for selecting a director
  fillSelectWithOptions(selectDirectorEl, Person.instances, "personID", {displayProp: "name"});
  // set up a multiple selection list for selecting actors
  fillSelectWithOptions(selectActorsEl, Person.instances,
    "personID", {displayProp: "name"});
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
// set up event handlers for responsive constraint validation
createFormEl.movieID.addEventListener("input", function () {
  createFormEl.movieID.setCustomValidity(
    Movie.checkMovieID(createFormEl.movieID.value).message);
});
createFormEl.title.addEventListener("input", function () {
  createFormEl.title.setCustomValidity(
    Movie.checkTitle(createFormEl.title.value).message);
});
createFormEl.releaseDate.addEventListener("input", function () {
  createFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(createFormEl.releaseDate.value).message);
});



// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieID: Number(createFormEl.movieID.value),
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    director: Number(createFormEl.selectDirector.value),
    actors: []
  };
  console.log("############directorsel",  slots.director);
  // check all input fields and show error messages
  createFormEl.selectDirector.setCustomValidity(Person.checkPersonID2(Number(createFormEl.selectDirector.value)).message);
  createFormEl.movieID.setCustomValidity(
    Movie.checkMovieID(slots.movieID).message);
  createFormEl.title.setCustomValidity(
    Movie.checkTitle(slots.title).message);
  // get the list of selected actors
  const selectActorOptions = createFormEl.selectActors.selectedOptions;
  // check the mandatory value constraint for actors
  createFormEl.selectActors.setCustomValidity(
    selectActorOptions.length >= 0 ? "" : "No actor selected!"
  );
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of actor ID references
    for (const opt of selectActorOptions) {
      slots.actors.push(opt.value);
      console.log("slots", slots);
    }
    Movie.addNewMovie(slots);
  }
});

/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Movie UI
refreshManageDataUI();