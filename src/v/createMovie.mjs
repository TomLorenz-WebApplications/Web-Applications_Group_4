/**
 * @fileOverview  View methods for the use case "create movie"
 * @author Gerd Wagner
 */
import Movie, { MovieRatingEL, GenreEL } from "../m/Movie.mjs";
import { fillSelectWithOptions, createChoiceWidget } from "../../lib/util.mjs";
import {IntervalConstraintViolation} from "../../lib/errorTypes.mjs";
console.log("CreateMovie")
const formEl = document.forms["Movie"],
  ratingFieldsetEl = formEl.querySelector("fieldset[data-bind='rating']"),
  genreFieldsetEl = formEl.querySelector("fieldset[data-bind='genres']"),
  saveButton = formEl["commit"];
// load all movie records
Movie.retrieveAll();
// set up the rating radio button group
createChoiceWidget( ratingFieldsetEl, "rating", [],
    "radio", MovieRatingEL.labels, true);
// set up the genres checkbox group
createChoiceWidget( genreFieldsetEl, "genres", [],
    "checkbox", GenreEL.labels);
// add event listeners for responsive validation
formEl.id.addEventListener("input", function () {
  formEl.id.setCustomValidity( Movie.checkIdAsId( formEl.id.value).message);
});
formEl.title.addEventListener("input", function () {
  formEl.title.setCustomValidity( Movie.checkTitle( formEl.title.value).message);
});
/*
// mandatory value check if otherAvailableLanguages would be mandatory
otherAvailLangSelEl.addEventListener("change", function () {
  otherAvailLangSelEl.setCustomValidity(
      (otherAvailLangSelEl.selectedOptions.length === 0) ?
          "At least one value must be selected!":"" );
});
*/
// mandatory value check
ratingFieldsetEl.addEventListener("click", function () {
  formEl.rating[0].setCustomValidity(
    (!ratingFieldsetEl.getAttribute("data-value")) ?
      "A rating must be selected!":"" );
});
// mandatory value check
genreFieldsetEl.addEventListener("click", function () {
  const val = genreFieldsetEl.getAttribute("data-value");
  formEl.genres[0].setCustomValidity(
    (!val || Array.isArray(val) && val.length === 0) ?
      "At least one publication form must be selected!":"" );
});
// set an event handler for the submit/save button
saveButton.addEventListener("click", handleSaveButtonClickEvent);
// neutralize the submit event
formEl.addEventListener( 'submit', function (e) {
  e.preventDefault();
  formEl.reset();
});
// set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Movie.saveAll);

// event handler for the submit/save button
function handleSaveButtonClickEvent() {
  const genreList = JSON.parse( genreFieldsetEl.getAttribute("data-value"))
  var genreLists = [];
  var i = 0;
  for (i; i <genreList.length; i++){
    genreLists[i] = GenreEL.labels[genreList[i] - 1];
  }
  const slots = { id: formEl.id.value,
    title: formEl.title.value,
    rating: MovieRatingEL.labels[parseInt(ratingFieldsetEl.getAttribute("data-value"))-1],
    genres: genreLists
  };
  // set error messages in case of constraint violations
  formEl.id.setCustomValidity( Movie.checkIdAsId( slots.id).message);
  formEl.title.setCustomValidity( Movie.checkTitle( slots.title).message);
  formEl.rating[0].setCustomValidity(
      Movie.checkRating( slots.rating).message);
  formEl.genres[0].setCustomValidity(
      Movie.checkGenres( slots.genres).message);
  // save the input data only if all form fields are valid
  if (formEl.checkValidity()) Movie.add( slots);
}
