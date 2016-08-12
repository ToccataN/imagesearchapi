var express = require('express'),
    app = express(),
    nba = require('node-bing-api')({accKey: "e/u7a8ZXSTZAwkLHqxVYynv49/jrxCZ2s1XPWiDYEGs"}),
    mongoclient = require('mongodb').MongoClient,
    url = "mongodb://localhost:27017/imagesearch",
    
    all={};
    
    var insert = function(x){
        mongoclient.connect(url, function(e, db){
            var collection = db.collection('searchy');
            var num = Math.floor(Math.random() * 90000)+10000;
            collection.insert({_id: num, search: x}, function(e, result){
                if (e) return e;
                console.log(result);
                db.close();
            });
        });
    };
    
    var read = function(){
       all={};
        mongoclient.connect(url, function(e,db){
            var collection = db.collection('searchy');
            collection.find().toArray(function(e, result){
                console.log(result);
                all.a = result;
                db.close();
            })
        })
        
    }
    
    app.get('/', function(req, res){
        mongoclient.connect(url, function(e, db){
            db.createCollection('searchy');
            db.close();
        })
        res.send("Image-Search application. After searching a few times, enter 'searchapi' as a parameter to reveal previous searches.");
    })
    
    app.param('id', function(req, res){
        var reqpar= req.params.id,
            b,
           parser = function(b){
                for(var i=0; i< b.length; i++){
                    var result= {};
                    result.displayUrl='<a href="'+b[i]["DisplayUrl"]+'">'+b[i]["DisplayUrl"]+'</a>';
                    result.title = b[i]["Title"];
                    result.mediaUrl= b[i]["MediaUrl"];
                    all[""+i]= result;
                }
            };
         if (reqpar.toString() == "searchapi"){
             read();
             setTimeout(function(){res.send(all.a)}, 300);
         } else {
        nba.images(reqpar, {top:10},function(e, res, body){
            if (e) return e;
            b= body;
        })
        
        setTimeout(function(){
            
            parser(b["d"]["results"]);
            insert(reqpar);
            res.send(JSON.stringify(all));
            
        },1000);
         }
    })
    
     app.get('/:id', function(req, res){
         
        res.end();
     })
    
    app.listen(8080, function(){
        console.log("listenning on port 8080");
    })
    
    
    