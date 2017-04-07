var AppInfo       = require('../app/models').moApp;
var cons = require('tracer').console();
var fs = require('fs')

const getCurrApp=()=>{
	return fs.readFileSync('appid','utf8')
}

const setCurrApp= (ai)=>{
	//cons.log(ai)
	fs.writeFile('appid', ai, (err)=>{
	    if(err) {
	        cons.log(err);
	    } 	
	})
}

const manageAppInfo = (function(){
	var appInfo
	return {
		setAppInfo: function(ai){
			appInfo = ai
		},
		getAppInfo: function(){
			return appInfo
		}
	}
})()

const getRedirect = (ai)=>{
	AppInfo.findOne({appId: ai}, function(err,result){
		console.log(result.spaURL)
	})	
}

const theRedirect =(err, result)=>{
	cons.log(result)
}

//getRedirect('tauth')

module.exports = {
	upsertSPAinfo: function(appInfo){
		// cons.log(appInfo)
		AppInfo.update({appId: appInfo.appId}, appInfo, {upsert: true}, function(err,result){
			//cons.log(err)
			//cons.log(result)
		})
	},
	manageAppInfo: manageAppInfo,
	getCurrApp: getCurrApp,
	setCurrApp: setCurrApp
}

var global = 'Hello, I am a global variable :)';

// (function () {
//   // We keep these variables private inside this closure scope
//   var myGrades = [93, 95, 88, 0, 55, 91];
//   var average = function() {
//     var total = myGrades.reduce(function(accumulator, item) {
//       return accumulator + item}, 0);
//     return 'Your average grade is ' + total / myGrades.length + '.';
//   }
//   var failing = function(){
//     var failingGrades = myGrades.filter(function(item) {
//       return item < 70;});
//     return 'You failed ' + failingGrades.length + ' times.';
//   }
//   console.log(failing());
//   console.log(global);
// }());
// console.log(average())