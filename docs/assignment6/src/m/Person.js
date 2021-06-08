import { NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
    IntervalConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation }
    from "../../lib/errorTypes.js";

import Movie from "./Movie.js";
import {cloneObject} from "../../lib/util.js";

class Person {
    constructor({personID, name}) {
        this.personID = personID;
        this.name = name;
    }

    get personID(){
        return this._personID;
    }

    set personID(personID){
        console.log(personID);
        const validationResult = Person.checkPersonID(personID);
        if(validationResult instanceof NoConstraintViolation){
            this._personID = Number(personID);
        }else{
            throw validationResult;
        }
    }

    static checkPersonID(personID){
        if(isNaN(Number(personID)) || Number(personID) < 1){
            return new RangeConstraintViolation("person ID needs to be positive Integer")
        }else{
            if(Person.instances[personID]){
                return new UniquenessConstraintViolation("personID is already existent! ID must be unique");
            }else {
                return new NoConstraintViolation();
            }
        }

    }
    static checkPersonID2(personID){
        if(isNaN(Number(personID)) || Number(personID) < 1){
            return new RangeConstraintViolation("person ID needs to be positive Integer")
        }else{
            return new NoConstraintViolation();
        }
    }

    get name(){
        return this._name;
    }
    set name(name){
        this._name = name;
    }
    static checkName(name){
        if(!name){
            return new MandatoryValueConstraintViolation("a name must be given!");
        }else{
            var alreadyexistent = false;
            //just loading
            for (let key of Object.keys(Person.instances)) {
                if(key.name === name){alreadyexistent=true}
            }
            if(alreadyexistent){
                return new UniquenessConstraintViolation("name already existent!");
            }else {
                return new NoConstraintViolation();
            }
        }
    }
}

Person.instances = {};
Person.subtypes = [];

Person.saveAll = function () {
    var jsoncontent = "", err = false;
    try {
        jsoncontent = JSON.stringify(Person.instances);
        localStorage.setItem("persons", jsoncontent);
        console.log("saved all persons")
    } catch (e) {
        alert("Error occured while saving data!" + e);
        err = true;
    }
    if (err) console.log("err occured!");
};

Person.retrieveAll = function () {
    var persons = {};
    try {
        if (!localStorage["persons"]) localStorage["persons"] = "{}";
        else {
            persons = JSON.parse(localStorage["persons"]);
        }
    } catch (e) {
        alert("Error when reading from Local Storage\n" + e);
    }
    for (let id of Object.keys(persons)) {
        try {
            console.log(id);
            var persid = persons[id]._personID, name = persons[id]._name;
            Person.instances[id] = new Person({personID:persid,name:name});
        } catch (e) {
            console.log(`${e.constructor.name} while deserializing person ${id}: ${e.message}`);
        }
    }
    for (const Subtype of Person.subtypes){

        Subtype.retrieveAll();
        for(const key of Object.keys(Subtype.instances)){
            Person.instances[Number(key)] = Subtype.instances[Number(key)];
        }
    }
    console.log(`${Object.keys(persons).length} person records loaded.`);

};

Person.addNewPerson = function (data) {
    var person = null;
    try{
        person = new Person({personID: data.personID, name: data.name});
        // making sure that Id gets added too the movie

    }catch (e) {
        console.log(`${e.constructor.name} : ${e.message}`);
        person = null;
    }
    if(person){
        Person.instances[Number(person.personID)] = person;
        Person.saveAll();
        Movie.saveAll();
        console.log("added new Person!");
    }
}

Person.deletePerson = function (personID) {
    console.log(personID);
    if(Person.instances[personID]){
        var isActor, isDirector = false;
        for (const key of Object.keys(Movie.instances)){
            if(key === personID){
                isDirector = true;
                confirm("Director is used in a movie! Remove Director first from the movie before deleting!");
                throw("Director is used in a movie! Remove Director first from the movie before deleting!");
            }
            console.log(Movie.instances[key].actors);
            if(Movie.instances[key].actors.includes(Number(personID))){
                isActor = true;
                confirm("Actor is still assigned too a Movie! Release the Actor from Movie before deleting!");
                throw("Actor is still assigned too a Movie! Release the Actor from Movie before deleting!");
            }
        }
        if(isActor || isDirector){
            console.log("cant delete person because it is used.");
        }   else {
            delete Person.instances[personID];
            for (const Subtype of Person.subtypes) {
                if (personID in Subtype.instances) delete Subtype.instances[personID];
            }
            Person.saveAll();
            console.log(personID + "deleted");
        }
    }else {
        console.log("no such person");
    }
}

Person.updatePerson = function (data) {
    var noviolation = true, updatedProperties = [];
    const person = Person.instances[data.personID];
    const personbeforeupdate = cloneObject(person);

    try{
        console.log(data.playedIn);
        if(data.playedIn){
            // adding/removing on update from movies as actor.
            for (let key of Object.keys(Movie.instances)) {
                console.log(Movie.instances[key].actors);
                console.log(data.personID);
                if (Movie.instances[Number(key)].actors.includes(Number(data.personID)) && !data.playedIn.includes(Number(key))) {
                    console.log("removing");
                    Movie.instances[key].actors.splice(key, 1);
                    updatedProperties.push("plays in");
                } else {
                    console.log(key);
                    console.log(data.playedIn);
                    if (!Movie.instances[key].actors.includes(data.personID) && data.playedIn.includes(Number(key))) {
                        console.log("adding");
                        Movie.instances[key].actors.push(Number(data.personID));
                        updatedProperties.push("plays in");
                    }
                }
            }
        }
        if(Number(data.personID) !== Number(person.personID)){
            person.personID = Number(data.personID);
            updatedProperties.push("personID");
        }
        if(data.name !== person.name){
            person.name = data.name;
            updatedProperties.push("name");
        }

    }catch (e) {
        console.log(data.personID);
        console.log(person.personID);
        noviolation = false;
        Person.instances[personbeforeupdate.personID] = personbeforeupdate;
        console.log("while updating: " + e.constructor.name + ":" + e.message);
    }
    if(noviolation){
        if(updatedProperties.length > 0){
            console.log("updated " + data.name);
            Person.saveAll();
        } else {
            console.log("nothing to update");
        }
    }
}

//unlikely that this ever happens since all movies need to be deleted before this would work.
Person.clearAll = function () {
    if(confirm("Really delete all Persons?")){
        try{
            Person.instances = {}
            localStorage["persons"] = "{}";
            console.log("deleted all Persons");
        }catch (e) {
            console.log(e.constructor.name + ":" + e.message);
        }
    }
}

export default Person;































