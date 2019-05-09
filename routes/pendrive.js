var express = require('express');
var router = express.Router();
var ebay =require("./ebayclient/credentials.js");
var MongoClient = require("mongodb").MongoClient;
var AliExpressSpider = require('aliexpress');



/* GET home page. */
router.get('/', function(req, res, next) {

  //from database
   MongoClient.connect("mongodb://localhost:27017/", function(err, db){
          if(err)
                console.log(err);          


          var dbo = db.db("productComparisonDB"); 
                                      
          
          dbo.collection("ebayPendrive").find({}).limit(6).toArray(function(err, result){
            if(err)
            throw err;           
             dbo.collection("aliExpressPendrive").find({}).limit(6).toArray(function(err,ren){
                res.render('index', {
                  title : "Pendrive listing",
                  listingsEbay : result,
                  listingsAliex : ren,
                  website : ["aliexpress", "ebay"]

                }) 
             });
             
                     
            db.close();

         });
  });

});



router.get('/updateproducts', function(req, res, next){
  var listings;  
  
  MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
    if (err) throw err;
    var dbo = db.db("productComparisonDB");
   
    dbo.collection("ebayPendrive").deleteMany({},function(err, obj) {
      if (err) throw err;
      dbo.collection("aliExpressPendrive").deleteMany({},function(err,obj){
        if (err) throw err; 

        AliExpressSpider.Search({
  
            keyword: 'pendrive',
            page: 2

          }).then(function(d){            
          var list = d.list;
        
          list.forEach(element => {
            title = element.img;
            price = element.price;
            img = element.img;
            url = element.url;
            if(title != undefined){
              var i1 = title.lastIndexOf('/');
              var i2 = title.lastIndexOf('.');
      
              var p =  { "title" : title.substring(i1+1, i2), "price": price};
              MongoClient.connect("mongodb://localhost:27017/", function(err, db){
                if(err)
                      console.log(err);          
      
                var dbo = db.db("productComparisonDB");              
                
                dbo.collection("aliExpressPendrive").insertOne(p, function(err, res){
                  if(err)
                  throw err;              
                });
              });
      
            }
          });
        
        });
      
      
         ebay.findItemsByKeywords("pendrive").then((data) => {  
      
            var listings = data[0].searchResult[0].item;
            
              listings.forEach(function(l2){
              MongoClient.connect("mongodb://localhost:27017/", function(err, db){
                if(err)
                      console.log(err);          
      
                var dbo = db.db("productComparisonDB");              
                var price =  l2.sellingStatus[0].currentPrice[0].__value__;
                var title =  l2.title[0];  
                var url = l2.viewItemURL[0];
                var img = l2.galleryURL[0];     
                
                var obj = { "title" : title, "price" : price, "url" : url, "img" : img};
                
                dbo.collection("ebayPendrive").insertOne(obj, function(err, result){
                  if(err)
                  throw err;                   
                });
              });
            });  
      
            res.send("Document inserted");   
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
         
          dbo.collection("aliExpressPendrive").deleteMany(function(err, result){
            if(err)
            throw err;

           dbo.collection("ebayPendrive").deleteMany(function(err,result){
            res.send("Products deleted ");  
           });


             
          });
      });
});

module.exports = router;
