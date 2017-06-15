var smart;
var patientID;
var score;
function getPatID1() {
  patientID = document.getElementById("patID2").value;
  // var demo = {
  //   serviceUrl: "http://fhirtest.uhn.ca/baseDstu3",
  //   patientId: patientId
  // }
  smart = FHIR.client({
      serviceUrl: 'http://fhirtest.uhn.ca/baseDstu3',
      patientId: patientID //55439
  });
}

function getPatient1() {
  return smart.patient.api.search({type:'Patient'});
}

//calculate age from date of birthday
//@param dateString: date of birth @return age
function calculateAge1(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function CKDtoKF() {
  getPatID1();
  var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: ['http://loinc.org|48643-1',
           'http://loinc.org|48642-3', 'http://loinc.org|33914-3',
           'http://loinc.org|14958-3', 'http://loinc.org|14959-1']}}});
  $.when(getPatient1(), labs).done(function(patRaw, labs) {
    let validPatient = true;
    if (patRaw.data.total == 0) {
      alert("This patient does not exist.");
      validPatient = false;
    }
    else {
      var age = calculateAge1(patRaw.data.entry[0].resource.birthDate);
      var gender = patRaw.data.entry[0].resource.gender;
      if (gender == "male") {gender = 1;}
      else if (gender == "female") {gender = 0;}
      else {alert("Patient has no gender.");}
    }
    var byCodes = smart.byCodes(labs, 'code');
    var GFRArr = _.sortBy(byCodes("48643-1", "48642-3", "33914-3"), 'effectiveDateTime').reverse();
    var UACArr = _.sortBy(byCodes("14958-3", "14959-1"), 'effectiveDateTime').reverse();
    if (GFRArr.length == 0 || UACArr.length == 0) {
      validPatient = false;
    }
    if(validPatient) {
      let a = 0.2694*gender-0.2167*age/10-0.55418*GFRArr[0].valueQuantity.value/5+
      0.45608*Math.log(UACArr[0].valueQuantity.value);
      score = 100*(1-Math.pow(0.924, Math.pow(Math.E, a+2.96774)));
      score = score.toFixed(2);
      alert("The probability your CKD will result in kidney failure in the next five years is " + score + "%.");
    }
    else {
      alert("This patient is missing measurements that are necessary to making the prediction.");
    }
    console.log(gender);
    console.log(age);
    console.log(GFRArr);
    console.log(UACArr);
  });
}
