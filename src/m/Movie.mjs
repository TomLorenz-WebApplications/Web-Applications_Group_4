/**
 * @fileOverview  The model class Movie with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @copyright Copyright 2014-2015 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { isNonEmptyString, isIntegerOrIntegerString, cloneObject }
    from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
    RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation }
    from "../../lib/errorTypes.mjs";
import Enumeration from "../../lib/Enumeration.mjs";

/**
 * Define three Enumerations
 */

const MovieRatingEL = new Enumeration(["G","PG", "PG13", "R", "NC17"]);
const GenreEL = new Enumeration(["Crime", "Action", "Adventure", "Animation","SciFy", "Fantasy", "Comedy", "Documentary", "Drama", "Family", "FilmNoir", "Horror", "Musical", "Romance", "War", "Other"]);
/**
 * The class Movie
 * @class
 */
class Movie {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({id, title,
                 rating, genres}) {
    // assign properties by invoking implicit setters
    this.id = id;
    this.title = title;
    this.rating = rating;
    this.genres = genres;
    const SemesterEL = new Enumeration(["winter semester", "summer semester"]);
    console.log(SemesterEL.labels[1]);
  }
  get id() {
    return this._id;
  }
  static checkId( id) {
    var checkid = Number(id);
    console.log("check id - movie")
    console.log(checkid)
    if (!checkid) return new NoConstraintViolation();
    else if (typeof (checkid) !== "number" || checkid == "" || checkid < 1 || isNaN(checkid)) {
      return new RangeConstraintViolation(
        "The ID must be a non-empty unique number!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkIdAsId( id) {
    console.log("check idasid - movie")
    var validationResult = Movie.checkId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the ID must be provided!");
      } else if (Movie.instances[id]) {
        validationResult = new UniquenessConstraintViolation(
          "There is already a movie record with this ID!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set id( n) {
    const validationResult = Movie.checkIdAsId( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._id = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  static checkTitle( t) {
    console.log("check title - movie")
    if (!t) {
      return new MandatoryValueConstraintViolation(
        "A title must be provided!");
    } else if (!isNonEmptyString(t)) {
      return new RangeConstraintViolation(
        "The title must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set title( t) {
    const validationResult = Movie.checkTitle( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }

  get rating() {
    return this._rating;
  }

  static checkRating( c) {
    console.log("check ratings - movie")
    if (!c) {
      return new MandatoryValueConstraintViolation("A rating must be provided!");
    } else if (!MovieRatingEL[c]) {
      console.log(MovieRatingEL[c]);
      return new RangeConstraintViolation(`Invalid value for rating: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set rating( c) {
    const validationResult = Movie.checkRating( c);
    if (validationResult instanceof NoConstraintViolation) {
      this._rating = ( c);
    } else {
      throw validationResult;
    }
  }
  get genres() {
    return this._genres;
  }
  static checkGenre( p) {
    console.log("check genre - movie")

    if (!Number.isInteger( p) || p < 0 ||  p > GenreEL.MAX) {
      console.log("P value:", p);
      console.log("Genre max", GenreEL.MAX);
      return new RangeConstraintViolation(
        `Invalid value for genre: ${p}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkGenres( genres) {
    console.log("check genres - movie")
    if (!genres || (Array.isArray( genres) && genres.length === 0)) {
      console.log("Genres:", genres);
      return new MandatoryValueConstraintViolation("No genre provided!");
    } else if (!Array.isArray( genres)) {
      return new RangeConstraintViolation(
        "The value of genres must be an array!");
    } else {
      for (let i of genres.keys()) {
        const validationResult = Movie.checkGenre( i);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  }
  set genres( genres) {
    console.log("set genres - movie")
    const validationResult = Movie.checkGenres( genres);
    if (validationResult instanceof NoConstraintViolation) {
      this._genres = genres;
    } else {
      throw validationResult;
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  toString() {
    return `Movie{ ID: ${this.id}, title: ${this.title},
    rating: ${this.rating},
    genres: ${this.genres.toString()} }`;
  }
  toJSON() {  // is invoked by JSON.stringify
    const rec = {};
    for (let p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) === "_") {
        // remove underscore prefix
        rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/**********************************************************
 ***  Class-level ("static") properties  ******************
 **********************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new movie row
 */
Movie.add = function (slots) {
  console.log("movie add in movie")
  var movie = null;
  try {
    movie = new Movie( slots);
  } catch (e) {
    console.log( `${e.constructor.name} : ${e.message}`);
    movie = null;
  }
  if (movie) {
    Movie.instances[movie.id] = movie;
    console.log( `${movie.toString()} created!`);
  }
};
/**
 *  Update an existing movie row
 */
Movie.update = function (slots) {
  console.log("movie.update in movie")
  var noConstraintViolated = true,
      updatedProperties = [];
  const movie = Movie.instances[slots.id],
      objectBeforeUpdate = cloneObject( movie);
  try {
    if (movie.title !== slots.title) {
      movie.title = slots.title;
      updatedProperties.push("title");
    }
    if (movie.rating !== slots.rating) {
      movie.rating = slots.rating;
      updatedProperties.push("rating");
    }
    if (!movie.genres.isEqualTo( slots.genres)) {
      movie.genres = slots.genres;
      updatedProperties.push("genres");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[slots.id] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      console.log(`Properties ${updatedProperties.toString()} modified for movie ${slots.id}`);
    } else {
      console.log(`No property value changed for movie ${slots.id}!`);
    }
  }
};
/**
 *  Delete a movie
 */
Movie.destroy = function (id) {
  if (Movie.instances[id]) {
    console.log(`${Movie.instances[id].toString()} deleted!`);
    delete Movie.instances[id];
  } else {
    console.log(`There is no movie with ID ${id} in the database!`);
  }
};
/**
 *  Convert row to object
 */
Movie.convertRec2Obj = function (movieRow) {
  var movie={};
  try {
    movie = new Movie( movieRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a movie row: ${e.message}`);
  }
  return movie;
};
/**
 *  Load all movie table rows and convert them to objects
 */
Movie.retrieveAll = function () {
  var moviesString="";
  try {
    if (localStorage["movies"]) {
      moviesString = localStorage["movies"];
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  if (moviesString) {
    const movies = JSON.parse( moviesString);
    console.log(`${Object.keys( movies).length} movies loaded.`);
    for (let key of Object.keys( movies)) {
      Movie.instances[key] = Movie.convertRec2Obj( movies[key]);
    }
  }
};
/**
 *  Save all movie objects
 */
Movie.saveAll = function () {
  var error=false;
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    const moviesString = JSON.stringify( Movie.instances);
    localStorage["movies"] = moviesString;
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
    error = true;
  }
  if (!error) console.log(`${nmrOfMovies} movie records saved.`);
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
Movie.generateTestData = function () {
  console.log("generate test data")
  try {
    Movie.instances["1"] = new Movie({
      id: 1,
      title: "Pulp Fiction",
      rating: ["R"],
      //genres: ["Crime", "Drama"]
      genres: ["Crime", "Drama"]
    });
    console.log("Log");
    Movie.instances["2"] = new Movie({
      id: 2,
      title: "Star Wars",
      rating: ["PG"],
      genres: ["Action", "Adventure", "Fantasy", "SciFy"]
    });
    Movie.instances["3"] = new Movie({
      id: 3,
      title: "Casablanca",
      rating: ["PG"],
      genres: ["Drama","FilmNoir", "Romance", "War"]
    });
    Movie.saveAll();
  } catch (e) {
    console.log(`${e.constructor.name} : ${e.message}`);
  }
};
/**
 * Clear data
 */
Movie.clearData = function () {
  if (confirm( "Do you really want to delete all movie data?")) {
    try {
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log( "All data cleared.");
    } catch (e) {
      console.log( `${e.constructor.name} : ${e.message}`);
    }
  }
};

export default Movie;
export { MovieRatingEL, GenreEL };
