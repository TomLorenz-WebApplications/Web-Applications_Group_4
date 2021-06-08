
import Movie, {MovieCategoryEL} from "../m/Movie.js";
import Person from "../m/Person.js";
import Director from "../m/Director.js";
import Actor from "../m/Actor.js";

// generate test data
function generateTestData(){
    try{
        Director.instances[1] = new Director({
            personID:1,
            name: "Stephen Frears"
        });
        Director.instances[2] = new Director({
            personID:2,
            name: "George Lucas"
        });
        Director.instances[3] = new Director({
            personID:3,
            name: "Quentin Tarantino"
        });
        Director.instances[5] = new Director({
            personID:5,
            name: "Uma Thurman"
        });
        Actor.instances[6] = new Actor({
            personID:6,
            name: "John Travolta"
        });
        Actor.instances[7] = new Actor({
            personID:7 ,
            name: "Ewan McGregor"
        });
        Actor.instances[8] = new Actor({
            personID:8 ,
            name: "Natalie Portman"
        });
        Actor.instances[9] = new Actor({
            personID:9 ,
            name: "Keanu Reeves"
        });
        Actor.instances[10] = new Actor({
            personID:10 ,
            name: "Francis Ford Coppola"
        });
        Actor.instances[11] = new Actor({
            personID:11 ,
            name: "Natalie Portman",
            agent: 3
        });
        Actor.instances[12] = new Actor({
            personID:12 ,
            name: "Al Pacino"
        });
        Actor.saveAll();
        Director.saveAll();
        Person.saveAll();
        Movie.instances[1] = new Movie({
            movieID:1,
            title: "Pulp Fiction",
            releaseDate: "1994-05-12",
            director: 1,
            actors: [5,6],
            category: MovieCategoryEL.TVSERIESEPISODE,
            tvSeriesName: "GHI",
            episodeNo: 1
        });
        Movie.instances[2] = new Movie({
            movieID:2,
            title: "Star Wars",
            releaseDate: "1977-05-25",
            director: 2,
            actors: [7,8],
            category: MovieCategoryEL.TVSERIESEPISODE,
            tvSeriesName: "DEF",
            episodeNo: 2
        });
        Movie.instances[3] = new Movie({
            movieID:3,
            title: "Dangerous Liaisons",
            releaseDate: "1988-12-16",
            director: 1,
            actors: [9,5],
            category: MovieCategoryEL.TVSERIESEPISODE,
            tvSeriesName: "ABC",
            episodeNo: 3
        });
        Movie.instances[4] = new Movie({
            movieID:4,
            title: "The Godfather",
            releaseDate: "1972-03-15",
            director: 1,
            actors: [9,5],
            category: MovieCategoryEL.BIOGRAPHY,
            about: 5
        });
        Movie.saveAll();
    }catch (e) {
        console.log( `${e.constructor.name}: ${e.message}`);
    }
}

// delete all data
function clearData() {
    if (confirm( "Do you really want to delete the entire database?")) {
        try {
            Person.instances = {};
            localStorage["persons"] = "{}";
            Movie.instances = {};
            localStorage["movies"] = "{}";
            Actor.instances = {};
            localStorage["actors"] = "{}";
            Director.instances = {};
            localStorage["directors"] = "{}";
            console.log("All data cleared.");
        } catch (e) {
            console.log( `${e.constructor.name}: ${e.message}`);
        }
    }
}

export { generateTestData, clearData };