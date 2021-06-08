import {
  MandatoryValueConstraintViolation,
  NoConstraintViolation,
  RangeConstraintViolation, ReferentialIntegrityConstraintViolation,
  UniquenessConstraintViolation
} from "../../lib/errorTypes.js";
import {cloneObject} from "../../lib/util.js";
import Movie from "./Movie.js";
import Person from "./Person.js";
import {Enumeration} from "../../lib/Enumeration.js";
import Director from "./Director.js";

class Actor extends Person {

  constructor({personID, name, agent}) {
    super({personID, name});
    if (agent) {
      this.agent = agent;
      console.log("Actor Constr (id,name, agent):", this.personID, this.name, this.agent);
    } else {
      console.log("Actor Constr (id,name):", this.personID, this.name);
    }
  }

  set agent(agent) {
    var validationResult = Actor.checkAgent(agent);
    if (validationResult instanceof NoConstraintViolation) {
      this._agent = agent;
    } else {
      throw validationResult;
    }
  }

  get agent() {
    return this._agent;
  }

  static checkAgent(agent) {
    if (isNaN(Number(agent)) || Number(agent) < 1) {
      return new RangeConstraintViolation("Agent must be positive integer");
    } else {
      return new NoConstraintViolation();
    }
  }
}

Actor.instances = {};
Person.subtypes.push(Actor);

Actor.add = function (slots) {
  var act = null;
  try {
    act = new Actor(slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    act = null;
  }
  if (act) {
    Actor.instances[Number(slots.personID)] = act;
    console.log(slots.playedIn);
    if (slots.playedIn) {
      console.log(Movie.instances);
      for (const movie of slots.playedIn) {
        console.log(movie)
        if (!Movie.instances[movie].actors.includes(slots.personID)) {
          Movie.instances[movie].actors.push(slots.personID);
        }
      }
    }
    console.log(`${act.toString()} created!`);
  }
}

Actor.update = function ({personID, name, agent}) {
  const actor = Actor.instances[Number(personID)],
    objectBeforeUpdate = cloneObject(actor);
  var noConstraintViolated = true, ending = "", updatedProperties = [];
  try {
    if (name && actor.name !== name) {
      actor.name = name;
      updatedProperties.push("name");
    }
    if (!isNaN(Number(agent)) && actor.agent !== agent) {
      actor.agent = Number(agent);
      updatedProperties.push("agent");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Actor.instances[personID] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for actor ${name}`);
    } else {
      console.log(`No property value changed for actor ${name}!`);
    }
  }
}

Actor.destroy = function (personID) {
  const name = Actor.instances[personID].name;
  delete Actor.instances[personID];
  console.log(`Actor ${name} deleted.`)
}

Actor.retrieveAll = function () {
  var actors = {};
  if (!localStorage["actors"]) localStorage["actors"] = "{}";
  try {
    actors = JSON.parse(localStorage["actors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
    actors = {};
  }
  for (const key of Object.keys(actors)) {
    try {
      var id = actors[key]._personID, name = actors[key]._name, agent = actors[key]._agent;
      console.log(id);
      console.log(name);
      console.log(agent);
      Actor.instances[key] = new Actor({personID: id, name: name, agent: agent});
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing actor ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys(actors).length} actor records loaded.`);
  console.log(Actor.instances);
}

Actor.saveAll = function () {
  const nmrOfActors = Object.keys(Actor.instances).length;
  try {
    localStorage["actors"] = JSON.stringify(Actor.instances);
    console.log(`${nmrOfActors} actor records saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
}

export default Actor;
