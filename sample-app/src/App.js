import React, { Component } from 'react';
import FHIR from 'fhir.js';
import logo from './logo.svg';
import './App.css';
class App extends Component {
	constructor(props) {
	 	super(props);
	  	var nativeFhir = require('fhir.js/src/adapters/native');
	  	var fhir = nativeFhir({
		    baseUrl: 'http://fhirtest.uhn.ca/baseDstu3',
		});
		var patID = this.props.patientID;
		this.state = {
			patientName: "N/A",
			patientGender: "N/A",
			patientDOB: "N/A",
			patientLastEncounter: "N/A"
		};
		this.getPatient(fhir, patID);
	  }
    getPatient(fhir, patID) {
    	var app = this;
	  	fhir.search({type: 'Patient', query: {_id: patID}}).then(function(response){
	  		console.log(response.data.entry[0].resource);
			app.setState({
				patientName: response.data.entry[0].resource.name[0].text,
				patientGender: response.data.entry[0].resource.gender.charAt(0).toUpperCase() + response.data.entry[0].resource.gender.slice(1),
				patientDOB: response.data.entry[0].resource.birthDate
			});
	  	});
  	}
  	render() {
		return (
			<div> 
			{this.state.patientName} <br/>
			{this.state.patientGender} <br/>
			{this.state.patientDOB} <br/>
			{this.state.patientLastEncounter}
			</div>
		);
  	}
}

export default App;

// fhir.search({type: 'Patient', query: {_id: patID}}).then(function(response){
// 	console.log(response.data.entry[0].resource.name[0].text);
// 	this.printName(response.data.entry[0].resource.name[0].text);
// });