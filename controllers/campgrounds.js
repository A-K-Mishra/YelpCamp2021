const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary'); 
const { campgroundSchema, reviewSchema } = require('../schemas');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});

module.exports.index = async (req, res) => {
    const camps = await Campground.find({})
    res.render("campgrounds/index", { camps });
};
module.exports.renderNewForm=(req, res) => {
    res.render('campgrounds/new');
};
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1,
    }).send();

    const newCamp = await new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;   
    newCamp.image = req.files.map(f =>  ({url:f.path,filename:f.filename}));
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Succesfully Created a Campground');
    res.redirect(`/campgrounds/${newCamp._id}`);
};
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    
    const camp = await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find that Campground! Make sure you are using a correct URL!')
        res.redirect('/campgrounds');
    }
    
    res.render("campgrounds/show", { camp });
};
module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f =>  ({url:f.path,filename:f.filename}))
    camp.image.push(...images);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull :{image :{filename : {$in : req.body.deleteImages}}}});
    }
    await camp.save();
    req.flash('success', 'Succesfully Updated the Campground');
    res.redirect(`/campgrounds/${id}`);
};
module.exports.renderEditForm=async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error', 'Cannot find that Campground! Make sure you are using a correct URL!')
        res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { camp });
};
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndRemove(req.params.id);
    req.flash('success', 'Succesfully Deleted the Campground');
    res.redirect("/campgrounds");
};