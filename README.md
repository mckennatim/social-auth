# social-auth

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

## tags
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