if(process.env.NODE_ENV !=='production'){
    require('dotenv').config();
}

const mongoSanitize = require('express-mongo-sanitize');
const express = require('express');
const app = express();
const flash= require('connect-flash');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas');
const campgroundRoutes= require('./routes/campground'); 
const reviewRoutes= require('./routes/review'); 
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy= require('passport-local');
const helmet = require('helmet');
const MongoStore = require("connect-mongo");

const dburl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dburl,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error :"));
db.once("open", () => {
    console.log("Database Connected...")
})


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(mongoSanitize());
app.use(helmet());
const secret = process.env.SECRET || "thisshouldbeabettersecret" ;
const store= MongoStore.create({
    mongoUrl:dburl,
    secret,
    touchAfter:24*3600,
})
store.on("error",function(e){
    console.log("SESSION STORE ERROR !",e);
})
const sessionConfig={
    store,
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }
}

app.use(session(sessionConfig));
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const styleSrcElemUrls=[
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/mapbox-gl-js/v2.3.0/mapbox-gl.css",
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css"
]
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            styleSrcElem:["'self'","'unsafe-inline'",...styleSrcElemUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/aniketkumar/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs',ejsMate);

app.use((req,res,next)=>{
    if(req.session.returnTo && req.originalUrl != '/login'){
        delete req.session.returnTo;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error =req.flash('error');
    next();
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get("/", (req, res) => {
    res.render("home");
});


app.all('*', (req, res, next) => {
    next(new ExpressError("PAGE NOT FOUND", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong ..."
    res.status(statusCode).render('error', { err });
    //res.send(`Oh boy !! Something went wrong!! ${err.name}`)
})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving from Port ${port}.....`);
});