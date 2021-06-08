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
