const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../models/listing.js');
const bwipjs = require('bwip-js');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse } = require('fast-xml-parser');



router.route("/")
  .get(wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/show.ejs", { allListings });
    }))
  .post(wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);

    try {
      const savedListing = await newListing.save();

      const objectString = JSON.stringify(savedListing);

      const barcodeConfig = {
        bcid: 'code128',
        text: objectString,
        scale: 3,
        height: 10,
      };

      bwipjs.toBuffer(barcodeConfig, async (err, pngBuffer) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
        savedListing.barcode = pngBuffer.toString('base64');
        await savedListing.save();
        res.render('listings/barcd.ejs', { listing: savedListing });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }));

// New Route
router.get("/new", (req, res) => {
  res.render('listings/Form.ejs');
});

router.get("/scan",(req,res) => {
    res.render("listings/scan.ejs");
});

router.post('/upload-to-flipkart', async (req, res) => {
  try {
    const products = await Listing.find();

    // Format and upload each product to Flipkart
    for (const product of products) {
      const flipkartProductData = {
        product_id: product.productId,
        title: product.productName,
        description: product.productDescription || '',
        manufacturer: product.manufacturerName || '',
        quantity: product.productQuantity || 0,
        price: product.price,
        barcode: product.barcode || '',
        image: product.image.url, 
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(flipkartProductData)) {
        formData.append(key, value);
      }

      if (product.image.filename) {
        const imagePath = path.join(__dirname, '..', 'images', product.image.filename);
        formData.append('image', fs.createReadStream(imagePath));
      }

      // Make a POST request to Flipkart product upload endpoint
      const response = await axios.post('https://api.flipkart.net/sellers/listings/v3', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': 'Bearer YOUR_FLIPKART_API_TOKEN', // Replace with your Flipkart API token
        },
      });

      console.log('Flipkart API Response:', response.data);
    }

    res.json({ success: true, message: 'Products uploaded to Flipkart' });
  } catch (error) {
    console.error('Error uploading products to Flipkart:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/upload-to-amazon', async (req, res) => {
  try {
    const products = await Listing.find();

    const productFeedXML = buildAmazonProductFeedXML(products);

    const contentMd5 = crypto.createHash('md5').update(productFeedXML).digest('base64');

    // Make a POST request to Amazon MWS endpoint
    const response = await axios.post('https://mws.amazonservices.com/Feeds/2009-01-01', productFeedXML, {
      headers: {
        'Content-MD5': contentMd5,
        'Content-Type': 'text/xml',
        'x-amazon-user-agent': 'YOUR_USER_AGENT', 
        'x-amazon-seller-id': 'YOUR_SELLER_ID', 
        'x-amazon-authentication': `AWS3-HTTPS AWSAccessKeyId=YOUR_ACCESS_KEY_ID, Algorithm=HmacSHA256, Signature=YOUR_SIGNATURE`, 
      },
    });

    const parsedResponse = parse(response.data);

    // Handle the parsed response from Amazon MWS

    console.log('Amazon MWS Response:', parsedResponse);

    res.json({ success: true, message: 'Products uploaded to Amazon' });
  } catch (error) {
    console.error('Error uploading products to Amazon:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// function to build Amazon Product Feed XML
function buildAmazonProductFeedXML(products) {
  // here we have to build logic to construct feed xml and then return the xml string.
  
};

// Route to visit product details

router.get('/:id/api',async (req,res) => {
  let { id } = req.params;
    const listing = await Listing.findById(id);
  res.render("./listings/upload.ejs",{ listing })
})


router.get('/api/products', async (req, res) => {
  try {
    const products = await Listing.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to render Dashboard

router.get('/dashboard',(req,res) => {
  res.render("./listings/dashboard.ejs");
})


// Route to render All Orders

router.get('/dashboard/orders',async (req,res) => {
  const allListings = await Listing.find({});
  res.render("listings/order.ejs", { allListings });
})

module.exports = router;