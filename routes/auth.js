const router = require("express").Router();
const passport = require("passport");

router.get('/facebook', passport.authenticate('facebook', { scope : 'email,user_photos' }));
 
router.get('/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

module.exports = router