const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require('mongoose');
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const amazonUploadRouter = require('./routes/listing.js');
const flipkartUploadRouter = require('./routes/listing.js');



const MONGO_URL = "mongodb://127.0.0.1:27017/Shopox";

main().then(() => {
    console.log("connected to DB")
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



app.get('/', (req, res) => {
    res.render("./listings/show.ejs", { listingRouter });
});

app.use("/listings", listingRouter);

app.get('/listings', (req, res) => {
    res.render('./listings/show.ejs');
});


app.use('/api', amazonUploadRouter);
app.use('/api', flipkartUploadRouter);





app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!!!"} = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log('server is listening to port 8080');
});