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
  var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: ['http://loinc.org|30522-7',
           'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
           'http://loinc.org|2085-9', 'http://loinc.org|8480-6']}}});
  $.when(getObs('2085-9'), getAge(), getObs('8480-6'), getObs('30522-7')).
      done(function(hdlRaw, ageRaw, sysBPRaw, hsCRPRaw) {
    var validPatient = true;
    console.log(hdlRaw);
    if(hdlRaw.data.total == 0) {
      alert("This patient does not have any HDL measurements.");
      validPatient = false;
    }
    else {
      var hdl = hdlRaw.data.entry[0].resource.valueQuantity.value;
    }
    console.log("HDL: " + hdl + " mg/dL");
    if (ageRaw.data.total == 0) {
      alert("This patient does not have a birth date.");
      validPatient = false;
    }
    else {
      var age = calculateAge(ageRaw.data.entry[0].resource.birthDate);
    }
    console.log("Age: " + age + " years");
    if (sysBPRaw.data.total == 0) {
      alert("This patient does not have any BP measurements.");
      validPatient = false;
    }
    else {
      var sysBP = sysBPRaw.data.entry[0].resource.component.valueQuantity.value;
    }
    console.log("SysBP: " + sysBP + " mmHg");
    if (hsCRPRaw.data.total == 0) {
      alert("This patient does not have any hsCRP measurements.");
      validPatient = false;
    }
    else {
      var hsCRP = hsCRPRaw.data.entry[0].resource.component.valueQuantity.value;
    }
    console.log("hsCRP: " + hsCRP + " mg/L");
  });
}
