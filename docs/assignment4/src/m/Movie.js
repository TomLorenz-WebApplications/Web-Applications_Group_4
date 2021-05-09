import { isNonEmptyString, isIntegerOrIntegerString, cloneObject }
    from "../../lib/util.js";
import { NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
    IntervalConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation }
    from "../../lib/errorTypes.js";
import Enumeration from "../../lib/Enumeration.js";

//Definition for the Enumerations
const ratings = new Enumeration(["G", "PG", "PG13", "R", "NC17"]);
const genres = new Enumeration(["Action","Adventure", "Animation","Comedy","Crime","Documentary","Drama","Fantasy","Family","FilmNoir","Horror","Musical","Romance","SciFi","War","other"]);



//Class movie
class Movie{
    constructor ({movieID, title, rating, genres})
    {
        this.movieID = movieID;
        this.title = title;
        this.rating = rating;
        this.genres = genres;
    }

    get movieID(){
        return this._movieID;
    }
    //constraints for movieid
    static checkMovieID( movieID) {
        var id = Number(movieID);
        if(typeof (id) != "number" || id == "" || id < 1 || isNaN(id)) {
            return new RangeConstraintViolation("movieID should be a non-empty unique number!");
        }else{
            if(Movie.instances[movieID]){
                return new UniquenessConstraintViolation("MovieID is already existent and should be unique!");
            }else{
                return new NoConstraintViolation();
            }
        }
    }

    set movieID(movieID) {
        const validationResult = Movie.checkMovieID(movieID);
        if(validationResult instanceof NoConstraintViolation){
            this._movieID = Number(movieID);
        }else{
            throw validationResult;
        }
    }

    get title(){
        return this._title;
    }
    //constraints for title
    static checkTitle( title) {
        if(!title){
            return new RangeConstraintViolation("Title cant be empty");
        }else if (!isNonEmptyString(title)){
            return new RangeConstraintViolation("Title cant be empty");
        }else if (title.length > 120){
            return new RangeConstraintViolation("Title cant be longer than 120 Chars!")
        }else{
            return new NoConstraintViolation();
        }
    }

    set title(title) {
        var validationResult = Movie.checkTitle(title);
        if (validationResult instanceof  NoConstraintViolation){
            this._title = title;
        }else{
            throw validationResult;
        }
    }

    get rating(){
        return this._rating;
    }
    //constraints for rating
    static checkRating( rate){
        if(!rate){
            return new MandatoryValueConstraintViolation("a Rating is required!");
        }else if(!ratings[rate]) {
            return new RangeConstraintViolation("Rating is not supported");
        }
        else {
            return new NoConstraintViolation();
        }
    }
    set rating( rate){
        const validationResult = Movie.checkRating(rate);
        if(validationResult instanceof NoConstraintViolation){
            this._rating = rate;
        }else {
            throw validationResult;
        }
    }

    get genres(){
        return this._genres;
    }

    set genres( genre){
        const validationResult = Movie.checkGenres( genre);
        if(validationResult instanceof NoConstraintViolation){
            this._genres = genre;
        }else{
            throw validationResult;
        }
    }
    //constraints for genres
    static checkGenres( genres){
        if(!genres || (Array.isArray(genres) && genres.length === 0)){
            return new MandatoryValueConstraintViolation("a movie needs atleast 1 genre");
        }else if(!Array.isArray(genres)){
            return new RangeConstraintViolation("Genres must be given as a array!");
        }else{
            for (const i of genres.keys()){
                const validationResult = Movie.checkGenre(i);
                if(!(validationResult instanceof NoConstraintViolation)){
                    return validationResult;
                }
            }
            return new NoConstraintViolation();
        }
    }
    //constraint for a single genre
    static checkGenre( genre){
        if(!Number.isInteger(genre) || genre < 0 || genre > genres.MAX){
            return new RangeConstraintViolation("genre is not available");
        }else{
            return new NoConstraintViolation();
        }
    }

    toString(){
        return `Movie{ movieID: ${this.movieID}, title: ${this.title},
    ratings: ${this.rating},
    genres: ${this.genres.toString()}}`;
    }

    toJSON(){
        const rec = {};
        for (let p of Object.keys(this)){
            if(p.charAt(0) === "_"){
                rec[p.substr(1)] = this[p];
            }
        }
        return rec;
    }
}
Movie.instances = {};

//+++++++++++++++++++++
//Other Functions
//+++++++++++++++++++++

//generate Test data
Movie.generateData = function (){
    try {
        Movie.instances[1] = new Movie({movieID: 1, title: "Pulp Fiction",rating:["R"] , genres: ["Crime", "Drama"]});
        Movie.instances[2] = new Movie({movieID: 2, title: "Star Wars",rating: ["PG"], genres: ["Action", "Adventure", "Fantasy","SciFi"]});
        Movie.instances[3] = new Movie({movieID: 3, title: "Casablanca",rating: ["PG"] , genres: ["Drama", "FilmNoir", "Romance","War"]});
        Movie.instances[4] = new Movie({movieID: 4, title: "The Godfather",rating: ["R"] , genres: ["Crime","Drama"]});
        Movie.saveAll();
    }catch (e){
        console.log(e.constructor.name + ":" + e.message);
    }
};
//save movie too local space
Movie.saveAll = function(){
    var jsoncontent = "", err = false;
    try {
        jsoncontent = JSON.stringify(Movie.instances);
        localStorage.setItem("movies", jsoncontent);
        console.log("saved all movies")
    } catch (e){
        alert("Error occured while saving data!" + e);
        err = true;
    }
    if(err) console.log("err occured!");
};

Movie.getAllMovies = function() {
    var  jsonmovie = "";
    try {
        if (localStorage["movies"]) {
            jsonmovie = localStorage["movies"];
        }
    }catch (e){
        alert("error!");
    }
    if(jsonmovie){
        const movies = JSON.parse(jsonmovie);

        for(let key of Object.keys( movies)) {
            Movie.instances[key] = Movie.row2Mov(movies[key])
        }
    }
};

Movie.row2Mov = function(row) {
    var movie={};
    try {
        movie = new Movie(row);

    }catch (e) {
        console.log(`${e.constructor.name} + ":" + ${e.message}`);
    }
    return movie;
};

//add a new movie
Movie.addNewMovie = function(data) {
    var movie = null;
    try{
        movie = new Movie( data);
    }catch (e) {
        console.log(`${e.constructor.name} : ${e.message}`);
        movie = null;
    }
    if(movie){
        Movie.instances[movie.movieID] = movie;
        Movie.saveAll();
        console.log("added a new book!");
    }
};
//delete a movie from local space
Movie.deleteMovie = function(movieID) {
    if(Movie.instances[movieID]){
        delete Movie.instances[movieID];
        Movie.saveAll();
        console.log(movieID + "deleted");
    }else{
        console.log("no such movie");
    }
};
// update a movie - updated too satisfy constraints!
Movie.updateMovie = function (data) {
    var noConstraintViolation = true, updatedProperties = [];
    const movie = Movie.instances[data.movieID];
    const moviebeforeupdate = cloneObject(movie);

    try{
        if (movie.title !== data.title) {
            movie.title = data.title;
            updatedProperties.push("title");
        }
        if (movie.rating !== data.rating){
            movie.rating = data.rating;
            updatedProperties.push("rating");
        }
        if (movie.genres !== data.genres){
            movie.genres = data.genres;
            updatedProperties.push("genres");
        }
    }catch (e) {
        noConstraintViolation = false;
        Movie.instances[data.movieID] = moviebeforeupdate;
        console.log("while updating: "+ e.constructor.name + ":" + e.message);
    }
    if(noConstraintViolation){
        if(updatedProperties.length > 0){
            console.log("updated " + data.movieID);
        }else{
            console.log("didnt update" + data.movieID + "since nothing to update there");
        }
    }
};
// delete all movies
Movie.clearAll = function () {
    if(confirm("Really delete all movies?")){
        try {
            Movie.instances = {};
            localStorage["movies"]= "{}";
            console.log("deleted all data!")
        }catch (e) {
            console.log(e.constructor.name + ":" + e.message);
        }
    }
};

export default Movie;
export  { ratings, genres};