function reynolds() { //need to invalidate for diabetic men & modify for diabetic women; add units check
  var smart = getPatID("patIDReynolds");
  var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: ['http://loinc.org|30522-7',
           'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
           'http://loinc.org|2085-9', 'http://loinc.org|55284-4']}}});
  $.when(getPatient(smart), labs).done(function(patRaw, labs) {
    var score;
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
    if (validPatient && gender == "female") {
      let b = 0.0799*age+3.137*Math.log(BPArr[0].component[0].valueQuantity.value)
      +0.180*Math.log(hscrpArr[0].valueQuantity.value)+1.382*Math.log(cholesterolArr[0].valueQuantity.value)
      -1.172*Math.log(hdlArr[0].valueQuantity.value);
      if (smoker) {
        b += 0.818;
      }
      if (famHist) {
        b += 0.438;
      }
      score = 100*(1-Math.pow(0.98756,Math.pow(Math.E,b-22.325)));
      score = score.toFixed(2);
      console.log(score);
      alert("Your chance of dying from a major cardiac event in the next ten years are " + score + "%.");
    }
    else if(validPatient && gender == "male") {
      let b = 4.385*Math.log(age)+2.607*Math.log(BPArr[0].component[0].valueQuantity.value)+
      0.963*Math.log(cholesterolArr[0].valueQuantity.value)-0.772*Math.log(hdlArr[0].valueQuantity.value)+
      0.102*Math.log(hscrpArr[0].valueQuantity.value);
      if (smoker) {
        b += 0.405;
      }
      if (famHist) {
        b += 0.541;
      }
      score = 100*(1-Math.pow(0.8990, Math.pow(Math.E,b-33.097)));
      score = score.toFixed(2);
      console.log(score);
      alert("Your chance of dying from a major cardiac event in the next ten years are " + score + "%.");
    }
    else {
      alert("This patient is missing one of the measurements needed for the calculation.");
    }
  });
}
