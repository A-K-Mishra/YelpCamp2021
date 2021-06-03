const  mongoose = require('mongoose');
const Schema=mongoose.Schema;
const Review = require('./review');
const User = require('./user')

const ImageSchema = new Schema(
    {
        url:String,
        filename:String
    }
);
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});
const opts={toJSON:{virtuals:true}};
const  CampgroundSchema =new Schema({
    title:String,
    image:[ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref :"Review",
        }
    ],
    
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
    <p class='text-muted'>${this.description.substring(0,20)}...</p>`
});
CampgroundSchema.post('findOneAndRemove',async function(doc){// check here to replace findOneAndRemove with findOneAndDelete
    if(doc){
        await Review.deleteMany({
            _id:{
                $in : doc.reviews
            }
        })
    }
});
const Campground = mongoose.model('Campground',CampgroundSchema);
module.exports = Campground;