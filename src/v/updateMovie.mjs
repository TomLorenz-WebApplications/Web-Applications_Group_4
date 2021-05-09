/**
 * @fileOverview  View methods for the use case "update movie"
 * @author Gerd Wagner
 */
import Movie, {MovieRatingEL, GenreEL} from "../m/Movie.mjs";
import {fillSelectWithOptions, createChoiceWidget} from "../../lib/util.mjs";

console.log("update movie")
//const formEl = document.forms["Movie"], submitButton = formEl["commit"],
//    selectMovieEl = formEl["selectMovie"],
//   ratingFieldsetEl = formEl.querySelector("fieldset[data-bind='rating']"),
//   genreFieldsetEl = formEl.querySelector("fieldset[data-bind='genres']");

const formEl = document.forms["Movie"], submitButton = formEl["commit"], selectMovieEl = formEl["selectMovie"],
  genreFieldsetEl = formEl.querySelector("fieldset[data-bind='genres']"),
  ratingFieldsetEl = formEl.querySelector("fieldset[data-bind='rating']");
// load all movie records
Movie.retrieveAll();
// set up the movie selection list
fillSelectWithOptions(selectMovieEl, Movie.instances, {displayProp: "title"});
// when a movie is selected, populate the form with its data
selectMovieEl.addEventListener("change", function () {
  const movieKey = selectMovieEl.value;
  if (movieKey) {
    const movie = Movie.instances[movieKey];
    formEl.id.value = movie.id;
    formEl.title.value = movie.title;
    formEl.rating.value = movie.rating;
    // set up the rating radio button group
    createChoiceWidget( ratingFieldsetEl, "rating",
     [movie.rating], "radio", MovieRatingEL.labels);
    // set up the genres checkbox group
    createChoiceWidget( genreFieldsetEl, "genres",
    movie.genres, "checkbox", GenreEL.labels);

  } else {
    formEl.reset();
  }
});
window.addEventListener("beforeunload", Movie.saveAll);
// add event listeners for responsive validation
formEl.title.addEventListener("input", function () {
  formEl.title.setCustomValidity(
    Movie.checkTitle(formEl.title.value).message);
});

ratingFieldsetEl.addEventListener("click", function () {
  ratingFieldsetEl.setCustomValidity(
    (!ratingFieldsetEl.getAttribute("data-value")) ?
      "A rating must be selected!" : "");
});
// mandatory value check
genreFieldsetEl.addEventListener("click", function () {
  const val = genreFieldsetEl.getAttribute("data-value");
  formEl.genres[0].setCustomValidity(
    (!val || Array.isArray(val) && val.length === 0) ?
      "At least one publication form must be selected!" : "");
});
// Set an event handler for the submit/save button
submitButton.addEventListener("click", handleSubmitButtonClickEvent);
// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});
// Set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Movie.saveAll);

/**
 * check data and invoke update
 */
function handleSubmitButtonClickEvent() {
  const formElement = document.forms["Movie"], selectMovieEl = formEl.selectMovie;
  let genreList = JSON.parse(genreFieldsetEl.getAttribute("data-value"))
  let i = 0;
  let genLists = [];

  if (genreList) {
    for (i = 0; i < genreList.length; i++) {
      genLists[i] = GenreEL.labels[genreList[i] - 1];
    }
  }
  const slots = {
    id: parseInt(formEl.id.value),
    title: formEl.title.value,
    rating: ratingFieldsetEl.labels("data-value"),
    genres: genLists
  };
  // construct the list of selected otherAvailableLanguages
  // set error messages in case of constraint violations
  formEl.title.setCustomValidity(Movie.checkTitle(slots.title).message);
  // set the error message for rating constraint violations on the first radio button
  formEl.rating.setCustomValidity(
    Movie.checkRating(slots.rating).message);
  // set the error message for genres constraint violations on the first checkbox
  genreFieldsetEl.setCustomValidity(
    Movie.checkGenres(slots.genres).message);
  if (formEl.checkValidity()) {
    Movie.update(slots);
    // update the selection list option
    selectMovieEl.options[selectMovieEl.selectedIndex].text = slots.title;
  } else {
    console.loge("error ")
  }
}
