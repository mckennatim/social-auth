var cons = require('tracer').console();
var User       = require('../app/models').moUser;
var AppInfo       = require('../app/models').moApp;
var mf = require('./funcs')
var appInfo 


module.exports = function(app, passport) {
// normal routes ===============================================================

    app.get('/', function(req, res) {
        res.render('index.ejs');
    });
    app.get('/spa/:appid/:apiURL', function(req, res) {
        cons.log(req.params)
        appInfo ={
            appId: req.params.appid,
            spaURL: req.headers.referer,
            apiURL: req.params.apiURL
        }
        mf.upsertSPAinfo(appInfo)
        res.render('index.ejs',appInfo);
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        AppInfo.findOne({appId: mf.getCurrApp()}, function(err,result){
            console.log(result.spaURL)
            res.redirect(result.spaURL+'#registered');
        })  
        // res.render('profile.ejs', {
        //     user : req.user
        // });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------
        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback', function(req,res,next){
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            })(req,res,next);
        });

        // send to facebook to do the authentication
        app.get('/auth/facebook/:appId', function(req,res,next){
            mf.setCurrApp(req.params.appId)
            passport.authenticate(
                'facebook', { scope : 'email' }
            )(req,res,next);
        });



    // github -------------------------------

        // handle the callback after github has authenticated the user
        app.get('/auth/github/callback',
            passport.authenticate('github', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

        // send to github to do the authentication
        app.get('/auth/github/:appId', function(req,res,next){
            mf.setCurrApp(req.params.appId)
            passport.authenticate(
                'github', { scope : 'email' }
            )(req,res,next);
        });

    // twitter --------------------------------

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
        // send to twitter to do the authentication
        app.get('/auth/twitter/:appId', function(req,res,next){
            mf.setCurrApp(req.params.appId)
            passport.authenticate(
                'twitter', { scope : 'email' }
            )(req,res,next);
        });



    // google ---------------------------------

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
        // send to google to do the authentication
        app.get('/auth/google/:appId', function(req,res,next){
            mf.setCurrApp(req.params.appId)
            passport.authenticate(
                'google', { scope : ['profile', 'email'] }
            )(req,res,next);
        });


// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // github -------------------------------

        // send to github to do the authentication
        app.get('/connect/github', passport.authorize('github', { scope : 'email' }));

        // handle the callback after github has authorized the user
        app.get('/connect/github/callback',
            passport.authorize('github', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // github -------------------------------
    app.get('/unlink/github', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.github.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    ///--------------------------------------------------------
    // privacy policy and terms of service
    app.get('/privacy',function(req, res) {
        res.render('privacy.ejs')
    });    
    app.get('/terms',function(req, res) {
        res.render('terms.ejs')
    });    

    app.get('/redirect',function(req, res) {
        console.log('in /redirect')
        res.redirect('https://cascada.sitebuilt.net')
    });    

};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
