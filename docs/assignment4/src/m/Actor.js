
import {
  MandatoryValueConstraintViolation,
  NoConstraintViolation,
  RangeConstraintViolation, ReferentialIntegrityConstraintViolation,
  UniquenessConstraintViolation
} from "../../lib/errorTypes.js";
import {cloneObject} from "../../lib/util.js";
import Movie from "./Movie.js";

class Actor {

  constructor(actor) {
    this.actorID = actor.id;
    this.name = actor.name;
    console.log("Actor Constr (id,name):", this.actorID, this._name);
  }

  set actorID(id) {
    const validationResult = Actor.checkActorID(id);
    if (validationResult instanceof NoConstraintViolation) {
      this._actorID = Number(id);
      //this._actorID = id;
    } else {
      throw validationResult;
    }
  }

  get actorID() {
    return this._actorID;
  }

  static checkActorID(actorID) {
    console.log( actorID);
    var id = Number(actorID);
    console.log(id);
    if (typeof (id) != "number" || id < 1 || isNaN(id)) {
      return new RangeConstraintViolation("id must be a positive integer");
    } else if (Actor.instances[id]) {
      console.log("Actor.instances[id]:", Actor.instances[id]);
      return new UniquenessConstraintViolation("a actor ID must be unique!");
    } else {
      return new NoConstraintViolation();
    }
  }

  static checkActorID2( id) {
    if (!id) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      id = parseInt( id);  // convert to integer
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The author ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }

  static checkActorIdAsIdRef(id) {
    var constraintViolation = Actor.checkActorID(id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      if (!Actor.instances[id]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
          "There is no actor record with this actor ID!");
      }
    }
    return constraintViolation;
  }

  get name() {
    return this._name;
    //return this._name;
  }

  set name(name) {
    console.log(name);
    const validationResult = Actor.checkName(name);
    if (validationResult instanceof NoConstraintViolation) {
      //this._name = name;
      this._name = name;
    } else {
      throw validationResult;
    }
  }

  static checkName(name) {
    if (!name) {
      return new MandatoryValueConstraintViolation("a name is needed");
    } else {
      return new NoConstraintViolation();
    }
  }
}

Actor.instances = {};


//Static functions
//add new Actor
Actor.add = function (slots) {
  var actor = null;
  try {
    console.log(slots);
    actor = new Actor(slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    actor = null;
  }
  if (actor) {
    Actor.instances[actor.actorID] = actor;
    console.log(`added: ${actor.name}`);
  }
};

Actor.update = function ({actorID, name}) {
  const actor = Actor.instances[String(actorID)],
    objectBeforeUpdate = cloneObject(actor);
  var noConstraintViolated = true, ending = "", updatedProperties = [];
  try {
    if (name && actor.name !== name) {
      actor.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Actor.instances[actorID] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for actor ${name}`);
    } else {
      console.log(`No property value changed for actor ${name}!`);
    }
  }
};

Actor.destroy = function (actorID) {
  const actor = Actor.instances[actorID];
  for (const id of Object.keys(Movie.instances)) {
    const movie = Movie.instances[id];
    if (movie.actors[actorID]) delete movie.actors[actorID];
  }
  // delete the actor object
  delete Actor.instances[actorID];
  console.log(`Actor ${actor.name} deleted.`);
};

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
      // convert record to (typed) object
      console.log("########");
      var id = Number(actors[key]._actorID), name = actors[key]._name;
      console.log(id);
      console.log(name);
      Actor.instances[key] = new Actor({id, name});
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing actor ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys(actors).length} actor records loaded.`);
  console.log(Actor.instances);
};

Actor.saveAll = function () {
  const nmrOfActors = Object.keys(Actor.instances).length;
  try {
    localStorage["actors"] = JSON.stringify(Actor.instances);
    console.log(`${nmrOfActors} actor records saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};
export default Actor;