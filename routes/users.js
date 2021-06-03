const express= require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/users')

router.route('/register')
    .get(user.renderUserRegistrationForm)
    .post( catchAsync(user.registerUser));

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),user.loginUser);
    
router.get('/logout', user.logoutUser);
module.exports= router;