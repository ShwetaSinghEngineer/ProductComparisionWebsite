var eBay = require('ebay-node-api');

var ebay = new eBay({
    clientID: "RajeeSin-Productr-PRD-d79702c8a-b4781f60",
    clientSecret : "PRD-79702c8a236f-baa4-4914-9d7c-7280",    
    limit: 6
});

module.exports = ebay;