var express = require('express');
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
router.get('/', function(req, res, next){
    res.render("ProductRatingWebsite.ejs");//goes to views folder and search for this file
  }); 

router.get('/register.ejs',function(req, res, next){
    res.render("register.ejs");
  
  });
  router.get('/SignIn.ejs',function(req, res, next){
    res.render("SignIn.ejs");
  
  });
  
  router.get('/RegistrationDB.ejs',function(req, res, next){
    //console.log();
    
   
              MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
                  if (err) throw err;
                  var dbo = db.db("productComparisonDB");
                 
                  dbo.collection("Admin").insertOne(req.query, function(err, r) {
                      if (err) throw err;
                      console.log("User Registered");
                       db.close();                     
                      res.render('SignIn.ejs', {result:"User Registered"});
                  });      
                });     
    
  });
  
  router.post('/loginValidation', function(req, res, next) {
    MongoClient.connect("mongodb://localhost:27017/", function(err, db) {
      if (err) throw err;
      var dbo = db.db("productComparisonDB");
     
      
      dbo.collection("Admin").find(req.query).toArray(function(err, result) {
        if (err) throw err;
        db.close();
          
        if(result.length == 0)//Unregistered user
        res.render('SignIn.ejs');
        else
        res.render('Admin.ejs');
      });
  
  
    });
  
  });

  module.exports = router;
