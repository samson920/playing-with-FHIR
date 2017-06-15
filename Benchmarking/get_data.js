var patient_list = [];
var pt_observation_dict = {};

var patientResult;

var pts;
var obs;
var time_pts;


function getAllPatients(database){


	//get just patient identifiers
	getAllData(database, "Patient", {_elements: [["id"]]}, parseInt(pts), savePatientList)
	


	// smart.patient.api.fetchAll({type: “Observation”, query: {code: {$or: ["http://loinc.org|30522-7",
 //           'http://loinc.org|14647-2', 'http://loinc.org|2093-3',
 //           'http://loinc.org|2085-9', 'http://loinc.org|8480-6']}}});
	// smart.api.fetchAll({type:"Patient"}).then(function(results){console.log(results)})

	//http://fhirtest.uhn.ca/baseDstu3/Patient?_elements=identifier&_count=5000
	//use 5000 just for fun, most servers only give you 500 results no matter how small they are
	// smart.api.fetchAll({
	//     type: "Patient",
	//     query: {_elements: [
	// 		["identifier"]
	// 		],
	// 		}
	// 	}).then(function(results){
	// 		// 	console.log("results", results);
	// 		// 	patientResult = results;
	// 		// 	//temp1.data.entry[0].resource.id
	// 		// 	results.data.entry.forEach(function(pt) {
	// 		// 	addToPatientList(pt.resource.id);
	// 		// })

	// 	// var links = results.data.link;
	// 	// var pt_list;
	// 	// links.map(function(arr){
	// 	// 	if(arr['relation'] == 'next'){
	// 	// 		pt_list = nextPatientList(smart, returnPatientList)
	// 	// 	}

	// 	// });
		
	// 	//console.log("patient list", results);
		
	// 	return results;
		
	// 	})

}

function savePatientList(result, smart){
	//console.log("resultadfasdfa", result);
	patient_list = result;
	getObservations(patient_list, smart);
}

var pt_obs_temp;
var observation_counter = 0;
function getObservations(pt_list,smart){
	// console.log("smart test", pt_list.length);
	for (var i = 0; i < pt_list.length; i++){

		(function(cntr){
			// console.log('sanity check 2', pt_list[cntr].resource.id);
			pt_obs_temp = [];
			//console.log("pt list", pt_list[i]resource.id);
			// if(i > pts){
			// 	break;
			// }

			//http://fhirtest.uhn.ca/baseDstu3/Observation?_sort=patient,code,-date&_count=50&patient=x
			getAllData(smart.server.serviceUrl, "Observation", {
					_sort:[["patient", "code", "date"]],
					patient:parseInt(pt_list[cntr].resource.id),
				}, parseInt(obs), function(result, smart){
					observation_counter++;
					// console.log("sanity check", pt_list[cntr]);
					pt_obs_temp = result;
					pt_observation_dict[pt_list[cntr].resource.id] = pt_obs_temp;

					if(observation_counter == pt_list.length){
						console.log(observation_counter);
						getTimePoints();
					}

				}, function(result, smart){
					observation_counter++;
					// console.log("no callback", result);
					pt_observation_dict[pt_list[cntr].resource.id] = [];					
				
					if(observation_counter == pt_list.length){
						console.log(observation_counter);

						getTimePoints();
					}
				});



		})(i);
		
		// smart.api.search({
		// 	type: "Observation",
		// 	query: 
		// }).then(function(results){

		// 	console.log("observation reults, ", results)

		// })
	}

	

}

function getTimePoints(){
	console.log("tiem points", pt_observation_dict);
}

// function addToPatientList(resource){
// 	patient_list.push(resource);
// }
function getData(){

	//for testing new url parameters 

	// var smart = FHIR.client({
	//   serviceUrl: "http://fhirtest.uhn.ca/baseDstu3"
	// });
 //  	smart.api.search({
 //    	type: "Observation",
 //    	query: {
	// 			_sort:[["patient", "code", "date"]],
	// 			patient:parseInt("7247"),
	// 		}
	// 	}).then(function(results){console.log("testing the sanity; ", results)})
	
	pts = document.getElementById('patients').value || 0;
	obs = document.getElementById('obs').value || 0;
	time_pts = document.getElementById('time_pts').value || 0;

	var database = document.getElementById("databases").value || 0;
	if(database === 0){
		alert("We need at least one database!");
		return;

	}
	var databases = [];
	databases = database.split(" ");
	databases = databases.map(function(x){ 
		return x.trim();
	});

	console.log(databases);

	for (var i = 0; i < databases.length; i++){
		var link = databases[i];//+"/"+""
		var pt_list = getAllPatients(link)
						//.then(function(pt_list){getObservations(pt_list,smart)});
		//console.log("help", pt_list);	
	}


}

// function nextPatientList(smart, callback){

// 	smart.api.nextPage({
// 	    bundle: patientResult.data
// 	  	}).then(function(results) {

// 		    patientResult = results;
// 		    results.data.entry.forEach(function(pt) {
// 		      addToPatientList(pt);
// 		    });
// 		    return nextPatientList(smart, callback);

// 		  });
	  	
// 	//console.log("full list", full_list);
// 	return new Promise(returnPatientList(smart, callback));
// }



/*

smart.api.search({
			type: "Observation",
			query: {
				_sort:[["patient", "code", "date"]],
				_count:5000
			}
		}).then(function(results){
*/

var total;
var firstSet;

function getAllData(database, type, query, stoppingPoint, yesCallback, noCallBack){
  firstSet = [];
  counter = 0;
  var smart = FHIR.client({
	  serviceUrl: database
	});
  smart.api.search({
    	type: type,
    	query: query
    	/*{
				//_sort:[["patient", "code", "date"]],
				_count:5000
			}*/
		}).then(function(results){
			if(!results.data.entry){
				noCallBack(results, smart);
				return [];
			}
			console.log(results);
			for(var i = 0; i < results.data.entry.length; i++){
		      	counter++;
		      	if((counter > stoppingPoint)){
		      		break;
		      	}
		      	firstSet.push(results.data.entry[i]);	
	      	}
	      
	        patientResult = results;

	        var hasMoreThanOnePage = false;
	        patientResult.data.link.map(function(arr){
				if(arr['relation'] == 'next'){
					hasMoreThanOnePage = true;
				}
			});

			if(hasMoreThanOnePage){
				
				fetchedData = fetchData(smart, results, counter, stoppingPoint).then(function(rest_of_pts){
				patient_list = firstSet.concat(rest_of_pts);
				//console.log("list", patient_list);
				return patient_list;

				}).then(function(help){
					yesCallback(help, smart);
					},
					function(help){noCallBack(help, smart)})
			} else {
				patient_list = firstSet;
				yesCallback(patient_list, smart);
			}

		})
}

function fetchData(smart, results, counter, stoppingPoint) {

  function goFetch(users) {

    return smart.api.nextPage({bundle:patientResult.data}).then(function(data){
		  console.log("this is the data: ,");
	      patientResult = data;
	      for(var i = 0; i < data.data.entry.length; i++){
	      	counter++;
	      	if((counter > stoppingPoint)){
	      		break;
	      	}
	      	users.push(data.data.entry[i]);	
	      }
	      
	        var links = data.data.link;
	      	//console.log("this is the link: ", links);
	      	var hasMoreData = false;
			links.map(function(arr){
				if(arr['relation'] == 'next'){
					hasMoreData = true;
				}
			});

	      if(hasMoreData && !(counter > stoppingPoint)) {
	        return goFetch(users);
	      } else {
	      	//console.log("what the hell is uers ", users);
	        return users;
	      }
    });
  }

  return goFetch([]);
}


