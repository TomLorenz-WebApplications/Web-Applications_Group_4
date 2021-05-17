import Actor from "../m/Actor.js";
import Movie from "../m/Movie.js";
import Director from "../m/Director.js";

// generate test data
function generateTestData(){
    try{
        Director.instances["1"] = new Director({
            id:1,
            name: "Stephen Frears"
        });
        Director.instances["2"] = new Director({
            id:2,
            name: "George Lucas"
        });
        Director.instances["3"] = new Director({
            id:3,
            name: "Quentin Tarantino"
        });
        Director.saveAll();
        Actor.instances["5"] = new Actor({
            id:5,
            name: "Uma Thurman"
        });
        Actor.instances["6"] = new Actor({
            id:6,
            name: "John Travolta"
        });
        Actor.instances["7"] = new Actor({
            id:7 ,
            name: "Ewan McGregor"
        });
        Actor.instances["8"] = new Actor({
            id:8 ,
            name: "Natalie Portman"
        });
        Actor.instances["9"] = new Actor({
            id:9 ,
            name: "Keanu Reeves"
        });
        Actor.saveAll();
        Movie.instances["1"] = new Movie({
            movieID:1,
            title: "Pulp Fiction",
            releaseDate: "1994-05-12",
            director: 3,
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
        Movie.saveAll();
    }catch (e) {
        console.log( `${e.constructor.name}: ${e.message}`);
    }
}

// delete all data
function clearData() {
    if (confirm( "Do you really want to delete the entire database?")) {
        try {
            Actor.instances = {};
            localStorage["actors"] = "{}";
            Director.instances = {};
            localStorage["directors"] = "{}";
            Movie.instances = {};
            localStorage["movies"] = "{}";
            console.log("All data cleared.");
        } catch (e) {
            console.log( `${e.constructor.name}: ${e.message}`);
        }
    }
}

export { generateTestData, clearData };