/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person from "../m/Person.js";
import Movie from "../m/Movie.js";

import {createMultipleChoiceWidget, fillSelectWithOptions} from "../../lib/util.js";
import Actor from "../m/Actor.js";
import Director from "../m/Director.js";

/***************************************************************
 Load data
 ***************************************************************/

Actor.retrieveAll();
Director.retrieveAll();
Person.retrieveAll();
Movie.getAllMovies();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
for (let btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', function () {
    refreshManageDataUI();
  });
}
// neutralize the submit event for all use cases
for (let frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Person.saveAll();
  // also save books because books may be deleted when an actor is deleted
  Movie.saveAll();
});

/**********************************************
 Use case Retrieve and List All Actors
 **********************************************/
document.getElementById("retrieveAll")
  .addEventListener("click", function () {
    const tableBodyEl = document.querySelector("section#Actor-R > table > tbody");
    tableBodyEl.innerHTML = "";
    console.log(Actor.instances);
    for (let key of Object.keys(Actor.instances)) {
      const actor = Actor.instances[key];
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = actor.name;
      row.insertCell().textContent = actor.personID;
      var playedIn = "";
      //build the played-in string!
      for (let key2 of Object.keys(Movie.instances)) {
        if (Movie.instances[key2].actors.includes(actor.personID)) {
          playedIn = Movie.instances[key2].title + ";" + playedIn;
        }
      }
      row.insertCell().textContent = playedIn;

      if (actor.agent) {
        row.insertCell().textContent = Person.instances[actor.agent].name;
      }

    }
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-R").style.display = "block";
  });

/**********************************************
 Use case Create Actor
 **********************************************/
const createFormEl = document.querySelector("section#Actor-C > form"),
  selectMovies = createFormEl.selectMovies;
document.getElementById("create")
  .addEventListener("click", function () {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-C").style.display = "block";
    fillSelectWithOptions(selectMovies, Movie.instances, "movieID", {displayProp: "title"});
    createFormEl.reset();
  });
// set up event handlers for responsive constraint validation
createFormEl.actorID.addEventListener("input", function () {
  createFormEl.actorID.setCustomValidity(
    Person.checkPersonID(createFormEl.actorID.value).message);
});

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personID: createFormEl.actorID.value,
    name: createFormEl.name.value,
    playedIn: []
  };
  console.log(slots);
  // check all input fields and show error messages
  createFormEl.actorID.setCustomValidity(
    Person.checkPersonID(slots.personID).message);
  createFormEl.name.setCustomValidity(Person.checkName(slots.name).message);
  var selectedMovies = createFormEl.selectMovies.selectedOptions;
  for (const opt of selectedMovies) {
    console.log(opt);
    slots.playedIn.push(Number(opt.value));
    console.log(Number(opt.value));
  }
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Actor.add({personID: slots.personID, name: slots.name, playedIn: slots.playedIn});
});

/**********************************************
 Use case Update Actor
 **********************************************/
const updateFormEl = document.querySelector("section#Actor-U > form");
const selectUpdateActorEl = updateFormEl.selectActor;
const selectupdateMovies = updateFormEl.selectMovieUpdate;
document.getElementById("update")
  .addEventListener("click", function () {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-U").style.display = "block";
    // set up the actor selection list
    fillSelectWithOptions(selectUpdateActorEl, Actor.instances,
      "personID", {displayProp: "name"});
    fillSelectWithOptions(selectupdateMovies, Movie.instances, "movieID", {displayProp: "title"});
    updateFormEl.reset();
  });
selectUpdateActorEl.addEventListener("change", handleActorSelectChangeEvent);

updateFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
    Person.checkPersonID(createFormEl.name.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const actorIdRef = selectUpdateActorEl.value;
  if (!actorIdRef) return;
  const slots = {
    personID: updateFormEl.actorID.value,
    name: updateFormEl.name.value,
    playedIn: []
  }
  var selectedMovies = updateFormEl.selectMovieUpdate.selectedOptions;
  for (const opt of selectedMovies) {
    console.log(opt);
    slots.playedIn.push(Number(opt.value));
    console.log(Number(opt.value));
  }
  updateFormEl.name.setCustomValidity(Person.checkName(slots.name).message);

  if (selectUpdateActorEl.checkValidity() && updateFormEl.checkValidity()) {
    console.log(slots);
    Actor.updatePerson(slots);
    Actor.saveAll();
    Person.saveAll();
    // update the actor selection list's option element
    selectUpdateActorEl.options[selectUpdateActorEl.selectedIndex].text = slots.name;
  }
});

function handleActorSelectChangeEvent() {
  let key = "", act = null;
  key = updateFormEl.selectActor.value;
  console.log(key);
  if (key) {
    act = Person.instances[key];
    updateFormEl.actorID.value = act.personID;
    updateFormEl.name.value = act.name;
    var playeedMovies = []
    console.log(Movie.instances);
    for (const opt of Object.keys(Movie.instances)) {
      console.log(opt)
      if (Movie.instances[opt].actors.includes(act.personID)) {
        playeedMovies.push(Movie.instances[opt].movieID);
      }
    }
    console.log(selectupdateMovies);
    for (const opt of playeedMovies) {
      for (const ind of selectupdateMovies) {
        console.log(ind);
        if (Number(ind.value) === Number(opt)) {
          ind.selected = true;
        } else {
          ind.selected = false;
        }
      }
    }
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 Use case Delete Actor
 **********************************************/
const deleteFormEl = document.querySelector("section#Actor-D > form");
const selectDeleteActorEl = deleteFormEl.selectActor;
document.getElementById("destroy")
  .addEventListener("click", function () {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-D").style.display = "block";
    // set up the actor selection list
    fillSelectWithOptions(selectDeleteActorEl, Person.instances,
      "personID", {displayProp: "name"});
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const actorIdRef = selectDeleteActorEl.value;
  if (!actorIdRef) return;
  if (confirm("Do you really want to delete this actor?")) {
    Person.deletePerson(actorIdRef);
    selectDeleteActorEl.remove(deleteFormEl.selectActor.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Actors Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage actor UI and hide the other UIs
  document.getElementById("Actor-M").style.display = "block";
  document.getElementById("Actor-R").style.display = "none";
  document.getElementById("Actor-C").style.display = "none";
  document.getElementById("Actor-U").style.display = "none";
  document.getElementById("Actor-D").style.display = "none";
}

// Set up Manage Actors UI
refreshManageDataUI();