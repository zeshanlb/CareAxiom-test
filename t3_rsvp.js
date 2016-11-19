var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var normalizeUrl = require('normalize-url');
var RSVP = require('rsvp');
 
var app = express();

app.set('view engine', 'ejs');

app.get('/I/want/Title/', function (req, res) {
	var titles = [];
	var addresses = [];
	var promises = [];

	if(typeof req.query.address !== 'undefined'){
		if(typeof req.query.address ==='string'){
			addresses.push(req.query.address);
		}		
		else{
			addresses = req.query.address;
		}

		addresses.forEach(function(address) {
			promises.push(
				new RSVP.Promise(function(resolve, reject){
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

						resolve({address:address,title:title});
					});
				})
			); 
		});

		RSVP.all(promises).then(function(titles) {
    		res.render('titles',{titles:titles});
		});
	}
	else{
		res.render('titles',{titles:titles});
	}
});

app.all('*', function(req, res){
	res.status(404);
	res.render('404');
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
	