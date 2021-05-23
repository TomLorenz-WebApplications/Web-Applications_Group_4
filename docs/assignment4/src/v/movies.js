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


createFormEl.selectDirector.setCustomValidity(Person.checkPersonID(createFormEl.selectDirector.value).message);
// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieID: Number(createFormEl.movieID.value),
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    director: createFormEl.selectDirector.value,
    actors: []
  };
  console.log("############directorsel",  createFormEl.selectDirector.value);
  // check all input fields and show error messages
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
 * Use case Update Movie
 **********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
  selectUpdateMovieEl = updateFormEl.selectMovie;
document.getElementById("update").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  // set up the movie selection list
  fillSelectWithOptions(selectUpdateMovieEl, Movie.instances,
    "movieID", {displayProp: "title"});
  updateFormEl.reset();
});
/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
selectUpdateMovieEl.addEventListener("change", function () {
  const formEl = document.querySelector("section#Movie-U > form"),
    saveButton = formEl.commit,
    selectActorsWidget = formEl.querySelector(".MultiChoiceWidget"),
    //ohne value
    selectDirectorEl = formEl.selectDirector,
    movieID = formEl.selectMovie.value;
  if (movieID) {
    const movie = Movie.instances[movieID];
    formEl.movieID.value = movie.movieID;
    formEl.title.value = movie.title;
    formEl.releaseDate.value = movie.releaseDate;
    // set up the associated director selection list
    console.log(movie);
    fillSelectWithOptions(selectDirectorEl, Person.instances, "personID",  {displayProp:"name"});
    // set up the associated actors selection widget
    //mincard 1
    createMultipleChoiceWidget(selectActorsWidget, movie.actors,
      Person.instances, "personID", "name", 1);  // minCard=1
    // assign associated director as the selected option to select element
    if (movie.director) {
      console.log(Person.instances[movie.director].name);
      formEl.selectDirector.value = movie.director;
      saveButton.disabled = false;
    }
  } else {
    formEl.reset();
    formEl.selectDirector.selectedIndex = 0;
    selectActorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
});
updateFormEl.movieID.addEventListener("input", function () {
  updateFormEl.movieID.setCustomValidity(
    Movie.checkMovieID(updateFormEl.movieID.value).message);
});
updateFormEl.title.addEventListener("input", function () {
  updateFormEl.title.setCustomValidity(
    Movie.checkTitle(updateFormEl.title.value).message);
});
updateFormEl.releaseDate.addEventListener("input", function () {
  updateFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(updateFormEl.releaseDate.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = selectUpdateMovieEl.value,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    multiChoiceListEl = selectActorsWidget.firstElementChild;
  if (!movieIdRef) return;
  const slots = {
    movieID: updateFormEl.movieID.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    director: Number(updateFormEl.selectDirector.value)
  }
  // add event listeners for responsive validation
  updateFormEl.title.setCustomValidity(
    Movie.checkTitle(slots.title).message);
  updateFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(slots.releaseDate).message);
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct actorIdRefs-ToAdd/ToRemove lists from the association list
    const actorIdRefsToAdd = [], actorIdRefsToRemove = [];
    for (const mcListItemEl of multiChoiceListEl.children) {
      if (mcListItemEl.classList.contains("removed")) {
        actorIdRefsToRemove.push(mcListItemEl.getAttribute("data-value"));
      }
      if (mcListItemEl.classList.contains("added")) {
        actorIdRefsToAdd.push(mcListItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty create a corresponding slot
    if (actorIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = actorIdRefsToRemove;
    }
    if (actorIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = actorIdRefsToAdd;
    }
  }
  console.log(slots);
  Movie.updateMovie(slots);
  // update the movie selection list's option element
  selectUpdateMovieEl.options[selectUpdateMovieEl.selectedIndex].text = slots.title;
  selectActorsWidget.innerHTML = "";
});

/**********************************************
 * Use case Delete Movie
 **********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const selectDeleteMovieEl = deleteFormEl.selectMovie;
document.getElementById("destroy")
  .addEventListener("click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-D").style.display = "block";
    // set up the actor selection list
    fillSelectWithOptions(selectDeleteMovieEl, Movie.instances,
      "movieID", {displayProp: "title"});
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = selectDeleteMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.deleteMovie(movieIdRef);
    // remove deleted movie from select options
    deleteFormEl.selectMovie.remove(deleteFormEl.selectMovie.selectedIndex);
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