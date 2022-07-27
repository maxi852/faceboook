const express = require('express')
const passport = require('passport')
const session = require("express-session");
const User = require('./models/User')

const facebookStrategy = require('passport-facebook').Strategy

const app = express()

const authRoute = require("./routes/auth")

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'bla bla bla' 
  }));

app.use(passport.initialize());

app.use(passport.session());

app.set("view engine","ejs")

passport.use(new facebookStrategy({
 
    // pull in our app id and secret from our auth.js file
    clientID        : "764437818316384",
    clientSecret    : "08f2e88bdaebb82ed653b4099e104ff3",
    callbackURL     : "http://localhost:5000/auth/facebook/callback",
    profileFields   : ['id','displayName','name','gender','picture.type(large)','email']
 
},// facebook will send back the token and profile
function(token, refreshToken, profile, done) {
 
    // asyncrona
    process.nextTick(function() {
 
        // busca al usuario en la base de datos con el id
        User.findOne({ 'uid' : profile.id }, function(err, user) {
 
            if (err)
                return done(err);
 
            // se fija si el usuario ya existe
            if (user) {
                console.log("user found")
                console.log(user)
                return done(null, user); // usuario encontrado, lo retorna
            } else {
                // crea un nuevo usuario
                var newUser = new User();
 
                // guardar la info en el modelo user
                newUser.uid    = profile.id;                  
                newUser.token = token;                    
                newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                newUser.email = profile.emails[0].value; // facebook puede retornar multiples email por eso agarramos el 1ero
                newUser.gender = profile.gender
                newUser.pic = profile.photos[0].value
                // guardar el usuario en la base de datos
                newUser.save(function(err) {
                    if (err)
                        throw err;
 
                    // Devuelve el nuevo usuario
                    return done(null, newUser);
                });
            }
 
        });
 
    })
 
}));
 
passport.serializeUser(function(user, done) {
    done(null, user);
});
 
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
 

/* rutas front*/
app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.user)
    res.render('profile', {
        user : req.user // get the user out of session and pass to template
    });
});
 
// se fija si esta logueado
function isLoggedIn(req, res, next) {
 
    //si esta autenticado en la session
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
 
app.get('/logout', function(req, res, next) {
    req.logOut(function(err) {
        if (err) { return next(err); }
        req.session.destroy()
        res.redirect('/');
      });
});

app.use("/auth", authRoute);

app.get('/',(req,res) => {
    res.render("index")
})

app.listen(5000,() => {
    console.log("App is listening on Port 5000")
})

