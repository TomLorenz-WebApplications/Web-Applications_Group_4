
import Movie from "../m/Movie.js";
import Person from "../m/Person.js";

// generate test data
function generateTestData(){
    try{
        Person.instances["1"] = new Person({
            personID:1,
            name: "Stephen Frears"
        });
        Person.instances["2"] = new Person({
            personID:2,
            name: "George Lucas"
        });
        Person.instances["3"] = new Person({
            personID:3,
            name: "Quentin Tarantino"
        });
        Person.instances["5"] = new Person({
            personID:5,
            name: "Uma Thurman"
        });
        Person.instances["6"] = new Person({
            personID:6,
            name: "John Travolta"
        });
        Person.instances["7"] = new Person({
            personID:7 ,
            name: "Ewan McGregor"
        });
        Person.instances["8"] = new Person({
            personID:8 ,
            name: "Natalie Portman"
        });
        Person.instances["9"] = new Person({
            personID:9 ,
            name: "Keanu Reeves"
        });
        Person.instances["10"] = new Person({
            personID:10 ,
            name: "Francis Ford Coppola"
        });
        Person.instances["11"] = new Person({
            personID:11 ,
            name: "Natalie Portman"
        });
        Person.instances["12"] = new Person({
            personID:12 ,
            name: "Al Pacino"
        });
        Person.saveAll();
        Movie.instances["1"] = new Movie({
            movieID:1,
            title: "Pulp Fiction",
            releaseDate: "1994-05-12",
            director: 1,
            actors: [5,6]
        });
        Movie.instances["2"] = new Movie({
            movieID:2,
            title: "Star Wars",
            releaseDate: "1977-05-25",
            director: 2,
            actors: [7,8]
        });
        Movie.instances["3"] = new Movie({
            movieID:3,
            title: "Dangerous Liaisons",
            releaseDate: "1988-12-16",
            director: 1,
            actors: [9,5]
        });
        Movie.instances["4"] = new Movie({
            movieID:4,
            title: "The Godfather",
            releaseDate: "1972-03-15",
            director: 1,
            actors: [9,5]
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
            console.log("All data cleared.");
        } catch (e) {
            console.log( `${e.constructor.name}: ${e.message}`);
        }
    }
}

export { generateTestData, clearData };