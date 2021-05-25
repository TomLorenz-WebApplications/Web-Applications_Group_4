/**
 * @fileOverview  View code of UI for managing Director data
 * @actor Gerd Wagner
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/

import Person from "../m/Person.js";
import Movie from "../m/Movie.js";
import { fillSelectWithOptions } from "../../lib/util.js";

/***************************************************************
 Load data
 ***************************************************************/

Person.getAllPersons();
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
    Person.saveAll();
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
    for (const key of Object.keys(Person.instances)) {
      const director = Person.instances[key];
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = director.personID;
      row.insertCell().textContent = director.name;
        var directed = "";
        //build the played-in string!
        for(let key2 of Object.keys(Movie.instances)){
            if(Movie.instances[key2].director === (director.personID)){
                directed = Movie.instances[key2].title + ";" + directed;
            }
        }
        row.insertCell().textContent = directed;
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
      Person.checkName( createFormEl.name.value).message);
});
// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
      personID: createFormEl.directorID.value,
      name: createFormEl.name.value
  };
  // check all input fields and show error messages
  createFormEl.name.setCustomValidity( Person.checkName( slots.name).message);
  createFormEl.directorID.setCustomValidity( Person.checkPersonID( slots.personID).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Person.addNewPerson( slots);
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
      fillSelectWithOptions( selectUpdateDirectorEl, Person.instances,
          "personID", {displayProp:"name"});
    updateFormEl.reset();
  });
selectUpdateDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);

selectUpdateDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);
updateFormEl.name.addEventListener("input", function () {
    updateFormEl.name.setCustomValidity(
        Person.checkName( updateFormEl.name.value).message);
});
updateFormEl.directorID.addEventListener("input", function () {
    updateFormEl.directorID.setCustomValidity(
        Person.checkPersonID( updateFormEl.directorID.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const directorIdRef = updateFormEl.directorID.value;
  if (!directorIdRef) return;
  const slots = {
      personID: Number(updateFormEl.directorID.value),
      name: updateFormEl.name.value
  }
  // save the input data only if all of the form fields are valid
  // check all property constraints
  // save the input data only if all of the form fields are valid
  if (selectUpdateDirectorEl.checkValidity() && updateFormEl.checkValidity()) {
      Person.updatePerson(slots);
      // update the director selection list's option element
      selectUpdateDirectorEl.options[selectUpdateDirectorEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle director selection events
 * when a director is selected, populate the form with the data of the selected director
 */
function handleDirectorSelectChangeEvent() {
  var key = "", dir = null,
  key = updateFormEl.selectDirector.value;
      if(key){
          dir = Person.instances[key];
          updateFormEl.directorID.value = dir.personID;
          updateFormEl.name.value = dir.name;
        }else {
          updateFormEl.reset();
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
    fillSelectWithOptions( selectDeleteDirectorEl, Person.instances,
      "personID", {displayProp:"name"});
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
          Person.deletePerson(directorIdRef);
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
