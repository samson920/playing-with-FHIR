function getPatID(patID) {
  patientID = document.getElementById(patID).value;
  // var demo = {
  //   serviceUrl: "http://fhirtest.uhn.ca/baseDstu3",
  //   patientId: patientId
  // }
  return FHIR.client({
      serviceUrl: 'http://fhirtest.uhn.ca/baseDstu3',
      patientId: patientID
  });
}

function getPatient(FHIRClient) {
  return FHIRClient.patient.api.search({type:'Patient'});
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
