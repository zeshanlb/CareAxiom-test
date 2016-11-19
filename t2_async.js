var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var normalizeUrl = require('normalize-url');
var async = require("async");
 
var app = express();

app.set('view engine', 'ejs');

app.get('/I/want/Title/', function (req, res) {
	var titles = [];
	var addresses = [];

	if(typeof req.query.address !== 'undefined'){
		if(typeof req.query.address ==='string'){
			addresses.push(req.query.address);
		}		
		else{
			addresses = req.query.address;
		}

		async.map(addresses,get_title,function(err, titles){
			res.render('titles',{titles:titles});
    	});
	}
	else{
		res.render('titles',{titles:titles});
	}
});

var get_title = function(address,callback){
	if(address) address = normalizeUrl(address);

	request(address?normalizeUrl(address):address,function(error, responce, body) {
		var title;
		if(error){
			console.log('Error:' + error.message);
			title = "NO RESPONSE";
		}
		else if (responce.statusCode !== 200) {
			console.log('Invalid Status Code Returned:' + responce.statusCode);
			title = "NO RESPONSE";
		}
		else{
			var $ = cheerio.load(body);
			title = '"'+$("title").text()+'"';
		}

		callback(null,{address:address,title:title});
	});
}

app.all('*', function(req, res){
	res.status(404);
	res.render('404');
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
	