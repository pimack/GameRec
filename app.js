var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var functions = require("./functions");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Routes

app.get("/", (req, res) => {
		res.render("home");
});

app.post("/search", (req, res) => {
	var title = req.body.title;
	functions.appendSearchTitle(title).then(response => {
		res.render("search", {titles: response,
						functions: functions,
						query: title});
		});
});
			
app.get("/games/:id", (req, res) => {
	var title = req.params.id;
	functions.appendResultsTitle(title).then(response => {
		functions.appendResultsSimilars(response[0]).then(similars => {
			res.render("results", {title: response[0],
								   similars: similars,
								   functions: functions});	
		});
	});
});

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("GameRec server has launched");
});