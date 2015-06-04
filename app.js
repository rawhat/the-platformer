var express = require('express')
 ,  jade = require('jade')
 ,	neo4j = require('neo4j')
 ,	bodyParser = require('body-parser')
 ,	cookieParser = require('cookie-parser')
 ,	unirest = require('unirest');

var db = new neo4j.GraphDatabase('http://localhost:7474');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('*', function(req, res, next){
	if(!req.cookies.username)
		res.render('index', {title : 'Platformer'});
	else
		return next();
});

app.get('/', function(req, res){
	if(req.cookies.username)
		res.redirect('/posts/');
	else
		res.render('index', {title : 'Platformer'})
});

app.post('/login/', function(req, res){
	db.cypher({
		query: 'MATCH (u:User {username: {username}, password: {password}}) RETURN u',
		params: {
			username: req.body.username,
			password: req.body.password,
		}
	}, function(err, results){
		if(err){
			console.log("problem");
			throw err;
		}
		var result = results[0];
		if(!result){
			res.send('Invalid username or password.');
		}
		else{
			res.send('true');
		}
	});
});

app.get('/create/', function(req, res){
	res.render('newuser.jade', {title: "New user"});
});

app.post('/create/', function(req, res){
	db.cypher({
		query: "CREATE (u:User {username: {username}, email: {email}, password: {password}});",
		params: {
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
		}
	}, function(err, results){
		if(err){
			res.send(false);
			res.end();
		}
		else{
			res.sendStatus(201);
			res.end();
		}
	});
});

app.get('/posts/', function(req, res){
	db.cypher({
			query: 	'match (poster:User)-[datePosted:MADE]-(post:Post) ' +
				'optional match (post)<-[:HAS]-(comment:Comment) ' +
				'with comment, post, poster, datePosted ' + 
				'optional match (comment)-[likes:LIKES]-(liker:User) ' +
				'with comment, count(likes) AS commentLikes, post, poster, collect(liker.username) AS commentLikers, datePosted ' +
				'optional match (post)-[likes:LIKES]-(liker:User) ' +
				'with comment, commentLikes, post, poster, commentLikers, count(likes) AS postLikes, collect(liker.username) AS postLikers, datePosted ' +
				'optional match (comment)-[dateCommented:POSTED]-(commenter:User) ' +
				'return ID(post) AS postid, poster.username = {curruser} AS editable, poster.username AS poster, datePosted.created AS postCreated, post.content AS postContent, postLikes, postLikers, collect({commentContent: comment.content, commenter: commenter.username, date: dateCommented.date, likes: commentLikes, likers: commentLikers, commentid: ID(comment), editable: commenter.username = {curruser}}) AS comments;',
			params: {
				curruser: req.cookies.username,
			}
		}, function(err, results){
		if(err){
			console.log(err);
			throw err;
		}
		results.sort(function(a, b) { return a.postCreated - b.postCreated });
		results.forEach(function(elem){
			elem.comments.sort(function(a, b) { return a.date - b.date });
		});
		res.render('postlist', {posts: results, title: "Posts", curruser: req.cookies.username});
	});
});

app.post('/post/new', function(req, res){
	db.cypher({
		query: 'MATCH (user:User {username: {username}}) CREATE (user)-[:MADE {created: {created}}]->(p:Post {content: {content}, likes: 0})',
		params: {
			username: req.cookies.username,
			created: ((new Date).getTime() / 1000),
			content: req.body.content,
		}
	}, function(err, results){
		if(err) throw err;
		res.send(results);
		res.end();
	});
});

app.post('/posts/:postid/edit', function(req, res){
	db.cypher({
		query: "MATCH (p:Post) WHERE ID(p) = {id} SET p.content = {newcontent}",
		params: {
			id: parseInt(req.params.postid),
			newcontent: req.body.newcontent,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.get('/reviews/', function(req, res){
	db.cypher({
		query: "MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) RETURN u.username AS reviewer, review.title AS title, review.rating AS rating, g.title AS game, g.platform AS platform, review.content AS content, review.snippet AS snippet, ID(review) AS reviewId, u.username = {curruser} AS editable",
		params: {
			curruser: req.cookies.username,
		}
	}, function(err, results){
		res.render('reviewlist', {reviews: results, title: "Reviews", curruser: req.cookies.username});
	});
});

app.get('/reviews/:id/edit', function(req, res){
	db.cypher({
		query: "MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) WHERE ID(review) = " + parseInt(req.params.id) + " RETURN u.username AS reviewer, review.title AS title, review.rating AS rating, g.title AS game, g.platform AS platform, review.content AS content, review.snippet AS snippet, ID(review) AS reviewId",
	}, function(err, results){
		if(err) throw err;
		res.render('editreview', {review: results[0]});
	});
});

app.post('/reviews/:id/edit', function(req, res){
	db.cypher({
		query: "MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) WHERE ID(review) = {reviewId} " + 
		" SET review.title = {title}, review.rating = {rating}, review.content = {content}, review.snippet = {snippet}",
		params: {
			reviewId: parseInt(req.params.id),
			title: req.body.reviewTitle,
			snippet: req.body.reviewSnippet,
			content: req.body.reviewBody,
			rating: req.body.gameRating,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.get('/reviews/new', function(req, res){
	res.render('newreview');
});

app.post('/reviews/new', function(req, res){
	db.cypher({
		query:  "MATCH (u:User), (g:Game) " +
				"WHERE u.username = {curruser} AND g.title = {game} " + 
				"CREATE (u)-[:REVIEWED {title: {title}, rating: {rating}, snippet: {snippet}, content: {content}}]->(g)",
		params: {
			curruser: req.cookies.username,
			title: req.body.reviewTitle,
			rating: req.body.gameRating,
			snippet: req.body.reviewSnippet,
			content: req.body.reviewBody,
			game: req.body.gameTitle,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.post('/reviews/filter', function(req, res){
	var query = "MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) ";
	var searchQuery = "=~ '(?i)" + req.body.query + ".*'";
	if(req.body.platforms){
		req.body.platforms.forEach(function(platform, index){
			if(index == 0)
				query += "WHERE ";
			else
				query += "OR ";
			query += "g.platform =~ '(?i).*" + platform + ".*' "
		});
	}
	if(req.body.query && !req.body.platforms){
		query += "WHERE ";
	}
	else if(req.body.query){
		query += "OR u.username " + searchQuery + " OR review.title " + searchQuery + " OR review.content " + searchQuery + " OR g.title " + searchQuery + " ";
	}
	query += "RETURN u.username AS reviewer, review.title AS title, review.rating AS rating, g.title AS game, g.platform AS platform, review.content AS content, review.snippet AS snippet";
	db.cypher({
		query: query, 
	}, function(err, results){
		res.render('includes/review', {reviews: results});
	});
});

/*		These are the Metacritic scrapers.  Disabled after first use which populated the database.		*/

/*
app.get('/reviews/:platform/scrape', function(req, res){
	var platform = req.params.platform;
	var gameUrls = [];
	unirest.get("https://metacritic-2.p.mashape.com/game-list/" + platform + "/new-releases")
	.header("X-Mashape-Key", "CnzoTLknEBmshl9WtjuLaLzqa5Wzp1oMLunjsnN2uPBnYdWamp")
	.header("Accept", "application/json")
	.end(function(results){
		console.log(results);
		result.body.results.forEach(function(gameObj){
			gameUrls[gameUrls.length] = gameObj.url;
		});
		var trimmedUrls = [gameUrls[0], gameUrls[1]];
		trimmedUrls.forEach(function(gameUrl){
			unirest.get("https://metacritic-2.p.mashape.com/reviews?url=" + gameUrl)
			.header("X-Mashape-Key", "CnzoTLknEBmshl9WtjuLaLzqa5Wzp1oMLunjsnN2uPBnYdWamp")
			.header("Accept", "application/json")
			.end(function(results){

			});
		});
	});
});

app.get('/games/scrape/:platform', function(req, res){
	var platform = req.params.platform;
	console.log("attempting to scrape games for " + platform);
	unirest.get("https://metacritic-2.p.mashape.com/game-list/" + platform + "/new-releases")
	.header("X-Mashape-Key", "CnzoTLknEBmshl9WtjuLaLzqa5Wzp1oMLunjsnN2uPBnYdWamp")
	.header("Accept", "application/json")
	.end(function(results){
		console.log("inputting " + results);
		results.body.results.forEach(function(gameObj){
			query = "CREATE (g:Game {title: \"" + gameObj.name + "\", date: \"" + gameObj.rlsdate + "\", platform: \"" + platform + "\", url: \"" + gameObj.url + "\"";
			if(gameObj.thumbnail){
				query += ", thumbUrl: \"" + gameObj.thumnail + "\"});"
			}
			else{
				query += "});";
			}
			db.cypher({
				query: query,
			}, function(err, results){
				if(err) throw err;
				res.sendStatus(200);
				res.end();
			});
		});
	});
});
*/

app.get('/games/:platform*?/', function(req, res){
	var query = "MATCH (g:Game) " + 
				"OPTIONAL MATCH (u:User {username: \"" + req.cookies.username + "\"})-[owns:OWNS]-(g) ";
	if(req.params.platform){
		query += "WHERE g.platform = " + req.params.platform + " ";
	}
	query += "RETURN g.title AS title, g.platform AS platform, g.url AS url, g.thumb AS thumbnail, g.date AS releaseDate, owns IS NOT NULL as owned ";
	query += "ORDER BY g.title ASC;"
	db.cypher({
		query: query,
	}, function(err, results){
		res.render('games', {games: results, title: "Games", curruser: req.cookies.username});
	});
});

app.post('/games/filter', function(req, res){
	var query = "MATCH (g:Game) ";
	if(req.body.platforms){
		req.body.platforms.forEach(function(platform, index){
			if(index == 0)
				query += "WHERE g.platform = \"" + platform.toLowerCase() + "\" ";
			else
				query += "OR g.platform = \"" + platform.toLowerCase() + "\" ";
		});
	}
	if(req.body.query && !req.body.platforms){
		query += "WHERE g.title =~ '(?i).*" + req.body.query + ".*' ";
	}
	else if(req.body.query){
		query += "AND g.title =~ '(?i).*" + req.body.query + ".*' ";
	}
	query += "OPTIONAL MATCH (u {username: \"" + req.cookies.username + "\"})-[owns:OWNS]-(g) "
	query += "RETURN g.title AS title, g.platform AS platform, g.url AS url, g.thumb AS thumbnail, g.date AS releaseDate, owns IS NOT NULL AS owned ";
	query += "ORDER BY g.title ASC;"
	db.cypher({
		query: query,
	}, function(err, results){
		res.render('includes/gameslist', {games: results});
	});
});

/*
app.post('/games/filter/:title', function(req, res){
	query = "MATCH (g:Game) WHERE g.title =~ '(?i)" + req.params.title + ".*' RETURN g.title AS gameTitle, g.platform AS gamePlatform;"
	db.cypher({
		query: query,
		params: {
			filter: req.params.title,
		}
	}, function(err, results){
		if(err) throw err;
		res.send(results);
		res.end();
	});
});

app.post('/games/filter/', function(req, res){
	var myQuery = "MATCH (g:Game) WHERE g.title =~ '(?i)" + req.body.queryFilter + ".*' return g.title AS title, g.platform AS platform";
	db.cypher({
		query: myQuery,
	}, function(err, results){
		if(err) throw err;
		res.json(results);
		res.end();
	});
});
*/

app.post('/games/own/:title/:platform', function(req, res){
	var query = "MATCH (u:User), (g:Game) " +
				"WHERE u.username = \"" + req.cookies.username + "\" AND g.title = \"" + req.params.title + "\" AND g.platform = \"" + req.params.platform + "\" ";
	if(req.body.adding == "true"){
		query += "CREATE (u)-[:OWNS]->(g)";
	}
	else{
		query += "MATCH (u)-[owns:OWNS]-(g) " +
				"DELETE owns";
	}
	db.cypher({
		query: 	query,
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.get('/profile/:username', function(req, res){
	db.cypher({
		query:  'MATCH (user:User {username: {username}}) ' + 
				'OPTIONAL MATCH (user)-[:OWNS]-(game:Game) ' +
				'RETURN user.username AS username, user.email AS email, collect(game) AS games',
		params: {username: req.params.username},
	}, function(err, results){
		console.log(results[0].games);
		res.render('profile', {userinfo: results[0], title: req.params.username, curruser: req.cookies.username})
	});
});

app.get('/friends/', function(req, res){
	db.cypher({
		query: 'MATCH (user:User {username: {curruser}})-[:FRIEND]-(user2:User) RETURN user2.username AS username',
		params: {
			curruser: req.cookies.username,
		}
	}, function(err, results){
		results.sort(function(a, b) { return a.username - b.username });
		res.render('friendlist', {friendslist: results})
		//res.send(results);
		//res.end();
	});
});

/*
app.post('/filter/', function(req, res){
	var searchQueries = req.body.queryElements;
	var queries = searchQueries;
	searchQueries = searchQueries.join(" ");
	var whereQuery = " WHERE u.username =~ '.*" + queries[0] + "*.' OR post.content =~ '.*" + queries[0] + "*.'";
	queries.shift();
	queries.forEach(function(query){
		whereQuery += " OR u.username =~ '.*" + query + "*.' OR post.content =~ '.*" + query + "*.'";
	});
	db.cypher({
		query: 	'MATCH (u:User)-[made:MADE]-(post:Post)' + ' OPTIONAL MATCH (post)-[:HAS]-(comment:Comment)-[commented:POSTED]-(v:User)' + whereQuery +
				' RETURN u.username AS poster, made.created AS postCreated, post.content AS postContent, ID(post) AS postid, collect(comment.content) AS commentBodies, collect(commented.date) AS commentDates, collect(v.username) AS commentUsernames, collect(comment.likes) AS commentLikes'
	}, function(err, results){
		if(err) throw err;
		parseComments(results);
		res.render('includes/post', {posts: results, query: searchQueries});
	});
});*/


app.post('/post/:postid/comment', function(req, res){
	db.cypher({
		query: 	'MATCH (u:User), (p:Post) ' +
				'WHERE ID(p) = {postid} AND u.username = {commenter} ' +
				'CREATE (u)-[:POSTED {date: {commentDate}}]->(c:Comment {content: {commentBody}})-[:HAS]->(p)',
		params:{
			postid: parseInt(req.params.postid),
			commenter: req.cookies.username,
			commentDate: ((new Date()).getTime() / 1000),
			commentBody: req.body.commentBody,
		}		
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});


app.get('/post/:postid/', function(req, res){
	db.cypher({
		query: 	'match (poster:User)-[datePosted:MADE]-(post:Post) ' +
				'where ID(post) = {postid} ' + 
				'optional match (post)<-[:HAS]-(comment:Comment) ' +
				'with comment, post, poster, datePosted ' + 
				'optional match (comment)-[likes:LIKES]-(liker:User) ' +
				'with comment, count(likes) AS commentLikes, post, poster, collect(liker.username) AS commentLikers, datePosted ' +
				'optional match (post)-[likes:LIKES]-(liker:User) ' +
				'with comment, commentLikes, post, poster, commentLikers, count(likes) AS postLikes, collect(liker.username) AS postLikers, datePosted ' +
				'optional match (comment)-[dateCommented:POSTED]-(commenter:User) ' +
				'return ID(post) AS postid, poster.username = {curruser} AS editable, poster.username AS poster, datePosted.created AS postCreated, post.content AS postContent, postLikes, postLikers, collect({commentContent: comment.content, commenter: commenter.username, date: dateCommented.date, likes: commentLikes, likers: commentLikers, commentid: ID(comment), editable: commenter.username = {curruser}}) AS comments;',		
				params: {
			postid: parseInt(req.params.postid),
			curruser: req.cookies.username,
		}		
	}, function(err, results){
		results.sort(function(a, b) { return b.postCreated - a.postCreated });
		results.forEach(function(elem){
			elem.comments.sort(function(a, b) { return a.date - b.date });
		});
		res.render('includes/post', {post: results[0], curruser: req.cookies.username});
	});
});

app.post('/post/:postid/like', function(req, res){
	db.cypher({
		query: 	'MATCH (p:Post), (u:User) ' +
				'WHERE ID(p) = {postid} AND u.username = {curruser} ' + 
				'CREATE UNIQUE (u)-[:LIKES]->(p) ',
		params:{
			postid: parseInt(req.params.postid),
			curruser: req.cookies.username,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.post('/post/:postid/dislike', function(req, res){
	db.cypher({
		query:  'MATCH (p:Post), (u:User) ' +
				'WHERE ID(p) = {postid} AND u.username = {curruser} ' +
				'MATCH (u)-[likes:LIKES]-(p) ' + 
				'DELETE likes',
		params: {
			postid: parseInt(req.params.postid),
			curruser: req.cookies.username,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.post('/comment/:commentid/like', function(req, res){
	db.cypher({
		query: 	'MATCH (c:Comment), (u:User) ' +
				'WHERE ID(c) = {commentid} AND u.username = {curruser} ' + 
				'CREATE UNIQUE (u)-[:LIKES]->(c) ',
		params:{
			commentid: parseInt(req.params.commentid),
			curruser: req.cookies.username,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.post('/comment/:commentid/dislike', function(req, res){
	db.cypher({
		query:  'MATCH (c:Comment), (u:User) ' +
				'WHERE ID(c) = {commentid} AND u.username = {curruser} ' +
				'MATCH (u)-[likes:LIKES]-(c) ' + 
				'DELETE likes',
		params: {
			commentid: parseInt(req.params.commentid),
			curruser: req.cookies.username,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.get('/post/:postid/likers', function(req, res){
	db.cypher({
		query: 	'MATCH (p:Post) ' +
				'WHERE ID(p) = {postid} ' + 
				'OPTIONAL MATCH (p)<-[:LIKES]-(users:User) ' + 
				'RETURN collect(users.username) AS likers',
		params: {
			postid: parseInt(req.params.postid),
		}
	}, function(err, results){
		if(results[0].likers.length != 0)
			res.render('liker-list', {likers: results[0].likers});
		else{
			res.send();
			res.end();
		}
	});
});

app.get('/comment/:commentid/likers', function(req, res){
	db.cypher({
		query: 	'MATCH (c:Comment) ' +
				'WHERE ID(c) = {commentid} ' + 
				'OPTIONAL MATCH (c)-[:LIKES]-(users:User) ' + 
				'RETURN collect(users.username) AS likers',
		params: {
			commentid: parseInt(req.params.commentid),
		}, 
	}, function(err, results){
		if(results[0].likers.length != 0)
			res.render('liker-list', {likers: results[0].likers});
		else{
			res.send();
			res.end();
		}
	});
});

app.post('/comments/:commentid/edit', function(req, res){
	db.cypher({
		query: "MATCH (c:Comment) WHERE ID(c) = {id} SET c.content = {newcontent}",
		params: {
			id: parseInt(req.params.commentid),
			newcontent: req.body.newcontent,
		}
	}, function(err, results){
		if(err) throw err;
		res.sendStatus(200);
		res.end();
	});
});

app.listen(3000);