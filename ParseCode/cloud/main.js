// CSE 403, Spring 2013 ZooTypers
// JavaScript code for to be ran on Parse
// Matches players up against one another and fetches words for 
// the two players from a database.

var numWords = 709; // there is 709 words in the database but its 0 based index

// adds a user to the database to wait for another player
Parse.Cloud.define("addUser", function(request, response) {
	
	// check if the player already exists in the database
	Parse.Cloud.run('duplicate', { user: request.params.user }, {
		success: function() {
			
			// create a new player object to add
			var Players = Parse.Object.extend("Players");
			var players = new Players();

			players.set("name", request.params.user);
			players.set("opponent", "");
			players.set("nextWordIndex", -1);			

			players.save();
			response.success("successful");
		},
		error: function() {
			response.success("name already exists!");
		}
	});
});

// check whether there is someone waiting for a multiplayer game
Parse.Cloud.define("checkOthers", function(request, response) {
	var players = Parse.Object.extend("Players");
	var query = new Parse.Query(players);
	query.equalTo("opponent", "");
	
	// condition for not counting myself
	query.notEqualTo("name", request.params.user);
	query.first({
		success: function(object) {
			
			// declare to my opponent that he/she is going against me
			var randy = Math.floor(Math.random() * numWords);
			object.set("opponent", request.params.user);
			object.set("nextWordIndex", randy); 
			object.save();
			
			// update myself
			Parse.Cloud.run('updateUser', { user: request.params.user, opponent: object.get("name"), random: randy });				

			response.success("found opponent");
		},
		error: function() {
			response.success("found no match");
		}
	});
});

// update myself to reflect that I am matched against an opponent
Parse.Cloud.define("updateUser", function(request, response) {
	var players = Parse.Object.extend("Players");
	var query2 = new Parse.Query(players);
	query2.equalTo("name", request.params.user);
	
	// querying for myself
	query2.first({
		success: function(object) {
			object.set("opponent", request.params.opponent);
			object.set("nextWordIndex", request.params.random); 
			object.save();
			response.success("update successful");							
		},
		error: function() {
			response.error("internal error");
		}
	});
});

// check whether I have been matched with an opponent
Parse.Cloud.define("checkMeOut", function(request, response) {
	var players = Parse.Object.extend("Players");
	var query = new Parse.Query(players);
	query.equalTo("name", request.params.user);
	query.notEqualTo("opponent", "");
	query.first({
		success: function(results) {
			response.success("found opponent");
		},
		error: function() {
			response.success("found no match");
		}
	});
});

// deletes the user from matchmaking, 
// ensures that no record of this player will exist after execution 
Parse.Cloud.define("deleteUser", function(request, response) {
	var players = Parse.Object.extend("Players");
	var query = new Parse.Query(players);
	query.equalTo("name", request.params.user);
	
	// find me
	query.find({
		success: function(results) {
			for (var i = 0; i < results.length; i++) {
				results[i].destroy();
			}
			response.success("successful");
		},
		error: function() {
			response.error("failed");
		}
	});
});

// check for whether there is a another entry of user
Parse.Cloud.define("duplicate", function(request, response) {
	var players = Parse.Object.extend("Players");
	var query = new Parse.Query(players);
	query.equalTo("name", request.params.user);
	query.find({
		success: function(results) {
			// if I exist already
			if (results.length == 0) {
				response.success();
			} else {
				response.error();
			}
		},
		error: function() {
			response.success();
		}
	});
});