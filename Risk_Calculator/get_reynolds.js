var smart;
var patientID;

function getPatID() {
  patientID = document.getElementById("patID").value;
  // var demo = {
  //   serviceUrl: "http://fhirtest.uhn.ca/baseDstu3",
  //   patientId: patientId
  // }
  smart = FHIR.client({
      serviceUrl: 'http://fhirtest.uhn.ca/baseDstu3',
      patientId: patientID //57089
  });
}
//@param code: the LOINC code for the Observation
//@return the raw data of the most recent observation
function getObs(LOINCcode) {
  return smart.patient.api.search({type:'Observation',
    query: {code: LOINCcode, $sort: [
					["date",
					"desc"]
		]}});
}

function getAge() {
  return birthdate = smart.patient.api.search({type:'Patient'});
}

//calculate age from date of birthday
//@param dateString: date of birth @return age
function calculateAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function reynolds() {
  getPatID();
  $.when(getObs('2085-9'), getAge(), getObs('8480-6')).done(function(hdlRaw, ageRaw, sysBPRaw) {
    console.log(hdlRaw);
    var hdl = rawData.data.entry[0].resource.valueQuantity.value;
    console.log("HDL: " + hdl + " mg/dL");
    console.log(ageRaw);
    var age = calculateAge(ageRaw.data.entry[0].resource.birthDate);
    console.log("Age: " + age + " years");
    console.log(sysBPRaw);
    var sysBP = rawData.data.entry[0].resource.component.valueQuantity.value
    console.log("SysBP: " + sysBP + " mmHg");
  });
}
