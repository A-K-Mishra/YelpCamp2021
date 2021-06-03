const User = require('../models/user');
module.exports.renderUserRegistrationForm=(req,res)=>{
    res.render('users/register');
};
module.exports.registerUser =async(req,res,next)=>{
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const newUser = await User.register(user, password);
        req.login(newUser,err =>{
            if(err) return next(err);
            req.flash('success', `Welcome to YelpCamp, ${username}`);
            res.redirect('/campgrounds');
        })
        
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
};
module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login');
};
module.exports.loginUser =(req,res)=>{
    req.flash('success',`Welcome back ${req.body.username}`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};
module.exports.logoutUser=(req,res)=>{
    req.logout();
    req.flash('success','See you soon!!!');
    res.redirect('/campgrounds');
};