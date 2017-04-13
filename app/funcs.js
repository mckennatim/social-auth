var nodemailer = require('nodemailer')
var cons = require('tracer').console();
var fs = require('fs')
var AppInfo = require('../app/models').moApp;
var User = require('../app/models').moUser;
var env = require('../env.json')
var cfg= env[process.env.NODE_ENV||'development']
const loginURL = cfg.url.server+':'+cfg.port.express+'/login'

const getCurrApp=()=>{
	return fs.readFileSync('appid','utf8')
}

const setCurrApp= (ai)=>{
	fs.writeFile('appid', ai, (err)=>{if(err) {cons.log(err);}})
}

const getRedirect = (ai)=>{
	AppInfo.findOne({appId: ai}, function(err,result){
		console.log(result.spaURL)
	})	
}

const theRedirect =(err, result)=>{
	cons.log(result)
}

const get=(path, props)=>{
  return path.split(".")
  	.slice(1)
  	.reduce((xs,x)=>(xs && xs[x]) ? xs[x] : null , props)
}

var createRandomWord = function(length) {
	var consonants = 'bcdfghjklmnpqrstvwxyz',
		vowels = 'aeiou',
		rand = function(limit) {
			return Math.floor(Math.random() * limit);
		},
		i, word = '',
		length = parseInt(length, 10),
		consonants = consonants.split(''),
		vowels = vowels.split('');
	for (i = 0; i < length / 2; i++) {
		var randConsonant = consonants[rand(consonants.length)],
			randVowel = vowels[rand(vowels.length)];
		word += (i === 0) ? randConsonant.toUpperCase() : randConsonant;
		word += i * 2 < length - 1 ? randVowel : '';
	}
	return word;
}

const upsertSPAinfo = (appInfo)=>{
	AppInfo.update({appId: appInfo.appId}, appInfo, {upsert: true}, function(err,result){})
}

var createRandomWord = function(length) {
	var consonants = 'bcdfghjklmnpqrstvwxyz',
		vowels = 'aeiou',
		rand = function(limit) {
			return Math.floor(Math.random() * limit);
		},
		i, word = '',
		length = parseInt(length, 10),
		consonants = consonants.split(''),
		vowels = vowels.split('');
	for (i = 0; i < length / 2; i++) {
		var randConsonant = consonants[rand(consonants.length)],
			randVowel = vowels[rand(vowels.length)];
		word += (i === 0) ? randConsonant.toUpperCase() : randConsonant;
		word += i * 2 < length - 1 ? randVowel : '';
	}
	return word;
}

const createApikey=()=>{
	return createRandomWord(24)
}

const emailApikey = (apikey, email, appId, callback) =>{
	let smtpTransport = nodemailer.createTransport({
		service: 'gmail',
    auth: cfg.gmail.auth
  });
  var mailOptions = {
      from: "SocialAuth <mckenna.tim@gmail.com>", // sender address
      to: email, // list of receivers
      subject: "apikey", // Subject line
      text: "Your apikey for " +appId + " is: " +apikey + "Return to "+loginURL+"/"+apikey+"/"+email+"/"+appId+" and enter your apikey to complete registration for your device", // plaintext body
      html: "<b>Your apikey for " +appId + " is: " +apikey + "</b><p>Return to "+loginURL+"/"+apikey+"/"+email+"/"+appId+" and enter your apikey to complete registration for your device </b></p>" // html body
  }
  var ret=""
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
              console.log(error);
              ret = error;
      }else{
              console.log("Message sent: " + response.message);
              ret = {message: 'check your email and come back'} 
      }
      smtpTransport.close(); // shut down the connection pool, no more messages
      console.log(ret)
      callback(ret);
  });
}

const processUser = (reqbody, done)=>{
  try{
    var email = reqbody.email.toLowerCase();
    var appId = reqbody.appId;
  }catch(err){
    cons.log(err)
    req.flash({message: 'bad param'});
    done(err);
    return
  }
  User.findOne({'userinfo.emailkey': email}, function(err, user) {
    var apikey
    if(!user){
      //create user, create apikey and send it
      apikey = createApikey()
      emailApikey(apikey, email, appId, function(ret){
        cons.log(ret)
        req.flash({message: ret});
      })          
      var newUser = new User();
      newUser.local.apikey = apikey;
      newUser.userinfo.emailkey = email;
      newUser.save(function(err) {
        if (err) done(err);
        done(null, {apikey: apikey, alreadyRegistered: false});
        return
      });          
    }
    if(user){
      if(!get('user.local.apikey',user) || user.local.apikey.length <10){
        cons.log('apikey not good')
        apikey = createApikey()
        emailApikey(apikey, email, appId, function(ret){
          cons.log(ret)
          //req.flash({message: ret});
        })
        var updUser = user
        updUser.local.apikey = apikey;
        updUser.save(function(err) {
          if (err) done(err);
          done(null, {apikey: apikey, alreadyRegistered: false});
          return
        });            
      } else {
        apikey = user.local.apikey
        done(null, {apikey: apikey, alreadyRegistered: true});
        return
      }
    }
    cons.log(apikey)
    //cons.log(err)
  })	
}

module.exports = {
	upsertSPAinfo: upsertSPAinfo,
	getCurrApp: getCurrApp,
	setCurrApp: setCurrApp,
	get: get,
	createApikey: createApikey,
	processUser: processUser
}
