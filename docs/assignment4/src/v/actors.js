/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Actor from "../m/Actor.js";
import Director from "../m/Director.js";
import Movie from "../m/Movie.js";

import { fillSelectWithOptions } from "../../lib/util.js";

/***************************************************************
 Load data
 ***************************************************************/
Actor.retrieveAll();
Director.retrieveAll();
Movie.getAllMovies();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
for (let btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', function () {refreshManageDataUI();});
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
  Actor.saveAll();
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
      console.log(actor);
      row.insertCell().textContent = actor.name;
      row.insertCell().textContent = actor.actorID;
    }
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-R").style.display = "block";
  });

/**********************************************
 Use case Create Actor
 **********************************************/
const createFormEl = document.querySelector("section#Actor-C > form");
document.getElementById("create")
  .addEventListener("click", function () {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-C").style.display = "block";
    createFormEl.reset();
  });
// set up event handlers for responsive constraint validation
createFormEl.actorID.addEventListener("input", function () {
  createFormEl.actorID.setCustomValidity(
    Actor.checkActorID( createFormEl.actorID.value).message);
});

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    id: createFormEl.actorID.value,
    name: createFormEl.name.value
  };
  console.log(slots);
  // check all input fields and show error messages
  createFormEl.actorID.setCustomValidity(
    Actor.checkActorID( slots.id).message);
  createFormEl.name.setCustomValidity(Actor.checkName( slots.name).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Actor.add( slots);
});

/**********************************************
 Use case Update Actor
 **********************************************/
const updateFormEl = document.querySelector("section#Actor-U > form");
const selectUpdateActorEl = updateFormEl.selectActor;
document.getElementById("update")
  .addEventListener("click", function () {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-U").style.display = "block";
    // set up the actor selection list
    fillSelectWithOptions( selectUpdateActorEl, Actor.instances,
      "actorID", {displayProp:"name"});
    updateFormEl.reset();
  });
selectUpdateActorEl.addEventListener("change", handleActorSelectChangeEvent);

updateFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
    Actor.checkActorID( createFormEl.name.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const actorIdRef = selectUpdateActorEl.value;
  if (!actorIdRef) return;
  const slots = {
    actorID: updateFormEl.actorID.value,
    name: updateFormEl.name.value
  }

  updateFormEl.name.setCustomValidity(Actor.checkName( slots.name).message);

  if (selectUpdateActorEl.checkValidity() && updateFormEl.checkValidity()) {
    Actor.update( slots);
    // update the actor selection list's option element
    selectUpdateActorEl.options[selectUpdateActorEl.selectedIndex].text = slots.name;
  }
});

function handleActorSelectChangeEvent () {
  let key = "", act = null;
  key = updateFormEl.selectActor.value;
  if (key) {
    act = Actor.instances[key];
    updateFormEl.actorID.value = act.actorID;
    updateFormEl.name.value = act.name;
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
    fillSelectWithOptions( selectDeleteActorEl, Actor.instances,
      "actorID", {displayProp:"name"});
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const actorIdRef = selectDeleteActorEl.value;
  if (!actorIdRef) return;
  if (confirm( "Do you really want to delete this actor?")) {
    Actor.destroy( actorIdRef);
    selectDeleteActorEl.remove( deleteFormEl.selectActor.selectedIndex);
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