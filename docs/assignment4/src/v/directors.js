/**
 * @fileOverview  View code of UI for managing Director data
 * @actor Gerd Wagner
 */
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
// set up back-to-menu buttons for all use cases
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
  Director.saveAll();
  Movie.saveAll();
});

/**********************************************
 Use case Retrieve/List All Directors
 **********************************************/
document.getElementById("retrieveAll")
  .addEventListener("click", function () {
    const tableBodyEl = document
      .querySelector("section#Director-R > table > tbody");
    tableBodyEl.innerHTML = "";
    for (const key of Object.keys(Director.instances)) {
      const director = Director.instances[key];
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = director.directorID;
      row.insertCell().textContent = director.name;
    }
    document.getElementById("Director-M").style.display = "none";
    document.getElementById("Director-R").style.display = "block";
  });

/**********************************************
 Use case Create Director
 **********************************************/
const createFormEl = document.querySelector("section#Director-C > form");
document.getElementById("create")
  .addEventListener("click", function () {
    document.getElementById("Director-M").style.display = "none";
    document.getElementById("Director-C").style.display = "block";
    createFormEl.reset();
  });
// set up event handlers for responsive constraint validation
createFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
    Director.checkName( createFormEl.name.value).message);
});
// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    name: createFormEl.name.value,
    id: createFormEl.directorID.value
  };
  // check all input fields and show error messages
  createFormEl.name.setCustomValidity( Director.checkNameAsIdRef( slots.name).message);
  createFormEl.directorID.setCustomValidity( Director.checkDirectorID( slots.id).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Director.add( slots);
});

/**********************************************
 * Use case Update Director
 **********************************************/
const updateFormEl = document.querySelector("section#Director-U > form");
const selectUpdateDirectorEl = updateFormEl.selectDirector;
document.getElementById("update")
  .addEventListener("click", function () {
    document.getElementById("Director-M").style.display = "none";
    document.getElementById("Director-U").style.display = "block";
    // set up the director selection list
    fillSelectWithOptions( selectUpdateDirectorEl, Director.instances,
      "name");
    updateFormEl.reset();
  });
selectUpdateDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);
updateFormEl.name.addEventListener("input", function () {
  updateFormEl.name.setCustomValidity(
    Director.checkName( updateFormEl.name.value).message);
});
updateFormEl.directorID.addEventListener("input", function () {
  updateFormEl.directorID.setCustomValidity(
    Director.checkName( updateFormEl.directorID.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const directorIdRef = updateFormEl.directorID.value;
  if (!directorIdRef) return;
  const slots = {
      _directorID: Number(updateFormEl.directorID.value),
      _name: updateFormEl.name.value
  }
  // save the input data only if all of the form fields are valid
  updateFormEl.name.setCustomValidity( Director.checkName( slots.name).message);
  updateFormEl.directorID.setCustomValidity( Director.checkDirectorID( slots.name).message);
  console.log(slots);
  // check all property constraints
  // save the input data only if all of the form fields are valid
  if (selectUpdateDirectorEl.checkValidity() && updateFormEl.checkValidity()) {
      Director.update(slots);
      // update the director selection list's option element
      selectUpdateDirectorEl.options[selectUpdateDirectorEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle director selection events
 * when a director is selected, populate the form with the data of the selected director
 */
function handleDirectorSelectChangeEvent() {
  var keyvalue = "", dir = null;
  keyvalue = updateFormEl.selectDirector.value;
  for(const key of Object.keys(Director.instances)){
      if(Director.instances[key].name === keyvalue){
          updateFormEl.reset();
          dir = Director.instances[key];
          console.log(dir);
          updateFormEl.directorID.value = dir.directorID;
          updateFormEl.name.value = dir.name;
        }
  }
}


/**********************************************
 * Use case Delete Director
 **********************************************/
const deleteFormEl = document.querySelector("section#Director-D > form");
const selectDeleteDirectorEl = deleteFormEl.selectDirector;
document.getElementById("destroy")
  .addEventListener("click", function () {
    document.getElementById("Director-M").style.display = "none";
    document.getElementById("Director-D").style.display = "block";
    // set up the director selection list
    fillSelectWithOptions( selectDeleteDirectorEl, Director.instances,
      "directorID", {displayProp:"name"});
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const directorIdRef = selectDeleteDirectorEl.value;
  if (!directorIdRef) return;
  if (confirm( "Do you really want to delete this director?")) {
      var isAssigned = false;
      console.log(Movie.instances);
      for (const key of Object.keys(Movie.instances)){
          if(key === directorIdRef){
              isAssigned = true;
              confirm( "Director is used in a movie! Remove Director first from the movie before deleting!");
          }
      }
      if(!isAssigned){
          Director.destroy(directorIdRef);
          console.log("destroyed Director")
      }
  }
});

/**********************************************
 * Refresh the Manage Directors Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage director UI and hide the other UIs
  document.getElementById("Director-M").style.display = "block";
  document.getElementById("Director-R").style.display = "none";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "none";
  document.getElementById("Director-D").style.display = "none";
}

// Set up Manage Directors UI
refreshManageDataUI();
