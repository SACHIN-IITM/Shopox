const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        productName: Joi.string().required(),
        productId: Joi.string().required(),
        manufacturerName: Joi.string().required(),
        productDescription: Joi.string().required(),
        productQuantity: Joi.number().required().min(1),
        image: Joi.string().allow("", null),
        price: Joi.number().required().min(0),
        barcode: Joi.string().allow("", null)
    }).required()
});