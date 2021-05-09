import Actor from "../m/Actor.js";
import Movie from "../m/Movie.js";
import Director from "../m/Director.js";

// generate test data
function generateTestData(){
    try{
        Director.instances["1"] = new Author({
            authorId: 1,
            name: "Daniel Dennett"
        });
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