
import {
  MandatoryValueConstraintViolation,
  NoConstraintViolation,
  RangeConstraintViolation,
  UniquenessConstraintViolation,
  ReferentialIntegrityConstraintViolation
} from "../../lib/errorTypes.js";
import {cloneObject} from "../../lib/util.js";

class Director {
  constructor(director) {
    this.directorID = director.id;
    this.name = director.name;
    console.log("Director Constr id,name:", this.directorID, this.name);
  }

  set directorID(id) {
    const validationResult = Director.checkDirectorID(id);
    if (validationResult instanceof NoConstraintViolation) {
      this._directorID = Number(id);
      //this._directorID = id;
    } else {
      throw validationResult;
    }
  }

  get directorID() {
    return this._directorID;
    //return this._directorID;
  }

  static checkDirectorID(directorID) {
    var id = Number(directorID);
    if (typeof (id) != "number" || id == "" || id < 1 || isNaN(id)) {
      return new RangeConstraintViolation("id must be a positive integer");
    } else if (Director.instances[id]) {
      return new UniquenessConstraintViolation("a director ID must be unique!");
    } else {
      return new NoConstraintViolation();
    }
  }

  get name() {
    return this._name;
    //return this._name;
  }

  set name(name) {
    const validationResult = Director.checkName(name);
    if (validationResult instanceof NoConstraintViolation) {
      //this.director._name = name;
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

  static checkNameAsIdRef(n) {
    var validationResult = Director.checkName(n);
    console.log("name", n)
    if ((validationResult instanceof NoConstraintViolation) && n) {
      if (Director.instances[n]) {
        console.log(Director.instances[n])
        validationResult = new ReferentialIntegrityConstraintViolation(
          "There is already a director with this name!");
      }
    }
    return validationResult;
  }

}

Director.instances = {};
//Static functions
//add new Director
Director.add = function (slots) {
  var director = null;
  try {
    console.log(slots);
    director = new Director(slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    director = null;
  }
  if (director) {
    Director.instances[director.directorID] = director;
    console.log(`added: ${director.name}`)
  }
};

Director.update = function (slots) {
  console.log(Director.instances);
  console.log(slots);

  const director = Director.instances[slots._directorID];
  console.log(director);
   const objectBeforeUpdate = cloneObject(director);
  var noConstraintViolated = true,
    ending = "", updatedProperties = [];
  try {
    if ("directorID" in slots && director.directorID !== slots.directorID) {
      console.log("##############");
      director.directorID = slots.directorID;
      updatedProperties.push("directorID");
    }
    if(director.name !== slots.name){
      director.name = slots._name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Director.instances[slots.directorID] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {

      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for director ${director.name}`);
    } else {
      console.log(`No property value changed for director ${director.name}!`);
    }
  }
};

Director.destroy = function (name) {
  console.log(`${Director.instances[name].name} deleted.`);
  // delete all references to this director in movie objects
  delete Director.instances[name];  // delete the slot

};

Director.retrieveAll = function () {
  var directors = {};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  try {
    directors = JSON.parse(localStorage["directors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
    return;
  }
  for (let dirName of Object.keys(directors)) {
    try {

      var id = Number(directors[dirName]._directorID),
      name = directors[dirName]._name;
      console.log(id);
      console.log(name);
      Director.instances[dirName] = new Director({id, name});
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing director ${dirName}: ${e.message}`);
    }
  }
  console.log(`${Object.keys(directors).length} director records loaded.`);
};

Director.saveAll = function () {
  const directorNrs = Object.keys(Director.instances).length;
  try {
    localStorage["directors"] = JSON.stringify(Director.instances);
    console.log(`${directorNrs} director records saved.`);
  } catch (e) {
    console.error("Error when writing to Local Storage\n" + e);
  }
};
export default Director;