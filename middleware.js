const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You need to Sign In to proceed!');
        return res.redirect('/login');
    }
    next();
}
const isAuthor = async(req,res,next)=>{
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author._id.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit details of this Campground!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
const isReviewAuthor = async(req,res,next)=>{
    const { id,reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author._id.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this review!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}
const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}
module.exports.validateReview=validateReview;
module.exports.validateCampground = validateCampground;
module.exports.isLoggedIn = isLoggedIn;
module.exports.isAuthor = isAuthor;
module.exports.isReviewAuthor=isReviewAuthor;