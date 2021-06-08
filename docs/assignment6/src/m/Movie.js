import {isNonEmptyString, cloneObject, nextYear, isIntegerOrIntegerString}
  from "../../lib/util.js";
import {
  NoConstraintViolation,
  MandatoryValueConstraintViolation,
  RangeConstraintViolation,
  IntervalConstraintViolation,
  PatternConstraintViolation,
  UniquenessConstraintViolation,
  FrozenValueConstraintViolation,
  ConstraintViolation
}
  from "../../lib/errorTypes.js";
import Person from "./Person.js";
import { Enumeration } from "../../lib/Enumeration.js";

/**
 *
 * @global
 */
const MovieCategoryEL = new Enumeration(["TVSERIESEPISODE", "BIOGRAPHY"]);

//Class movie
class Movie {
  constructor(mv) {
    this.movieID = mv.movieID;
    this.title = mv.title;
    this.releaseDate = mv.releaseDate;
    this.director = mv.director;
    if (mv.actors) {
      // cast to number array
      this.actors = mv.actors;
      console.log("this.actors:", this.actors);
    }
    if (mv.category) {
      this.category = mv.category;
    }
    if (mv.tvSeriesName) {
      this.tvSeriesName = mv.tvSeriesName;
    }
    if (mv.episodeNo) {
      this.episodeNo = mv.episodeNo;
    }
    if(mv.about){
      this.about = mv.about;
    }
    console.log("Movie Constr (ID, title, Date, dir, act):", this.movieID, this.title, this.releaseDate, this.director, this.actors, this.tvSeriesName, this.episodeNo);
  }


  set about( v){
    // const validationResult = Movie.checkAbout(id);
    // if(validationResult instanceof NoConstraintViolation){
    //   this._about = Number(id);
    // }else {
    //   throw validationResult;
    // }
    const validationResult = Movie.checkAbout( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = v;
    } else {
      throw validationResult;
    }
  }
  get about(){
    return this._about;
  }
  static checkAbout(a, c){
    // var id = Number(id);
    // if(id < 1 || isNaN(id)){
    //   return new RangeConstraintViolation("positive Integer needed");
    // }else {
    //   return new NoConstraintViolation();
    // }
    const cat = parseInt( c);
    //??? if (!cat) cat = BookCategoryEL.BIOGRAPHY;
    if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
        "A biography movie record must have an 'about' field!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
        "be provided if the movie is not a biography!");
    } else {
      return new NoConstraintViolation();
    }
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
    var movieStr = `Movie{ movieID: ${this.movieID}, title: ${this.title}, releaseDate: ${this.releaseDate}`;
    switch (this.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        movieStr += `, tvseriesepisode name: ${this.tvSeriesName}`;
        movieStr += `, biography episodeNo: ${this.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `,about: ${this.about}`;
        break;
    }
    return movieStr + "}";
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

  static checkDirector(directorID) {
    var validationResult = null;
    var id = Number(directorID);
    console.log("#######", id);
    if (typeof (id) != "number" || id == "" || id < 1 || isNaN(id)) {
      return new RangeConstraintViolation("directorID must be a positive Integer!");
    } else {
      return new NoConstraintViolation();
    }
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

  get category() {
    return this._category;
  }

  set category(c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
        "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory(c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt(c);
    } else {
      throw validationResult;
    }
  }

  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
      parseInt( c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
        `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }

  get tvSeriesName() {
    return this._tvSeriesName;
  }

  static checkTvSeriesName(sA, c) {
    const cat = parseInt(c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !sA) {
      return new MandatoryValueConstraintViolation(
        "A TV Series Name must be provided for a tv series episode!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && sA) {
      return new ConstraintViolation("A TV Series Name must not " +
        "be provided if the movie is not a TVSeriesEpisode!");
    } else if (sA && (typeof (sA) !== "string" || sA.trim() === "")) {
      return new RangeConstraintViolation(
        "The tv series name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set tvSeriesName(v) {
    const validationResult = Movie.checkTvSeriesName(v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = v;
    } else {
      throw validationResult;
    }
  }

  get episodeNo() {
    return this._episodeNo;
  }

  static checkEpisodeNo(a, c) {
    const cat = parseInt(c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !a) {
      return new MandatoryValueConstraintViolation(
        "A tvseriesepisode movie record must have an 'episodeNo' field!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && a) {
      return new ConstraintViolation("An 'episodeNo' field value must not " +
        "be provided if the movie is not a tvseriesepisode!");
    } else if (typeof (a) != "number" || a === "" || a < 1 || isNaN(a)) {
      return new RangeConstraintViolation(
        "The 'episodeNo' field value must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }

  set episodeNo(v) {
    const validationResult = Movie.checkEpisodeNo(v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = v;
    } else {
      throw validationResult;
    }
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
    if (!(movie.actors === data.actors)) {
      movie.actors = data.actors;
      console.log(data.actors);
      updatedProperties.push("actors(added)");
    }
    if (data.category) {
      if (movie.category === undefined) {
        movie.category = data.category;
        updatedProperties.push("category");
      } else if (data.category !== movie.category) {
        throw new FrozenValueConstraintViolation(
          "The movie category must not be changed!");
      }
    } else if (data.category === "" && "category" in movie) {
      throw new FrozenValueConstraintViolation(
        "The movie category must not be unset!");
    }
    if (data.tvSeriesName && movie.tvSeriesName !== data.tvSeriesName) {
      movie.tvSeriesName = data.tvSeriesName;
      updatedProperties.push("tvSeriesName");
    }
    if (data.episodeNo && movie.episodeNo !== data.episodeNo) {
      movie.episodeNo = data.episodeNo;
      updatedProperties.push("episodeNo");
    }

    if (data.about && movie.about !== data.about) {
      movie.about = data.about;
      updatedProperties.push("about");
    }
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
      Movie.saveAll();
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
export { MovieCategoryEL };
