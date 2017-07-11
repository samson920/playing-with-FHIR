function getCOPD() {
	var smart = getPatID("patCOPDRisk");
	var score;
	var conditions = smart.patient.api.fetchAll({type: "Condition", query: {code: {$or: ['40917007']}}});
	var labs = smart.patient.api.fetchAll({type: "Observation", query: {code: {$or: [
           //BUN
           'http://loinc.org|56115-9',
           //BP
           'http://loinc.org|56114-2', 
           //Resp Rate
           'http://loinc.org|8280-0'
           ]}}});
	$.when(getPatient(smart), conditions, labs).done(function(patRaw, conditions, labs) {
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
	var chf = pullCondition(labs, ["42343007"]); //byCodes only works w LOINC
	var hypertension = pullCondition(labs, ["38341003"]);
	var vascDisease = pullCondition(labs, ["27550009"]);
	var diabetes = pullCondition(labs, ["73211009"]);
	var strTIAthrom = pullCondition(labs, ["230690007", "266257000", "13713005"]);
	if (age < 65) {
	  age = 0;
	}
	else if (age < 75) {
	  age = 1;
	}
	else {
	  age = 2;
	}
}