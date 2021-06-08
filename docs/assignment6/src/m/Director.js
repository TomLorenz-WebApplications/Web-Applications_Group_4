import {
  NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation,
  IntervalConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation
}
  from "../../lib/errorTypes.js";

import Movie from "./Movie.js";
import {cloneObject} from "../../lib/util.js";
import Person from "./Person.js";

class Director extends Person{
  constructor({personID, name}) {
    super({personID, name});
  }

}

Director.instances = {};
Person.subtypes.push(Director);

Director.saveAll = function () {
  var jsoncontent = "", err = false;
  try {
    console.log(Director.instances);
    jsoncontent = JSON.stringify(Director.instances);
    localStorage.setItem("directors", jsoncontent);
    console.log("saved all directors")
  } catch (e) {
    alert("Error occured while saving data!" + e);
    err = true;
  }
  if (err) console.log("err occured!");
};

Director.retrieveAll = function () {
  var directors = {};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  try {
    directors = JSON.parse(localStorage["directors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
    directors = {};
  }
  for (const key of Object.keys(directors)) {
    try {
      var id = directors[key]._personID, name = directors[key]._name;
      console.log(id);
      console.log(name);
      Director.instances[key] = new Director({personID: id, name: name});
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing director ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys(directors).length} actor records loaded.`);
  console.log(Director.instances);
};

Director.addNewPerson = function (data) {
  var person = null;
  try {
    person = new Director({personID: data.personID, name: data.name});
    // making sure that Id gets added too the movie

  } catch (e) {
    console.log(`${e.constructor.name} : ${e.message}`);
    person = null;
  }
  if (person) {
    Director.instances[Number(data.personID)] = person;
    console.log("###################CRIIIINGGEGEEGEGE");
    Director.saveAll();
    Movie.saveAll();
    console.log("added new Person!");
  }
}

Director.deletePerson = function (personID) {
  console.log(personID);
  if (Director.instances[personID]) {
    var isActor, isDirector = false;
    for (const key of Object.keys(Director.instances)) {
      if (key === personID) {
        isDirector = true;
        confirm("Director is used in a movie! Remove Director first from the movie before deleting!");
        throw("Director is used in a movie! Remove Director first from the movie before deleting!");
      }
    }
    if (isDirector) {
      console.log("cant delete person because it is used.");
    } else {
      delete Director.instances[personID];
      for (const Subtype of Person.subtypes) {
        if (personID in Subtype.instances) delete Subtype.instances[personID];
      }
      Director.saveAll();
      console.log(personID + "deleted");
    }
  } else {
    console.log("no such person");
  }
}

Director.updatePerson = function (data) {
  var noviolation = true, updatedProperties = [];
  const person = Director.instances[data.personID];
  const personbeforeupdate = cloneObject(person);

  try {
    console.log(data.playedIn);
    if (data.playedIn) {
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
    if (Number(data.personID) !== Number(person.personID)) {
      person.personID = Number(data.personID);
      updatedProperties.push("personID");
    }
    if (data.name !== person.name) {
      person.name = data.name;
      updatedProperties.push("name");
    }

  } catch (e) {
    console.log(data.personID);
    console.log(person.personID);
    noviolation = false;
    Director.instances[personbeforeupdate.personID] = personbeforeupdate;
    console.log("while updating: " + e.constructor.name + ":" + e.message);
  }
  if (noviolation) {
    if (updatedProperties.length > 0) {
      console.log("updated " + data.name);
      Person.saveAll();
    } else {
      console.log("nothing to update");
    }
  }
}

//unlikely that this ever happens since all movies need to be deleted before this would work.
Director.clearAll = function () {
  if (confirm("Really delete all Directors?")) {
    try {
      Director.instances = {}
      localStorage["directors"] = "{}";
      console.log("deleted all Directors");
    } catch (e) {
      console.log(e.constructor.name + ":" + e.message);
    }
  }
}

export default Person;