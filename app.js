var express = require("express");
var app = express();
var bodyParser = require("body-parser");


var functions = require("./functions");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
		res.render("home");
});

app.post("/search", (req, res) => {
	var title = req.body.title;
		functions.searchByTitle(title).then(result => {
			functions.appendMissingImage(result).then(placeholder =>{
				functions.appendMissingGenres(result).then(placeholder => {
					functions.appendMissingPlatforms(result).then(placeholder => {
						functions.sortByYear(result);
						res.render("search", {titles: result,
											 functions: functions,
											 query: title});
						});
					});
				});
			});
});
			

app.get("/games/:id", (req, res) => {
	var title = req.params.id;
	functions.searchByName(title).then(response => {
		functions.appendMissingImage(response).then(placeholder => {
		functions.appendMissingGenres(response).then(placeholder => {
			functions.appendMissingPlatforms(response).then(placeholder => {
				functions.findSimilars(response[0].similar_games).then(similars => {
					functions.appendMissingImage(similars).then(placeholder => {
						functions.appendMissingGenres(similars).then(placeholder => {
							functions.appendMissingPlatforms(similars).then(placeholder => {
								functions.appendMissingCompanies(response).then(placeholder => {
									functions.appendMissingCompanies(similars).then(placeholder => {
										functions.appendMissingWebsites(response).then(placeholder => {
											functions.sortByRating(similars);
											res.render("results", {title: response[0],
									  	  				   similars: similars,
														   functions: functions});	
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	});
	
});




app.listen(process.env.PORT, process.env.IP, function(){
	console.log("GameRec server has launched");
});