/**
 * @fileOverview  Contains various view functions for the use case listMovies
 * @author Gerd Wagner
 */
import Movie, { MovieRatingEL, GenreEL } from "../m/Movie.mjs";
console.log("retrieve all")
//const tableBodyEl = document.querySelector("table#movies > tbody");
const tableBodyEl = document.querySelector("table#movies > tbody");
// retrieve all movie records
Movie.retrieveAll();
for (const key of Object.keys( Movie.instances)) {
  const movie = Movie.instances[key];
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = movie.id;
  row.insertCell().textContent = movie.title;
  row.insertCell().textContent = movie.rating;
  row.insertCell().textContent = movie.genres;
}
