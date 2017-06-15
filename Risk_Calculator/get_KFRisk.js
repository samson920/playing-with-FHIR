function CKDtoKF() {
  var smart = getPatID("patIDKF");
  var score;
  var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: ['http://loinc.org|48643-1',
           'http://loinc.org|48642-3', 'http://loinc.org|33914-3',
           'http://loinc.org|14958-3', 'http://loinc.org|14959-1']}}});
  $.when(getPatient(smart), labs).done(function(patRaw, labs) {
    let validPatient = true;
    if (patRaw.data.total == 0) {
      alert("This patient does not exist.");
      validPatient = false;
    }
    else {
      var age = calculateAge(patRaw.data.entry[0].resource.birthDate);
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
