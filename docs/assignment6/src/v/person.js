import Person from "../m/Person.js";
import {createListFromMap, fillSelectWithOptions, createMultipleChoiceWidget} from "../../lib/util.js";
import Movie from "../m/Movie.js";
import Director from "../m/Director.js";
import Actor from "../m/Actor.js";

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
  Person.saveAll();
});


Person.retrieveAll();
Movie.getAllMovies();
/**********************************************
 Use case Retrieve/List All Persons
 **********************************************/
document.getElementById("getAllPerson")
  .addEventListener("click", function () {
    const tableBodyEl = document
      .querySelector("section#Person-R > table > tbody");
    tableBodyEl.innerHTML = "";
    for (const key of Object.keys(Person.instances)) {
      const director = Person.instances[key];
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = director.personID;
      row.insertCell().textContent = director.name;
      var directed = "";
      //build the played-in string!
      for(let key2 of Object.keys(Movie.instances)){
        if(Movie.instances[key2].about === (director.personID)){
          directed = Movie.instances[key2].title + ";" + directed;
        }
      }
      row.insertCell().textContent = directed;
    }
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-R").style.display = "block";
  });

/**********************************************
 Use case Create Person
 **********************************************/
const createFormEl = document.querySelector("section#Person-C > form");
document.getElementById("create")
    .addEventListener("click", function () {
        document.getElementById("Person-M").style.display = "none";
        document.getElementById("Person-C").style.display = "block";
        createFormEl.reset();
    });
// set up event handlers for responsive constraint validation
createFormEl.name.addEventListener("input", function () {
    createFormEl.name.setCustomValidity(
        Person.checkName(createFormEl.name.value).message);
});
// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
    const slots = {
        personID: createFormEl.personID.value,
        name: createFormEl.name.value
    };
    // check all input fields and show error messages
    createFormEl.name.setCustomValidity(Person.checkName(slots.name).message);
    createFormEl.personID.setCustomValidity(Person.checkPersonID(slots.personID).message);
    // save the input data only if all form fields are valid
    if (createFormEl.checkValidity()) Person.addNewPerson(slots);
});

/**********************************************
 * Use case Update Person
 **********************************************/
const updateFormEl = document.querySelector("section#Person-U > form");
const selectUpdatePersonEl = updateFormEl.selectPerson;
document.getElementById("update")
    .addEventListener("click", function () {
        document.getElementById("Person-M").style.display = "none";
        document.getElementById("Person-U").style.display = "block";
        // set up the director selection list
        fillSelectWithOptions(selectUpdatePersonEl, Person.instances,
            "personID", {displayProp: "name"});
        updateFormEl.reset();
    });
selectUpdatePersonEl.addEventListener("change", handleDirectorSelectChangeEvent);
updateFormEl.name.addEventListener("input", function () {
    updateFormEl.name.setCustomValidity(
        Person.checkName(updateFormEl.name.value).message);
});
updateFormEl.personID.addEventListener("input", function () {
    updateFormEl.personID.setCustomValidity(
        Person.checkPersonID(updateFormEl.personID.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
    const directorIdRef = updateFormEl.personID.value;
    if (!directorIdRef) return;
    const slots = {
        personID: Number(updateFormEl.personID.value),
        name: updateFormEl.name.value
    }
    // save the input data only if all of the form fields are valid
    // check all property constraints
    // save the input data only if all of the form fields are valid
    if (selectUpdatePersonEl.checkValidity() && updateFormEl.checkValidity()) {
        Person.updatePerson(slots);
        // update the director selection list's option element
        selectUpdatePersonEl.options[selectUpdatePersonEl.selectedIndex].text = slots.name;
    }
});

/**
 * handle director selection events
 * when a director is selected, populate the form with the data of the selected director
 */
function handleDirectorSelectChangeEvent() {
    var key = "", dir = null,
        key = updateFormEl.selectPerson.value;
    if (key) {
        dir = Person.instances[key];
        updateFormEl.personID.value = dir.personID;
        updateFormEl.name.value = dir.name;
    } else {
        updateFormEl.reset();
    }

}


/**********************************************
 * Use case Delete Person
 **********************************************/
const deleteFormEl = document.querySelector("section#Person-D > form");
const selectDeleteDirectorEl = deleteFormEl.selectPerson;
document.getElementById("destroy")
    .addEventListener("click", function () {
        document.getElementById("Person-M").style.display = "none";
        document.getElementById("Person-D").style.display = "block";
        // set up the director selection list
        fillSelectWithOptions(selectDeleteDirectorEl, Person.instances,
            "personID", {displayProp: "name"});
        deleteFormEl.reset();
    });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
    const directorIdRef = selectDeleteDirectorEl.value;
    if (!directorIdRef) return;
    if (confirm("Do you really want to delete this director?")) {
        var isAssigned = false;
        console.log(Movie.instances);
        for (const key of Object.keys(Movie.instances)) {
            if (key === directorIdRef) {
                isAssigned = true;
                confirm("Director is used in a movie! Remove Director first from the movie before deleting!");
            }
        }
        if (!isAssigned) {
            Person.deletePerson(directorIdRef);
            console.log("destroyed Director")
        }
    }
});














































/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Person-M").style.display = "block";
  document.getElementById("Person-R").style.display = "none";
  document.getElementById("Person-C").style.display = "none";
  document.getElementById("Person-U").style.display = "none";
  document.getElementById("Person-D").style.display = "none";
}

// Set up Manage Movie UI
refreshManageDataUI();