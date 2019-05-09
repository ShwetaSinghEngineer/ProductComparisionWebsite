var express = require('express');
var router = express.Router();
var ebay =require("./ebayclient/credentials.js");
var MongoClient = require("mongodb").MongoClient;
var AliExpressSpider = require('aliexpress');



router.get('/', function(req, res, next) {

  //from database
   MongoClient.connect("mongodb://localhost:27017/", function(err, db){
          if(err)
                console.log(err);          


          var dbo = db.db("productComparisonDB"); 
                                      
          
          dbo.collection("ebayBlackview").find({}).limit(6).toArray(function(err, result){
            if(err)
            throw err;           
             dbo.collection("aliexpressBlackview").find({}).limit(6).toArray(function(err,ren){
                res.render('index', {
                  title : "Blackview Phones",
                  listingsEbay  : result,
                  listingsAliex : ren,
                  website : ["aliexpress", "ebay"]

                }) 
             });
             
                     
            db.close();

         });
  });

});



router.get('/updateProducts', function(req, res, next){
  var listings;  
  
  MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
    if (err) throw err;
    var dbo = db.db("productComparisonDB");
   //clear database prior insertion of data for dynamic database
    dbo.collection("ebayBlackview").deleteMany({},function(err, obj) {
      if (err) throw err;
      dbo.collection("aliexpressBlackview").deleteMany({},function(err,obj){
        if (err) throw err; 

        AliExpressSpider.Search({
          keyword: 'BLACKVIEW BV9600 pro IP68 6.21 6GB+128GB 5580mAh 16MP Waterproof 4G Smartphone',
          page: 1
        }).then(function(d){
          var list = d.list;
        
          list.forEach(product => {
            title = product.img;
            price = product.price;
            img = product.img;
            url = product.url;
            if(title != undefined){
              //extraction of productname from image url
              var i1 = title.lastIndexOf('/');
              var i2 = title.lastIndexOf('.');
      
              var object =  { 
                         "title" : title.substring(i1+1, i2), 
                         "price" : price, 
                          "img"  : img, 
                          "url"  : url
                       };
              MongoClient.connect("mongodb://localhost:27017/", function(err, db){
                if(err)
                      console.log(err);          
      
                var dbo = db.db("productComparisonDB");              
                
                dbo.collection("aliexpressBlackview").insertOne(object, function(err, res){
                  if(err)
                  throw err;              
                });
              });
      
            }
          });
        
        });
      
      
         ebay.findItemsByKeywords("BLACKVIEW BV9600 pro IP68 6.21 6GB+128GB 5580mAh 16MP Waterproof 4G Smartphone").then((data) => {  
      
            var listings = data[0].searchResult[0].item;
            
              listings.forEach(function(product){
              MongoClient.connect("mongodb://localhost:27017/", function(err, db){
                if(err)
                      console.log(err);          
      
                var dbo = db.db("productComparisonDB");              
                var price =  product.sellingStatus[0].currentPrice[0].__value__;
                var title =  product.title[0]; 
                var url = product.viewItemURL[0];
                var img = product.galleryURL[0];      
                
                dbo.collection("ebayBlackview").insertOne({title, price, url, img}, function(err, result){
                  if(err)
                  throw err;
                   
                });
              });
            });  
      
            res.send("Database Updated");   
          }, (error) => {
            console.log(error);
        });
      });
      db.close();
    });
  });


  
});


router.get('/deleteProducts', function(req, res, next){
    MongoClient.connect("mongodb://localhost:27017/", function(err, db){
          if(err)
                console.log(err);          


          var dbo = db.db("productComparisonDB");              
         
          dbo.collection("ebayBlackview").deleteMany(function(err, result){
            if(err)
            throw err;

           dbo.collection("aliexpressBlackview").deleteMany(function(err,result){
            res.send("Products deleted ");  
           });


             
          });
      });
});

module.exports = router;
