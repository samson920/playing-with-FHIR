const BP = "55284-4";
const HSCRP = "30522-7";
const CHOLESTEROL = "2093-3";
const HDL = "2085-9";
function reynolds() { //need to invalidate for diabetic men & modify for diabetic women; add units check
  var dateData = [];
  var scoreData = [];
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
    var scoreSets = findPriorSets({hscrpArr, cholesterolArr, hdlArr, BPArr},
      [["30522-7"], ["2093-3"], ["2085-9"], ["55284-4"]],
      ['hsCRP', 'Cholesterol', 'HDL', 'BP'], labs);
    if(scoreSets.length === 0) {
      validPatient = false;
    }
    if (validPatient && gender == "female") {
      for(var i = 0; i < scoreSets.length; i++) {
        let b = 0.0799*age+3.137*Math.log(scoreSets[i]['BP'].component[0].valueQuantity.value)
        +0.180*Math.log(scoreSets[i]['hsCRP'].valueQuantity.value)
        +1.382*Math.log(scoreSets[i]['Cholesterol'].valueQuantity.value)
        -1.172*Math.log(scoreSets[i]['HDL'].valueQuantity.value);
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
        dateData.push(new Date(maxTime));
        scoreData.push(score);
        //alert("As of " + new Date(maxTime) + ", your chance of dying from a major cardiac event in the next ten years was " + score + "%.");
      }
      var data = [
        {
          x: dateData,
          y: scoreData,
          type: 'scatter'
        }
      ];
      Plotly.newPlot('reynoldsTime', data);
    }
    else if(validPatient && gender == "male") {
      for(var i = 0; i < scoreSets.length; i++) {
        let b = 4.385*Math.log(age)+2.607*Math.log(scoreSets[i]['BP'].component[0].valueQuantity.value)+
        0.963*Math.log(scoreSets[i]['Cholesterol'].valueQuantity.value)
        -0.772*Math.log(scoreSets[i]['HDL'].valueQuantity.value)+
        0.102*Math.log(scoreSets[i]['hsCRP'].valueQuantity.value);
        if (smoker) {
          b += 0.405;
        }
        if (famHist) {
          b += 0.541;
        }
        score = 100*(1-Math.pow(0.8990, Math.pow(Math.E,b-33.097)));
        score = score.toFixed(2);
        dateData.push(new Date(maxTime));
        scoreData.push(score);
      }
      var data = [
        {
          x: dateData,
          y: scoreData,
          type: 'scatter'
        }
      ];
      Plotly.newPlot('reynoldsTime', data);
    }
    else {
      alert("This patient is missing one of the measurements needed for the calculation.");
    }
  });
}

function reynoldsPop() { //takes 2 mins to run on HAPI FHIR w 62.5k observations
  var sysBPData = {'sum': 0, 'count': 0};
  var cholData = {'sum': 0, 'count': 0};
  var hdlData = {'sum': 0, 'count': 0};
  var hsCRPData = {'sum': 0, 'count': 0};
  var smart = FHIR.client({
      serviceUrl: 'http://fhirtest.uhn.ca/baseDstu3',
  });
  var labs = smart.api.fetchAll({type: 'Observation',
  query: {code: {$or: ['http://loinc.org|30522-7',
           'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
           'http://loinc.org|2085-9', 'http://loinc.org|55284-4']}}});
  $.when(labs).done(function(labs) {
    var byCodes = smart.byCodes(labs, 'code');
    var hscrpArr = byCodes(HSCRP);
    var cholesterolArr = byCodes(CHOLESTEROL);
    var hdlArr = byCodes(HDL);
    var BPArr = byCodes(BP);
    for(var i = 0; i < BPArr.length; i++) {
      if (BPArr[i]) {
        if(BPArr[i].component) {
          if(BPArr[i].component[0]) {
            if(BPArr[i].component[0].valueQuantity) {
              if (BPArr[i].component[0].valueQuantity.value <= 300) {
                sysBPData['sum'] += BPArr[i].component[0].valueQuantity.value;
                sysBPData['count'] += 1;
              }
            }
          }
        }
      }
    }
    for(var i = 0; i < cholesterolArr.length; i++) {
      if(cholesterolArr[i]) {
        if(cholesterolArr[i].valueQuantity) {
          if(cholesterolArr[i].valueQuantity.value <= 1000) {
            cholData['sum'] += cholesterolArr[i].valueQuantity.value;
            cholData['count'] += 1;
          }
        }
      }
    }
    for(var i = 0; i < hdlArr.length; i++) {
      if(hdlArr[i]) {
        if(hdlArr[i].valueQuantity) {
          if(hdlArr[i].valueQuantity.value <= 300) {
            hdlData['sum'] += hdlArr[i].valueQuantity.value;
            hdlData['count'] += 1;
          }
        }
      }
    }
    for(var i = 0; i < hscrpArr.length; i++) {
      if(hscrpArr[i]) {
        if(hscrpArr[i].valueQuantity) {
          if(hscrpArr[i].valueQuantity.value <= 100) {
            hsCRPData['sum'] += hscrpArr[i].valueQuantity.value;
            hsCRPData['count'] += 1;
          }
        }
      }
    }

    var smart2 = getPatID("patIDReynolds");
    var labs2 = smart2.patient.api.fetchAll({type: "Observation", query: {code: {$or: ['http://loinc.org|30522-7',
             'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
             'http://loinc.org|2085-9', 'http://loinc.org|55284-4']}}});
    $.when(labs2).done(function(labs2) {
      labs2 = _.sortBy(labs2, 'effectiveDateTime').reverse();
      var byCodes = smart2.byCodes(labs2, 'code');
      var hscrpArr = byCodes(HSCRP);
      var cholesterolArr = byCodes(CHOLESTEROL);
      var hdlArr = byCodes(HDL);
      var BPArr = byCodes(BP);
      var trace1 = {
        x: ['Systolic BP', 'Cholesterol', 'HDL "Good" Cholesterol', "C Reactive Protein"],
        y: [BPArr[0].component[0].valueQuantity.value, cholesterolArr[0].valueQuantity.value,
          hdlArr[0].valueQuantity.value, hscrpArr[0].valueQuantity.value],
        name: 'You',
        type: 'bar'
      };

      var trace2 = {
        x: ['Systolic BP', 'Cholesterol', 'HDL "Good" Cholesterol', "C Reactive Protein"],
        y: [sysBPData['sum']/sysBPData['count'], cholData['sum']/cholData['count'],
            hdlData['sum']/hdlData['count'], hsCRPData['sum']/hsCRPData['count']],
        name: 'Average Patient',
        type: 'bar'
      };

      var data = [trace1, trace2];

      var layout = {barmode: 'group'};

      Plotly.newPlot('reynoldsAvgs', data, layout);
    });
  });
}
