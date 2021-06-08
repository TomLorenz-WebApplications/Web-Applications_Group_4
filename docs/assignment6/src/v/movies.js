import Movie, { MovieCategoryEL } from "../m/Movie.js";
import Person from "../m/Person.js";
import {createListFromMap, fillSelectWithOptions, createMultipleChoiceWidget} from "../../lib/util.js";
import {displaySegmentFields, undisplayAllSegmentFields} from "../v/app.js"
import {IntervalConstraintViolation} from "../../lib/errorTypes.js";
import Actor from "../m/Actor.js";
import Director from "../m/Director.js";

//loading data
Movie.getAllMovies();
Actor.retrieveAll();
Director.retrieveAll();
Person.retrieveAll();

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
window.addEventListener("beforeunload", function () {
  Movie.saveAll();
});

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
      console.log(Director.instances);
      row.insertCell().textContent = Director.instances[movie.director]._name;
      var actorstring = "";

      for (var i = 0, max = movie.actors.length; i < max; i++) {
        actorstring = Actor.instances[movie.actors[i] + 1]._name + ";" + actorstring;
      }

      row.insertCell().textContent = actorstring;
      if (movie.category) {
        switch (movie.category) {
          case MovieCategoryEL.TVSERIESEPISODE:
            row.insertCell().textContent = "(TVSeriesEpisode) Name: " + movie.tvSeriesName;
            row.insertCell().textContent = "Episode: " + movie.episodeNo;
            break;
          case MovieCategoryEL.BIOGRAPHY:
            row.insertCell().textContent = "(Biography) about: " + Person.instances[movie.about].name;
            break;
        }
      }
    }
  });

/**********************************************
 Use case Create Movie
 **********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
  createCategorySelectEl = createFormEl.category,
  selectActorsEl = createFormEl.selectActors,
  selectPerson = createFormEl.selectPerson,
  selectDirectorEl = createFormEl.selectDirector;
console.log("createCategorySelectEl", createCategorySelectEl);
document.getElementById("create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  // set up a single selection list for selecting a director
  fillSelectWithOptions(selectDirectorEl, Actor.instances, "personID", {displayProp: "name"});
  // set up a multiple selection list for selecting actors
  fillSelectWithOptions(selectActorsEl, Actor.instances,
    "personID", {displayProp: "name"});
  fillSelectWithOptions(selectPerson, Person.instances, "personID", {displayProp:"name"});
  // console.log(Movie.instances);
  // console.log(Movie.instances[1].category);
  // let categories = [];
  // let i = 1;
  // for (let key in Movie.instances) {
  //   console.log(key);
  //   categories.push(Movie.instances[i].category);
  //   console.log(categories);
  //   i++;
  // }
  // console.log("categories: ", categories);
  undisplayAllSegmentFields(createFormEl, MovieCategoryEL.labels);
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
createFormEl.tvSeriesName.addEventListener("input", function () {
  createFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName(createFormEl.tvSeriesName.value,
      parseInt(createFormEl.category.value) + 1).message);
});
createFormEl.episodeNo.addEventListener("input", function () {
  createFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo(createFormEl.episodeNo.value,
      parseInt(createFormEl.category.value) + 1).message);
});
createFormEl.selectPerson.addEventListener("input", function () {
  createFormEl.selectPerson.setCustomValidity(
    Movie.checkAbout(createFormEl.selectPerson.value,
      parseInt(createFormEl.selectPerson.value) + 1).message);
});

// set up the movie category selection list
console.log(MovieCategoryEL.labels);
fillSelectWithOptions(createCategorySelectEl, MovieCategoryEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.category.value;
  const slots = {
    movieID: Number(createFormEl.movieID.value),
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    director: Number(createFormEl.selectDirector.value),
    actors: [],
    about: 0
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt(categoryStr) + 1;
    console.log("##########category slots:", slots.category);
    switch (slots.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        slots.tvSeriesName = createFormEl.tvSeriesName.value;
        createFormEl.tvSeriesName.setCustomValidity(
          Movie.checkTvSeriesName(createFormEl.tvSeriesName.value, slots.category).message);
        slots.episodeNo = createFormEl.episodeNo.value;
        createFormEl.episodeNo.setCustomValidity(
          Movie.checkEpisodeNo(createFormEl.episodeNo.value, slots.category).message);
        break;
      case MovieCategoryEL.BIOGRAPHY:
        slots.about = Number(createFormEl.selectPerson.value);
        createFormEl.selectPerson.setCustomValidity(
          Movie.checkAbout(createFormEl.selectPerson.value, slots.category).message);
        break;
    }
  }
  console.log("############directorsel", slots.director);
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
      slots.actors.push(Number(opt.value));
      console.log("slots", slots);
    }
    Movie.addNewMovie(slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields(createFormEl, MovieCategoryEL.labels);
  }
});

/**********************************************
 * Use case Update Movie
 **********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
  selectUpdateMovieEl = updateFormEl.selectMovie,
  selectActorsUpdateEl = createFormEl.selectActorsUpdate,
  updateSelectCategoryEl = updateFormEl.category;
console.log("selCat", updateSelectCategoryEl);
console.log("updateFEl", updateFormEl);
undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
console.log("after", updateFormEl);
document.getElementById("update").addEventListener("click", function () {
  selectUpdateMovieEl.innerHTML = "";
  // set up the movie selection list
  fillSelectWithOptions(selectUpdateMovieEl, Movie.instances,
    "movieID", {displayProp: "title"});
  fillSelectWithOptions(selectPerson, Person.instances, "personID", {displayProp:"name"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
selectUpdateMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
// set up the movie category selection list
console.log("******", MovieCategoryEL.labels);
fillSelectWithOptions(updateSelectCategoryEl, MovieCategoryEL.labels);
updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);
/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
selectUpdateMovieEl.addEventListener("change", function () {
  const formEl = document.querySelector("section#Movie-U > form"),
    saveButton = formEl.commit,
    //ohne value
    selectDirectorEl = formEl.selectDirector,
    selectActorsUpdateEl = formEl.selectActorsUpdate,
    movieID = formEl.selectMovie.value,
    updateSelectCategoryEl = updateFormEl["category"];
  undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
  if (movieID) {
    const movie = Movie.instances[movieID];
    formEl.movieID.value = movie.movieID;
    formEl.title.value = movie.title;
    formEl.releaseDate.value = movie.releaseDate;
    // set up the associated director selection list
    console.log(movie);
    fillSelectWithOptions(selectDirectorEl, Actor.instances, "personID", {displayProp: "name"});
    // set up the associated actors selection widget
    //mincard 1
    fillSelectWithOptions(selectActorsUpdateEl, Actor.instances, "personID", {displayProp: "name"});
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
// responsive validation of form fields for segment properties
updateFormEl.tvSeriesName.addEventListener("input", function () {
  updateFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName(updateFormEl.tvSeriesName.value,
      parseInt(updateFormEl.category.value) + 1).message);
});
updateFormEl.episodeNo.addEventListener("input", function () {
  updateFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo(updateFormEl.episodeNo.value,
      parseInt(updateFormEl.category.value) + 1).message);
});
updateFormEl.selectPerson.addEventListener("input", function () {
  updateFormEl.selectPerson.setCustomValidity(
    Movie.checkAbout(updateFormEl.selectPerson.value,
      parseInt(updateFormEl.category.value) + 1).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.category.value;
  const movieIdRef = selectUpdateMovieEl.value;
  if (!movieIdRef) return;
  const slots = {
    movieID: updateFormEl.movieID.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    director: Number(updateFormEl.selectDirector.value),
    actors: []
  }
  // add event listeners for responsive validation
  updateFormEl.title.setCustomValidity(
    Movie.checkTitle(slots.title).message);
  updateFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(slots.releaseDate).message);
  // commit the update only if all form field values are valid
  const selectActorOptions = updateFormEl.selectActorsUpdate.selectedOptions;
  for (const opt of selectActorOptions) {
    slots.actors.push(Number(opt.value));
    console.log("slots", slots);
  }
  console.log("slot category", slots.category);
  if (categoryStr) {
    slots.category = parseInt(categoryStr) + 1;
    switch (slots.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        slots.tvSeriesName = updateFormEl.tvSeriesName.value;
        updateFormEl.tvSeriesName.setCustomValidity(
          Movie.checkTvSeriesName(slots.tvSeriesName, slots.category).message);
        slots.episodeNo = updateFormEl.episodeNo.value;
        updateFormEl.episodeNo.setCustomValidity(
          Movie.checkEpisodeNo(slots.episodeNo, slots.category).message);
        break;
      case MovieCategoryEL.BIOGRAPHY:
        slots.about = selectPerson.value;
        updateFormEl.about.setCustomValidity(
          Movie.checkAbout(slots.about, slots.category).message);
        break;
    }
  }
  // check all input fields and show error messages
  updateFormEl.movieID.setCustomValidity(Movie.checkMovieID(slots.movieID).message);
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    Movie.updateMovie(slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
    // update the movie selection list's option element
    selectUpdateMovieEl.options[selectUpdateMovieEl.selectedIndex].text = slots.title;
  }
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

/**
 * event handler for movie category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent(e) {
  const formEl = e.currentTarget.form,
    // the array index of MovieCategoryEL.labels
    categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields(formEl, MovieCategoryEL.labels,
      parseInt(categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields(formEl, MovieCategoryEL.labels);
  }
}

/**
 * handle movie selection events
 * when a movie is selected, populate the form with the data of the selected movie
 */
function handleMovieSelectChangeEvent() {
  const id = updateFormEl.selectMovie.value;
  if (id) {
    const movie = Movie.instances[id];
    updateFormEl.movieID.value = movie.movieID;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.value = movie.releaseDate;
    if (movie.category) {
      updateFormEl.category.selectedIndex = movie.category;
      // disable category selection (category is frozen)
      // updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields(updateFormEl, MovieCategoryEL.labels, movie.category);
      switch (movie.category) {
        case MovieCategoryEL.TVSERIESEPISODE:
          updateFormEl.tvSeriesName.value = movie.tvSeriesName;
          updateFormEl.episodeNo.value = movie.episodeNo;
          updateFormEl.selectPerson.value = "";
          break;
        case MovieCategoryEL.BIOGRAPHY:
          updateFormEl.selectPerson.value = movie.about;
          updateFormEl.tvSeriesName.value = "";
          updateFormEl.episodeNo.value = "";
          break;
      }
    } else {  // movie has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.tvSeriesName.value = "";
      updateFormEl.episodeNo.value = "";
      updateFormEl.about.value = "";
      undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
    }
  } else {
    updateFormEl.reset();
  }
}

// Set up Manage Movie UI
refreshManageDataUI();