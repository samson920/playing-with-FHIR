var smart;
var patientID;
var score;
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

function getPatient() {
  return smart.patient.api.search({type:'Patient'});
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
           'http://loinc.org|2085-9', 'http://loinc.org|55284-4']}}});
  $.when(getPatient(), labs).done(function(patRaw, labs) {
    let validPatient = true;
    if (patRaw.data.total == 0) {
      alert("This patient does not exist.");
      validPatient = false;
    }
    else {
      var age = calculateAge(patRaw.data.entry[0].resource.birthDate);
      var gender = patRaw.data.entry[0].resource.gender;
    }
    var byCodes = smart.byCodes(labs, 'code');
    var hscrpArr = _.sortBy(byCodes("30522-7"), 'effectiveDateTime').reverse();
    var cholesterolArr = _.sortBy(byCodes("14647-2", "2093-3"), 'effectiveDateTime').reverse();
    var hdlArr = _.sortBy(byCodes("2085-9"), 'effectiveDateTime').reverse();
    var BPArr = _.sortBy(byCodes("55284-4"), 'effectiveDateTime').reverse();
    var smoker = document.getElementById("smoker").checked;
    var famHist = document.getElementById("famHist").checked;
    if(hscrpArr.length == 0 || cholesterolArr.length == 0 || hdlArr .length == 0|| BPArr.length == 0) {
      validPatient = false;
    }
    if (validPatient) { //for females only
      let b = 0.0799*age+3.137*Math.log(BPArr[0].component[0].valueQuantity.value)
      +0.180*Math.log(hscrpArr[0].valueQuantity.value)+1.382*Math.log(cholesterolArr[0].valueQuantity.value)
      -1.172*Math.log(hdlArr[0].valueQuantity.value);
      if (smoker) {
        b += 0.818;
      }
      if (famHist) {
        b += 0.438;
      }
      score = (1-Math.pow(0.98756,Math.pow(Math.E,b-22.325)));
    }
    console.log(score);
  });
}
