import {isNonEmptyString, cloneObject, nextYear}
  from "../../lib/util.js";
import {
  NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
  IntervalConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation
}
  from "../../lib/errorTypes.js";

import Actor from "./Actor.js";
import Director from "./Director.js";


//Class movie
class Movie {
  constructor(mv) {
    this.movieID = mv.movieID;
    this.title = mv.title;
    this.releaseDate = mv.releaseDate;
    this.director = mv.director;
    if (mv.actors) {
      // cast to number array
      var result = mv.actors.map(function (x) {
        return parseInt(x, 10);
      });
      this.actors = result;
      console.log("this.actors:", this.actors);
    }
    console.log("Movie Constr (ID, title, Date, dir, act):", this.movieID, this.title, this.releaseDate, this.director, this.actors);
  }

  get movieID() {
    return this._movieID;
  }

  //constraints for movieid
  static checkMovieID(movieID) {
    var id = Number(movieID);
    if (typeof (id) != "number" || id == "" || id < 1 || isNaN(id)) {
      return new RangeConstraintViolation("movieID should be a non-empty unique number!");
    } else {
      if (Movie.instances[movieID]) {
        return new UniquenessConstraintViolation("MovieID is already existent and should be unique!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }

  set movieID(movieID) {
    const validationResult = Movie.checkMovieID(movieID);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieID = Number(movieID);
    } else {
      throw validationResult;
    }
  }

  get title() {
    return this._title;
  }

  //constraints for title
  static checkTitle(title) {
    if (!title) {
      return new RangeConstraintViolation("Title cant be empty");
    } else if (!isNonEmptyString(title)) {
      return new RangeConstraintViolation("Title cant be empty");
    } else if (title.length > 120) {
      return new RangeConstraintViolation("Title cant be longer than 120 Chars!")
    } else {
      return new NoConstraintViolation();
    }
  }

  set title(title) {
    var validationResult = Movie.checkTitle(title);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = title;
    } else {
      throw validationResult;
    }
  }

  toString() {
    return `Movie{ movieID: ${this.movieID}, title: ${this.title}}`;
  }

  toJSON() {
    const rec = {};
    for (let p of Object.keys(this)) {
      if (p.charAt(0) === "_") {
        rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }

  static checkReleaseDate = function (datestring) {
    try {
      var date = new Date(datestring);
      const referenceyear = new Date(1895, 12, 28);
      if (datestring === "") {
        return new NoConstraintViolation();
      } else if (date.getFullYear() > nextYear() || date < referenceyear) {
        return new RangeConstraintViolation("Date is out of bounds! Range is between 28-12-1895 and next Year!")
      } else if (isNaN(date.getFullYear())) {
        console.log("date", date);
        return new PatternConstraintViolation("Date needs too be given in YYYY-MM-DD!");
      } else {
        console.log("noconstraint")
        return new NoConstraintViolation();
      }
    } catch (e) {
      console.log(e);
      if (datestring === "") {
        return new NoConstraintViolation();
      } else {
        console.log("datestring", datestring);
        return new PatternConstraintViolation("Date needs too be given in YYYY-MM-DD!");
      }
    }
  }

  get releaseDate() {
    return this._releaseDate;
  }

  set releaseDate(datestring) {
    var validationResult = Movie.checkReleaseDate(datestring);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = new Date(datestring);
    } else {
      throw validationResult;
    }
  }

  get director() {
    return this._director;
  }

  set director(directorID) {
    console.log(directorID);
    var validationResult = Movie.checkDirector(directorID);
    if (validationResult instanceof NoConstraintViolation) {
      this._director = directorID;
    } else {
      throw validationResult;
    }
  }

  static checkDirector2(directorID) {
    var validationResult = null;
    var id = Number(directorID);
    if (typeof (id) != "number" || id == "" || id < 1 || isNaN(id)) {
      return new RangeConstraintViolation("directorID must be a positive Integer!");
    } else {
      if (Director.instances[directorID]) {
        return new UniquenessConstraintViolation("directorID already existent!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }

  static checkDirector(directorID) {
    console.log("checkDirector");
    var validationResult = null;
    if (directorID) {
      validationResult = new NoConstraintViolation();  // optional
    } else {
      // invoke foreign key constraint check
      validationResult = new MandatoryValueConstraintViolation("a director is needed");
      //validationResult = new NoConstraintViolation();
    }
    return validationResult;
  }

  get actors() {
    return this._actors;
  }

  set actors(a) {
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      console.log("set actors if Array.isArray");
      for (const idRef of a) {
        console.log(idRef);
        this._actors = a;
      }
    } else {  // map of IdRefs to object references
      console.log("set actor else");
      for (const idRef of Object.keys(a)) {
        this._actors = Object.keys(a);
      }
    }
  }

  static checkActor(actor_id) {
    var validationResult = null;
    if (!actor_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Actor.checkActorIdAsIdRef(actor_id);
    }
    return validationResult;
  }

}

Movie.instances = {};

//+++++++++++++++++++++
//Other Functions
//+++++++++++++++++++++

//save movie too local space
Movie.saveAll = function () {
  var jsoncontent = "", err = false;
  try {
    jsoncontent = JSON.stringify(Movie.instances);
    localStorage.setItem("movies", jsoncontent);
    console.log("saved all movies")
  } catch (e) {
    alert("Error occured while saving data!" + e);
    err = true;
  }
  if (err) console.log("err occured!");
};

Movie.getAllMovies = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) localStorage["movies"] = "{}";
    else {
      movies = JSON.parse(localStorage["movies"]);
      console.log(`${Object.keys(movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (let id of Object.keys(movies)) {
    try {
      Movie.instances[id] = new Movie(movies[id]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${id}: ${e.message}`);
    }
  }

};

Movie.row2Mov = function (row) {
  var movie = {};
  try {
    movie = new Movie(row);

  } catch (e) {
    console.log(`${e.constructor.name} + ":" + ${e.message}`);
  }
  return movie;
};

//add a new movie
Movie.addNewMovie = function (data) {
  var movie = null;
  try {
    console.log("movie", data)
    movie = new Movie(data);
  } catch (e) {
    console.log(`${e.constructor.name} : ${e.message}`);
    movie = null;
  }
  if (movie) {
    Movie.instances[movie.movieID] = movie;
    Movie.saveAll();
    console.log("added a new movie!");
  }
};
//delete a movie from local space
Movie.deleteMovie = function (movieID) {
  if (Movie.instances[movieID]) {
    delete Movie.instances[movieID];
    Movie.saveAll();
    console.log(movieID + "deleted");
  } else {
    console.log("no such movie");
  }
};
// update a movie - updated too satisfy constraints!
Movie.updateMovie = function (data) {
  var noConstraintViolation = true, updatedProperties = [];
  const movie = Movie.instances[data.movieID];
  const moviebeforeupdate = cloneObject(movie);

  try {
    if (movie.title !== data.title) {
      movie.title = data.title;
      updatedProperties.push("title");
    }
    if (movie.director !== data.director) {
      movie.director = data.director;
      console.log("movie director:", movie.director);
      updatedProperties.push("director");
    }
    if(movie.actorIdRefsToAdd){
      updatedProperties.push("actors(added)");
      for (let actorID of movie.actorIdRefsToAdd){
        this._actors = movie.actorIdRefsToAdd;
      }
    }
    if(movie.actorIdRefsToRemove){
      updatedProperties.push("actors(removed)");
      for (let actorID of movie.actorIdRefsToRemove){
        delete this._actors[actorID];
      }
    }
    // for (var i = 0, maxnew = data.actors.max; i < maxnew; i++) {
    //   var diff = 0;
    //   var moreAct = true;
    //   var maxold = movie.actors.max;
    //   if (maxnew > maxold) {
    //     var diff = maxnew - maxold;
    //   } else {
    //     diff = maxold - maxnew;
    //     moreAct = false;
    //   }
    //   if (movie.actors[i] !== data.actors[i]) {
    //     if (moreAct) {
    //       movie.actors[i](data.actors[i]);
    //       updatedProperties.push("actors");
    //     } else if (!moreAct && i >= maxnew - diff) {
    //       delete movie.actors[i];
    //     } else {
    //       movie.actors[i] = data.actors[i];
    //     }
    //   }
    // }
    if (movie.releaseDate !== data.releaseDate) {
      movie.releaseDate = data.releaseDate;
      updatedProperties.push("releaseDate");
    }

  } catch (e) {
    noConstraintViolation = false;
    Movie.instances[data.movieID] = moviebeforeupdate;
    console.log("while updating: " + e.constructor.name + ":" + e.message);
  }
  if (noConstraintViolation) {
    if (updatedProperties.length > 0) {
      console.log("updated " + data.movieID);
    } else {
      console.log("didnt update" + data.movieID + "since nothing to update there");
    }
  }
};
// delete all movies
Movie.clearAll = function () {
  if (confirm("Really delete all movies?")) {
    try {
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log("deleted all data!")
    } catch (e) {
      console.log(e.constructor.name + ":" + e.message);
    }
  }
};

export default Movie;
