function getCOPD() {
	var smart = getPatID("patCOPDRisk");
	var score;
	var labs = smart.patient.api.fetchAll({type: "Condition", query: {code: {$or: ['42343007','38341003',
	'230690007', '266257000', '13713005', '27550009', '73211009']}}});
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