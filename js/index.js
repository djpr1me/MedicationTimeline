$(document).ready(function() {

  FHIR.oauth2.ready(function(smart){
    var patient = smart.patient.read();
    var medications = smart.patient.api.fetchAllWithReferences({type: "MedicationOrder"},
    ["MedicationOrder.medicationReference"]);

    $.when(patient, medications).done(function(patient, fetchedMedicationWithRef){
          initTimeline(getMedicationsWithResolvedRef(fetchedMedicationWithRef));
          setPatientInfo(patient);
    });
  });

  function getMedicationsWithResolvedRef(fetchedMedicationWithRef){
    var medResults = fetchedMedicationWithRef[0];
    var medGetRef = fetchedMedicationWithRef[1];
    var medicationsWithRefs = [];

    medResults.forEach(function(prescription){
       if (prescription.medicationCodeableConcept) {
           medicationsWithRefs.push({medicationOrder: prescription, medication: prescription.medicationCodeableConcept})
       } else if (prescription.medicationReference) {
           var med = medGetRef(prescription, prescription.medicationReference);
           medicationsWithRefs.push({medicationOrder: prescription, medication: med})
       }
     });
     return medicationsWithRefs;
  }

  function initTimeline(medications){
    var container = document.getElementById('timeline');
    var items = getItemsForTimeline(medications);
    if(items.length>0){
      var options = {
        zoomMin: 1000 * 60 * 60 * 24 * 31,
        start: items[0].start,
        end: items[0].start
      };
    }
    var timeline = new vis.Timeline(container, items, options);
  }

  function getItemsForTimeline(medications){
    var items = [];
    var medicationHash = {};
    medications.forEach((med, index)=>{
     var date = new Date(med.medicationOrder.dateWritten);
     var medcineName = med.medication.code.coding[0].display;
     if(medicationHash[medcineName+date]==null){
         medicationHash[medcineName+date]=true;
         items.push({id: index,
            content: medcineName,
            start: date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate()
         });
     }
    });
    return items;
  }

  function setPatientInfo(patient){
    document.getElementById('name').innerHTML = patient.name[0].text;
    document.getElementById('gender').innerHTML = patient.gender;
    document.getElementById('recId').innerHTML = patient.id;
    document.getElementById('birthDate').innerHTML = patient.birthDate;
  }
});
