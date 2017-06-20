const BP = "55284-4";
const HSCRP = "30522-7";
const CHOLESTEROL = "2093-3";
const HDL = "2085-9";
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
    labs = _.sortBy(labs, 'effectiveDateTime').reverse();
    var byCodes = smart.byCodes(labs, 'code');
    var hscrpArr = byCodes(HSCRP);
    var cholesterolArr = byCodes(CHOLESTEROL);
    var hdlArr = byCodes(HDL);
    var BPArr = byCodes(BP);
    var smoker = document.getElementById("smoker").checked;
    var famHist = document.getElementById("famHist").checked;
    var scoreSets = findPriorSets({hscrpArr, cholesterolArr, hdlArr, BPArr}, labs);
    if(scoreSets.length === 0) {
      validPatient = false;
    }
    if (validPatient && gender == "female") {
      for(var i = 0; i < scoreSets.length; i++) {
        let b = 0.0799*age+3.137*Math.log(scoreSets[i][BP].component[0].valueQuantity.value)
        +0.180*Math.log(scoreSets[i][HSCRP].valueQuantity.value)
        +1.382*Math.log(scoreSets[i][CHOLESTEROL].valueQuantity.value)
        -1.172*Math.log(scoreSets[i][HDL].valueQuantity.value);
        if (smoker) {
          b += 0.818;
        }
        if (famHist) {
          b += 0.438;
        }
        score = 100*(1-Math.pow(0.98756,Math.pow(Math.E,b-22.325)));
        score = score.toFixed(2);
        let sum = 0;
        let counter = 0;
        let tempTime;
        let maxTime = 0;
        for(variable in scoreSets[i]) {
          tempTime = new Date(scoreSets[i][variable].effectiveDateTime);
          sum += tempTime.getTime();
          if (tempTime > maxTime) {
            maxTime = tempTime;
          }
          counter++;
        }
        avgDate = new Date(sum/counter)
        alert("As of " + new Date(maxTime) + ", your chance of dying from a major cardiac event in the next ten years was " + score + "%.");
      }
    }
    else if(validPatient && gender == "male") {
      for(var i = 0; i < scoreSets.length; i++) {
        let b = 4.385*Math.log(age)+2.607*Math.log(scoreSets[i][BP].component[0].valueQuantity.value)+
        0.963*Math.log(scoreSets[i][CHOLESTEROL].valueQuantity.value)
        -0.772*Math.log(scoreSets[i][HDL].valueQuantity.value)+
        0.102*Math.log(scoreSets[i][HSCRP].valueQuantity.value);
        if (smoker) {
          b += 0.405;
        }
        if (famHist) {
          b += 0.541;
        }
        score = 100*(1-Math.pow(0.8990, Math.pow(Math.E,b-33.097)));
        score = score.toFixed(2);
        alert("Your chance of dying from a major cardiac event in the next ten years are " + score + "%.");
      }
    }
    else {
      alert("This patient is missing one of the measurements needed for the calculation.");
    }
  });
}
