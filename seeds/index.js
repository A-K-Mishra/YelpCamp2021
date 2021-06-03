const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 10)+20;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo laborum, nesciunt voluptas amet explicabo suscipit! Sequi obcaecati repellat veniam reiciendis reprehenderit ab distinctio nisi ipsum. Maiores labore vel inventore eius?",
            price:price,
            author:"60b66c373b314f51a0cbb518",
            geometry:{
              coordinates:[cities[random1000].longitude,cities[random1000].latitude],
              type:"Point",
            },
            image: [
                {
                  url: 'https://res.cloudinary.com/aniketkumar/image/upload/v1622594671/YelpCamp/dohuegt2pgab1ist7e0v.jpg',
                  filename: 'YelpCamp/dohuegt2pgab1ist7e0v'
                },
                {
                  url: 'https://res.cloudinary.com/aniketkumar/image/upload/v1622594677/YelpCamp/j2tjkov9zhmrrlvjhv1a.jpg',
                  filename: 'YelpCamp/j2tjkov9zhmrrlvjhv1a'
                },
                {
                  url: 'https://res.cloudinary.com/aniketkumar/image/upload/v1622594685/YelpCamp/tejbfv7irmhc1rsitsxu.jpg',
                  filename: 'YelpCamp/tejbfv7irmhc1rsitsxu'
                }
              ],

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})