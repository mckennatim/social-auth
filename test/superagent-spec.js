var superagent = require('superagent')
var expect = require('expect.js')

var should = require('should')
var _ = require('underscore')
var jwt = require('jwt-simple');
var fs = require('fs');
var env = require('../env.json')
var cfg= env[process.env.NODE_ENV||'development']
var secret = cfg.jwt.secret
var exp = cfg.jwt.exp

var httpLoc = 'http://localhost:' + cfg.port.express
describe('superagent:', function() {
	it('GET / should be running', function(done) {
		superagent.get(httpLoc)
			.end(function(e, res) {
				console.log(res.type)
				expect(e).to.eql(null)
				expect(res.type).to.be('text/html')
				done()
			})
	})
})
