# social-auth
# tags

## 03-redirect-to-from-app
If multiple people were registering at the saem time it could fuck up
### question - How to pass an additional parameter to passport.authenticate
http://stackoverflow.com/questions/43265992/how-to-pass-an-additional-parameter-to-passport-authenticate

(I already do `fbStrategy.passReqToCallback = true` ) I am riffing off 
https://scotch.io/tutorials/easy-node-authentication-linking-all-accounts-together but want to use this social authentication service for multiple apps, ex: the one that controls the heating system, the one that turns on the sprinklers etc.

Basically if one of these apps checks with the server and doesn't have a correct token it get redirected to this social authentication service (social-auth). When the user presses on of the social login buttons it grabs the parameter of what app its arriving from and adds it as a parameter for `/auth/facebook/:appid`

        // send to facebook to do the authentication
        app.get('/auth/facebook/:appId', function(req,res,next){
            passport.authenticate(
                'facebook', { scope : 'email' }
            )(req,res,next);
        });

`req` of `req,res,next` is the serialized user record. At this point social-auth doesn't know who the user is. 


    fbStrategy.passReqToCallback = true;  
    passport.use(new FacebookStrategy(fbStrategy,
        function(req, token, refreshToken, profile, done) {
            var email = (profile.emails[0].value || '').toLowerCase()     
            process.nextTick(function() {...

Once authorization is complete I want to redirect back to the calling app and I need the `:appId` param to ride along so I can go back to the right site.

Now generally it would work if I just made a variable like `currentAppId` accessible to the various social stategies but If you happened to have multiple people authenticating at the same time then you conceivably have a user return to the wrong app, or some other users app. That's why I need `appId` to travel as param to `passport.authenticate` . Where should I be looking to figure out how. Could I wrap `passport.authenticate` or otherwise modify things?

- https://code.tutsplus.com/articles/social-authentication-for-nodejs-apps-with-passport--cms-21618
- https://scotch.io/tutorials/easy-node-authentication-linking-all-accounts-together
- https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow


- https://developers.facebook.com/apps/263878937398656/fb-login/
- https://apps.twitter.com/app/13521887/keys
- https://github.com/settings/applications/499597

Now that I've convinced myself that a CORS rest api for authentication is not in the cards <s>services/social-jwt-stateless</s> and that some networks like twitter and linkedin are still on Oauth1.1 and can't authenticate from a javascript front end, I am on the trail of having two backends, one to handle social authentication and another for the actual CORS friendly api serving a SPA. So then there would also be two front ends made to look as one. 

A user opens an SPA and if there is not a current, valid JWT token in localStorage or if the token (which travels on every request to the server) is expired or invalid then the SPA redirects to the the social-auth server which offers login choices from its server delivered pages. 

Now all the OATH calls to the social network and callbacks from them occur ending up with an authenticated user with an email address (used as a primary key), name, soc.token etc., in short everything OATH needs to determine if the user is valid, or needs to re-login. The end result is that some user is authenticated. social-auth then sends the pertinant info to the SPA's api as a JWT encoding an email and expiration.  

Once a user authenticates by some social network and the social-auth authentication server has sent its token the api forwards it (or a new/different JWT) to the SPA

Now all is good. The SPA sees what it is allowed to see for that user and can interact with the backend api.

If the SPA token goes away then the app redirects to social-auth and the process repeats.

?? Should social-auth keep track of which apps a user is using it for ??
?? Would it work for as the authorizer for multiple apps??

## 00-initial-commit
starting with Code for the entire scotch.io tutorial series: Complete Guide to Node Authentication  www/crowd/node-authentication-guide, 

- moved auth.js and database.js into env.json.
- to get email from twitter, created privacy and terms of service pages, included `userProfileURL` and `includeEmail` in the Twitter Strategy and in `https://apps.twitter.com/app/13521887/permissions` added the permission `Request email addresses from users`
- added github to the ejs pages, routes, env and passport strategy.

## 01-change-data-model
changed

- /config/passport.js
- /app/routes.js

<s>TODO</s>s>
the database is still a mess needs to be associated with email address as the key, and maybe a field with app names and tokens that are using this social-auth service per email key.

if profile
    get email
    find email if err return done(err)
    if email
        if !facebook add a facebook user for that email 
        else if !facebook.token
            if facebook id = profile.id               
                add token to user return 
            else replace entire facebook entry return
        return done(null,user)
    else create user           

## 02-local-appid
### appid


A call to social-auth will look something like get`http://127.0.0.1:7080/?appid=duck&appapi=https://services.sitebuilt.net/cascada`. or post The route will check if the app is registered else it will add it. 

Maybe there will have to be some general token key that all app that use social-auth will need.

- [x]
`{
    appId: 'duck',
    appApi: 'https://services.sitebuilt.net/cascada',
    appRedirect: https://cascada.sitebuilt.net,
    appKey:  'dlkdlkrleklrkelkr'
}`

Maybe the SPA just sends and appid and an api route. All api's who use social-auth must have the jwt.secret for social-auth and all its apps. You get it when the app is entered into the app database. You get it by calling the api route with a jwt made by secret encoding the appid. The api returns the appRedirect and a new appkey token. Both get stored in the app database.


### any signup 
Any signup will result in the creation of a token that encodes
`{
    email: userinfo.emailkey,
    appid: appid,
    exp: '90'days'
}`
So the last step of the Strategy would be to send that token to the api and redirect to the SPA. You don't need to keep a copy anywhere since if the SPA loses its token it just redirects to`http://127.0.0.1:7080/?appid=duck&appapi=https://services.sitebuilt.net/cascada`

So the api gets sent a tokenized user and accepts it because social-auth has included the bearer appkey token.

Any auth will also put the appid in the list of apps for that user

### local signup

if email

- [] register an appid
- [] 