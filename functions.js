var axios = require("axios");

module.exports = {
	
	// Image URL constants
	
	coverSmall: "https://images.igdb.com/igdb/image/upload/t_cover_small/",
	coverBig: "https://images.igdb.com/igdb/image/upload/t_cover_big/",
	noImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png",
	
	// Supplemental functions
	
	sortByYear:
		function sortByYear(array){
			array.sort(function (a,b){
				return b.first_release_date - a.first_release_date;
			});
			return array;
		},
		
	sortByRating:
		function sortByRating(array){
			array.sort(function (a,b) {
				return b.rating - a.rating;
			});
			return array;
		},
	
	convertUNIX:
		function convertUNIX(timestamp){
			var date = new Date(timestamp*1000);
			return date.getFullYear();
		},
		
	// API calls to append missing information to title(s) and similar games
	// Every function makes an axios call to IGDB API to a different endpoint
	// Every GET and POST involving these calls are expensive in hits
	// As many as 50 objects can be in a single array
	
	appendMissingWebsites: 
		async function appendMissingWebsites(array){
			let data = array;
			let arr = data.map(info => {
				return axios.get("https://api-v3.igdb.com/websites", {
					headers: {
						"user-key": process.env.API_KEY,
						'Accept': "application/json"
				},
					data: 'fields url; where game = ' + info.id + '& category = 1;'
			 }).then(response => {
						info.url = response.data[0].url;
						return info;
				}).catch(err => {
					info.url = [];
					return info;
				});
			});
			let result = await axios.all(arr).then(end => {
				return end;
		});
	},
	
	appendMissingCompanies: 
		async function appendMissingCompanies(array){
			let data = array;
			let arr = data.map(info => {
				return axios.get("https://api-v3.igdb.com/companies", {
					headers: {
						"user-key": process.env.API_KEY,
						'Accept': "application/json"
				},
					data: 'fields name; where developed = (' + info.id + ');'
			 }).then(response =>{
						info.developers = response.data;
						return info;
				}).catch(err => {
					info.developers = [];
					return info;
				});
			});
			let result = await axios.all(arr).then(end => {
				return end;
		});
	},
	
	appendMissingImage:
		async function appendMissingImage(array){
			let data = array;
			let arr = data.map(info => {
				return axios.get("https://api-v3.igdb.com/covers", {
					headers: {
						"user-key": process.env.API_KEY,
						'Accept': "application/json"
				},
					data: 'fields image_id; where game = ' + info.id + ';'
			 }).then(response =>{
						info.image_id = response.data[0].image_id;
						return info;
				}).catch(err => {
					info.image_id = module.exports.noImage;
					return info;
				});
			});
			let result = await axios.all(arr).then(end => {
				return end;
		});
	},
	
	appendMissingGenres: 
		async function appendMissingGenres(array){
			let data = array;
			let arr = data.map(info => {
				return axios.get("https://api-v3.igdb.com/genres", {
					headers: {
						"user-key": process.env.API_KEY,
						'Accept': "application/json"
				},
					data: 'fields name; where id = (' + info.genres + ');'
			 }).then(genreResponse =>{
						info.genreNames = genreResponse.data;
						return info;
					}).catch(err => {
					info.genreNames = [];
					return info;
				});
			});
			let result = await axios.all(arr).then(end => {
				return end;
		});
	},
	
	appendMissingPlatforms:
		async function appendMissingPlatforms(array){
			let data = array;
			let arr = data.map(info => {
				return axios.get("https://api-v3.igdb.com/platforms", {
					headers: {
						"user-key": process.env.API_KEY,
						'Accept': "application/json"
				},
					data: 'fields name; where id = (' + info.platforms + ');'
			 }).then(platformResponse =>{
						info.platforms = platformResponse.data;
						return info;
					}).catch(err => {
						info.platforms = [];
						return info;
					});
			});
			let result = await axios.all(arr).then(end => {
				return end;
		});
	},
	
	// Find all games similar to the title by fields denoted in 'data'
	// Returns all similar games as separate objects in an array
	
	findSimilars:
		async function findSimilars(array){
			return axios.get("https://api-v3.igdb.com/games", {
				headers: {
					"user-key": process.env.API_KEY,
					'Accept': "application/json"
			},
				data: 'fields name,genres,first_release_date,rating,summary,similar_games,involved_companies,platforms,popularity,storyline; where id = (' + array + ');'
		 })
			.then(response =>{
				return response.data;
				}).catch(err => {
					console.log("Error!");
			});
	},
		
	// API call to search a title by exact name and return an object
		
	searchByName:
		async function searchByName(title){
			return axios.get("https://api-v3.igdb.com/games", {
			headers: {
      			"user-key": process.env.API_KEY,
      			'Accept': "application/json"
   	 },
			data: 'fields name,genres,first_release_date,rating,summary,similar_games,involved_companies,platforms,popularity,storyline; where name = "' + title + '";'
 	})
  		.then(response =>{
				return response.data;
			}).catch(err => {
				console.log("Error!");
		});
	},
	
	// API call to find all games that match the query inputted by user
	
	searchByTitle: 
		async function searchByTitle(title){
			return axios.get("https://api-v3.igdb.com/games", {
			headers: {
      			"user-key": process.env.API_KEY,
      			'Accept': "application/json"
   	 },
			data: 'search "' + title + '"; fields name,genres,first_release_date,rating,summary,similar_games,involved_companies,platforms,popularity,storyline; limit 50;'
 	})
  		.then(response =>{
				return response.data;
			}).catch(err => {
				console.log("Error!");
		});
	},
	
	// Functions that contain all required calls
	// Called in app.js, much more readable than making every required call individually 
	
	appendResultsTitle:
		async function appendResultsTitle(title) {
			return module.exports.searchByName(title).then(response => {
				return module.exports.appendMissingImage(response).then(placeholder => {
					return module.exports.appendMissingGenres(response).then(placeholder => {
						return module.exports.appendMissingPlatforms(response).then(placeholder => {
							return module.exports.appendMissingWebsites(response).then(placeholder => {
								return module.exports.appendMissingCompanies(response).then(placeholder => {
									return response;});
							});
						});
					});		
				});
			});
	},
	
	appendResultsSimilars:
		async function appendResultsSimilars(title) {
			return module.exports.findSimilars(title.similar_games).then(response => {
				return module.exports.appendMissingImage(response).then(placeholder => {
					return module.exports.appendMissingGenres(response).then(placeholder => {
						return module.exports.appendMissingPlatforms(response).then(placeholder => {
							return module.exports.appendMissingCompanies(response).then(placeholder => {
								module.exports.sortByRating(response);
								return response;
							});
						});
					});
				});
			});
	},
	
	appendSearchTitle:
		async function appendSearchTitle(title) {
			return module.exports.searchByTitle(title).then(response => {
				return module.exports.appendMissingImage(response).then(placeholder => {
					return module.exports.appendMissingGenres(response).then(placeholder => {
						return module.exports.appendMissingPlatforms(response).then(placeholder => {
							module.exports.sortByYear(response);
							return response;
						});
					});
				});
			});
	}
};