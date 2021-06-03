const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview=async (req, res) => {
    
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    newReview.save();
    campground.save();
    req.flash('success','Created a new review');

    res.redirect(`/campgrounds/${req.params.id}`);
};
module.exports.deleteReview=async (req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Deleted the review');
    res.redirect(`/campgrounds/${id}`);
};