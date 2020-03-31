/**
* Copyright 2019 Google LLC.
* SPDX-License-Identifier: Apache-2.0
*/

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1. 
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

function getEnvironment() {
  var environment = {
    spreadsheetID: "",
    firebaseUrl: "",
    email: "",
    key: "",
    projectId: "",
  };
  return environment;
}

function deleteTriggers(){
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getTriggerSourceId() == getEnvironment().spreadsheetID) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

// Creates a Google Sheets on change trigger for the specific sheet
function createSpreadsheetEditTrigger(sheetID) {
  var triggers = ScriptApp.getProjectTriggers();
  var triggerExists = false;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getTriggerSourceId() == sheetID) {
      triggerExists = true;
      break;
    }
  }

  if (!triggerExists) {
    var spreadsheet = SpreadsheetApp.openById(sheetID);
    ScriptApp.newTrigger("importSheet")
      .forSpreadsheet(spreadsheet)
      .onChange()
      .create();
  }
}

// Delete all the existing triggers for the project
function deleteTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

// Initialize
function initialize(e) {
  writeDataToFirebase(getEnvironment().spreadsheetID);
}

// Write the data to the Firebase URL
function writeDataToFirebase(sheetID) {
  var ss = SpreadsheetApp.openById(sheetID);
  SpreadsheetApp.setActiveSpreadsheet(ss);
  createSpreadsheetEditTrigger(sheetID);
  var patientSheet = ss.getSheetByName('patient_data');
  var exposureSheet = ss.getSheetByName('exposure_data');

  // construcdt a map of patients
  importSheet(patientSheet, exposureSheet);
}

// A utility function to generate nested object when
// given a keys in array format
function assign(obj, keyPath, value) {
  lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in obj)) obj[key] = {};
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

// Import each sheet when there is a change
function importSheet(patientSheet, exposureSheet) {
  SpreadsheetApp.setActiveSheet(patientSheet)
  var sheet = SpreadsheetApp.getActiveSheet();
  var patientData = sheet.getDataRange().getValues();

  SpreadsheetApp.setActiveSheet(exposureSheet)
  sheet = SpreadsheetApp.getActiveSheet();
  var exposureData = sheet.getDataRange().getValues();

  var dataToImport = {};

  var firestore = FirestoreApp.getFirestore(getEnvironment().email, getEnvironment().key, getEnvironment().projectId);

  // find out what documents are already created first
  var existingCases = firestore.getDocumentIds("cases");

  var patientDataHeader = patientData[0];
  var exposureDataHeader = exposureData[0];

  for (var i = 1; i < patientData.length; i++) { // i is the index, start with 1 to exclude the headers
    var id = patientData[i][0];
    dataToImport[id] = {}; // a json serialisation of the table, with the key as the patient_id
    for (var j = 0; j < patientDataHeader.length; j++) {
      assign(dataToImport[id], patientDataHeader[j].split("__"), patientData[i][j]); // assign the content of the cell to the map
    }

    // add in exposure data
    var exposures = []
    var exposureRows = exposureData.filter( function (d) { return d[0] == id; } );
    for (var eri = 0; eri < exposureRows.length; eri++) {
      var exposure = {};
      for (var ehi = 0; ehi < exposureDataHeader.length; ehi++) {
        assign(exposure, exposureDataHeader[ehi].split("__"), exposureRows[eri][ehi]);
      }
      exposures.push(exposure);
    }

    dataToImport[id]["exposures"] = exposures;

    if (existingCases.includes(id.toString())) {
      firestore.updateDocument("cases/" + id, dataToImport[id]);
    } else {
      firestore.createDocument("cases/" + id, dataToImport[id]);
    }
    //remove the matched cases from existing cases
    var index = existingCases.indexOf(id.toString());
    if (index > -1) {
      existingCases.splice(index, 1);
    }
  }

  // delete documents that no longer is in the google sheet
  for (var i = 0; i < existingCases.length; i++) {
    firestore.deleteDocument("cases/" + existingCases[i]);
  }
  
  Browser.msgBox("Changes should be live now!");

  //var token = ScriptApp.getOAuthToken();

}