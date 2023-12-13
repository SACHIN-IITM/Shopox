const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const defaultImageUrl = "https://images.unsplash.com/photo-1573376670774-4427757f7963?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym94fGVufDB8fDB8fHww";

const listingSchema = new Schema({
    productName: {
        type: String,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
    manufacturerName: String,
    productDescription: String,
    productQuantity: Number,
    image: {
        url: {
            type: String,
            default: defaultImageUrl,
        },
        filename: String,
    },
    price: Number,
    barcode: String,
});




const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;