import express from 'express'
import session from 'express-session'
import neo4jDriver from 'neo4j-driver'
import pagedown from 'pagedown'

import { postRouter } from './router/posts.mjs';
import { isAuthenticated, userRouter } from './router/user.mjs';

const neo4j = neo4jDriver.v1

const db = neo4j.driver("bolt://db", neo4j.auth.basic("neo4j", "Password12"))

const app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static('./public'));
app.use(express.json());
app.use(session({
  secret: process.env.SECRET || 'thisisatestvalue'
}));

app.use(userRouter);

app.get('/create/', (req, res) => {
	res.render('newuser.jade', {title: "New user"});
});

//app.get('/*', function(req, res, next){
	//if(!req.session.username) {
    //console.log('no session username')
		////res.render('index', {title : 'Platformer'});
    //res.redirect('/');
  //} else {
		//return next();
  //}
//});

app.use(postRouter);

app.get('/', (req, res, ) => {
	//if(req.session.username) {
		//res.redirect('/posts/');
    //next();
  //} else {
  res.render('index', {title : 'Platformer'})
  //}
});

app.post('/posts/new', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User {username: {username}}) CREATE (user)-[:MADE {created: {created}}]->(p:Post {content: {content}})',
		{ username: req.session.username, created: ((new Date).getTime() / 1000), content: req.body.content, }
  ).then(({records: results}) => {
		res.send({records: results});
		res.end();
  })
  .catch((err) => {
    throw err;
  });
});

app.post('/posts/:postid/edit', function(req, res){
  var session = db.session()
	session.run(
		"MATCH (p:Post) WHERE ID(p) = {id} SET p.content = {newcontent}",
		{ id: parseInt(req.params.postid), newcontent: req.body.newcontent,	}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.get('/reviews/', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) RETURN u.username AS reviewer, review.title AS title, review.rating AS rating, g.title AS game, g.platform AS platform, review.content AS content, review.snippet AS snippet, ID(review) AS reviewId, u.username = {curruser} AS editable",
    {curruser: req.session.username, }
  ).then(({records: results}) => {
		var converter = new pagedown.Converter();
		//var safeConverter = pagedown.getSantizingConverter();
		results.forEach(function(elem){
			elem.content = converter.makeHtml(elem.content);
		});
		res.render('reviewlist', {reviews: results, title: "Reviews", curruser: req.session.username});
	});
});

app.get('/reviews/:id/edit', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) WHERE ID(review) = " + parseInt(req.params.id) + " RETURN u.username AS reviewer, review.title AS title, review.rating AS rating, g.title AS game, g.platform AS platform, review.content AS content, review.snippet AS snippet, ID(review) AS reviewId",
  ).then(({records: results}) => {
		res.render('editreview', {review: results[0]});
  })
  .catch((err) => { throw err; });
});

app.post('/reviews/:id/edit', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) WHERE ID(review) = {reviewId} " + 
		" SET review.title = {title}, review.rating = {rating}, review.content = {content}, review.snippet = {snippet}",
		{ reviewId: parseInt(req.params.id), title: req.body.reviewTitle,	snippet: req.body.reviewSnippet, content: req.body.reviewBody, rating: req.body.gameRating,	}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/reviews/:id/delete', function(req, res){
  var session = db.session();
	session.run(
		"MATCH ()-[reviewed:REVIEWED]-() WHERE id(reviewed) = {id} DELETE reviewed",
		{
			id: parseInt(req.params.id),
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err;})
});

app.get('/reviews/new', function(req, res){
	res.render('newreview', {title: "New Review", curruser: req.session.username});
});

app.post('/reviews/new', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (u:User), (g:Game) " +
	  "WHERE u.username = {curruser} AND g.title = {game} AND g.platform = {platform} " + 
	  "CREATE (u)-[:REVIEWED {title: {title}, rating: {rating}, snippet: {snippet}, content: {content}}]->(g)",
		{
			curruser: req.session.username,
			title: req.body.reviewTitle,
			platform: req.body.platform,
			rating: req.body.gameRating,
			snippet: req.body.reviewSnippet,
			content: req.body.reviewBody,
			game: req.body.gameTitle,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/reviews/filter', function(req, res){
	var query = "MATCH (u:User), (g:Game) MATCH (u)-[review:REVIEWED]-(g) ";
	var searchQuery = "=~ '(?i).*" + req.body.query + ".*'";
	var hasWhere = false;
	if(req.body.platforms){
		req.body.platforms.forEach(function(platform, index){
			if(index == 0){
				query += "WHERE ";
				hasWhere = true;
			}
			else
				query += "OR ";
			query += "g.platform =~ '(?i).*" + platform.toLowerCase() + ".*' "
		});
	}
	if(req.body.query){
		if(!hasWhere){
			query += "WHERE ";
		}
		else{
			query += "OR ";
		}

		query += "u.username " + searchQuery + " OR review.title " + searchQuery + " OR review.content " + searchQuery + " OR g.title " + searchQuery + " ";
	}
	query += "RETURN u.username AS reviewer, review.title AS title, review.rating AS rating, g.title AS game, g.platform AS platform, review.content AS content, review.snippet AS snippet";
  var session = db.session();
	session.run(query).then(({records: results}) => {
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
	.end(function({records: results}){
		console.log({records: results});
		result.body.results.forEach(function(gameObj){
			gameUrls[gameUrls.length] = gameObj.url;
		});
		var trimmedUrls = [gameUrls[0], gameUrls[1]];
		trimmedUrls.forEach(function(gameUrl){
			unirest.get("https://metacritic-2.p.mashape.com/reviews?url=" + gameUrl)
			.header("X-Mashape-Key", "CnzoTLknEBmshl9WtjuLaLzqa5Wzp1oMLunjsnN2uPBnYdWamp")
			.header("Accept", "application/json")
			.end(function({records: results}){

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
	.end(function({records: results}){
		console.log("inputting " + results);
		results.body.results.forEach(function(gameObj){
			query = "CREATE (g:Game {title: \"" + gameObj.name + "\", date: \"" + gameObj.rlsdate + "\", platform: \"" + platform + "\", url: \"" + gameObj.url + "\"";
			if(gameObj.thumbnail){
				query += ", thumbUrl: \"" + gameObj.thumnail + "\"});"
			}
			else{
				query += "});";
			}
			session.run({
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
				"OPTIONAL MATCH (u:User {username: \"" + req.session.username + "\"})-[owns:OWNS]-(g) ";
	if(req.params.platform){
		query += "WHERE g.platform = " + req.params.platform + " ";
	}
	query += "RETURN g.title AS title, g.platform AS platform, g.url AS url, g.thumb AS thumbnail, g.date AS releaseDate, owns IS NOT NULL as owned ";
	query += "ORDER BY g.title ASC;"
  var session = db.session();
  session.run(query).then(({records: results}) => {
		res.render('games', {games: results, title: "Games", curruser: req.session.username});
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
	query += "OPTIONAL MATCH (u {username: \"" + req.session.username + "\"})-[owns:OWNS]-(g) "
	query += "RETURN g.title AS title, g.platform AS platform, g.url AS url, g.thumb AS thumbnail, g.date AS releaseDate, owns IS NOT NULL AS owned ";
	query += "ORDER BY g.title ASC;"
  var session = db.session();
  session.run(query).then(({records: results}) => {
		res.render('includes/gameslist', {games: results});
	});
});

/*
app.post('/games/filter/:title', function(req, res){
	query = "MATCH (g:Game) WHERE g.title =~ '(?i)" + req.params.title + ".*' RETURN g.title AS gameTitle, g.platform AS gamePlatform;"
	session.run({
		query: query,
		params: {
			filter: req.params.title,
		}
	}, function(err, results){
		if(err) throw err;
		res.send({records: results});
		res.end();
	});
});
*/

app.post('/games/filter/:query', function(req, res){
  var session = db.session();
	var myQuery = "MATCH (g:Game) WHERE g.title =~ '(?i)" + req.params.query + ".*' return g.title AS title, g.platform AS platform";
  session.run(myQuery).then(({records: results}) => {
		res.send({records: results});
		res.end();
  })
  .catch((err) => { throw err; });
});


app.post('/games/own/:title/:platform', function(req, res){
	var query = "MATCH (u:User), (g:Game) " +
				"WHERE u.username = \"" + req.session.username + "\" AND g.title = \"" + req.params.title + "\" AND g.platform = \"" + req.params.platform + "\" ";
	if(req.body.adding == "true"){
		query += "CREATE (u)-[:OWNS]->(g)";
	}
	else{
		query += "MATCH (u)-[owns:OWNS]-(g) " +
				"DELETE owns";
	}
  var session = db.session();
  session.run(query).then(() => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.get('/profile/:username', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User {username: {username}}) ' +
    'OPTIONAL MATCH (user)-[:OWNS]-(game:Game) ' +
    'OPTIONAL MATCH (user)-[:FRIEND]-(user2:User) ' +
	  'RETURN user.username AS username, user.email AS email, user.twitchid AS twitchid, collect(game) AS games, collect(user2.username) AS friends',
		{username: req.params.username},
  ).then(({records: results}) => {
		res.render('profile', {userinfo: results[0], title: req.params.username, curruser: req.session.username})
	});
});

app.get('/profile/:username/edit', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User {username: {username}}) ' +
		'OPTIONAL MATCH (user)-[:OWNS]-(game:Game) ' +
		'RETURN user.username AS username, user.email AS email, user.password AS password, user.twitchid AS twitchid, collect(game) AS games',
		{username: req.params.username},
  ).then(({records: results}) => {
		res.render('editprofile', {userinfo: results[0], title: req.params.username, curruser: req.session.username})
	});
});

app.post('/profile/:username/edit', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User {username: {username}}) ' +
	  'SET user.email = {email}, user.password = {password}, user.twitchid = {twitchid}',
		{
			username: req.params.username,
			email: req.body.email,
			password: req.body.pass,
			twitchid: req.body.twitchid,
		}
  ).then(({records: results}) => {
		res.sendStatus(200).end();
  })
  .catch((err) => { throw err; });
});

app.get('/friends/', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User {username: {curruser}})-[:FRIEND]-(user2:User) RETURN user2.username AS username',
		{
			curruser: req.session.username,
		}
  ).then(({records: results}) => {
		results.sort(function(a, b) { return a.username - b.username });
		res.render('friendlist', {friendslist: results})
		//res.send({records: results});
		//res.end();
	});
});

app.post('/friends/add', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User), (user2:User) ' +
		'WHERE user.username = {curruser} AND user2.username = {friendname} ' +
		'CREATE UNIQUE (user)-[:FRIEND]->(user2)',
		{
			curruser: req.session.username,
			friendname: req.body.friendname,
		}
  ).then(({records: results}) => {
		res.sendStatus(200).end();
  })
  .catch((err) => { throw err; });
});

app.post('/friends/remove', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (user:User), (user2:User) ' +
		'WHERE user.username = {curruser} AND user2.username = {friendname} ' +
		'MATCH (user)-[friends:FRIEND]-(user2) ' +
		'DELETE friends',
		{
			curruser: req.session.username,
			friendname: req.body.friendname,
		}
  ).then(({records: results}) => {
		res.sendStatus(200).end();
  })
  .catch((err) => { throw err; });
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
	session.run({
		query: 	'MATCH (u:User)-[made:MADE]-(post:Post)' + ' OPTIONAL MATCH (post)-[:HAS]-(comment:Comment)-[commented:POSTED]-(v:User)' + whereQuery +
				' RETURN u.username AS poster, made.created AS postCreated, post.content AS postContent, ID(post) AS postid, collect(comment.content) AS commentBodies, collect(commented.date) AS commentDates, collect(v.username) AS commentUsernames, collect(comment.likes) AS commentLikes'
	}, function(err, results){
		if(err) throw err;
		parseComments({records: results});
		res.render('includes/post', {posts: results, query: searchQueries});
	});
});*/


app.post('/post/:postid/comment', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (u:User), (p:Post) ' +
		'WHERE ID(p) = {postid} AND u.username = {commenter} ' +
		'CREATE (u)-[:POSTED {date: {commentDate}}]->(c:Comment {content: {commentBody}})-[:HAS]->(p)',
		{
			postid: parseInt(req.params.postid),
			commenter: req.session.username,
			commentDate: ((new Date()).getTime() / 1000),
			commentBody: req.body.commentBody,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});


app.get('/post/:postid/', function(req, res){
  var session = db.session();
	session.run(
		'match (poster:User)-[datePosted:MADE]-(post:Post) ' +
		'where ID(post) = {postid} ' +
		'optional match (post)<-[:HAS]-(comment:Comment) ' +
		'with comment, post, poster, datePosted ' +
		'optional match (comment)-[likes:LIKES]-(liker:User) ' +
		'with comment, count(likes) AS commentLikes, post, poster, collect(liker.username) AS commentLikers, datePosted ' +
		'optional match (post)-[likes:LIKES]-(liker:User) ' +
		'with comment, commentLikes, post, poster, commentLikers, count(likes) AS postLikes, collect(liker.username) AS postLikers, datePosted ' +
		'optional match (comment)-[dateCommented:POSTED]-(commenter:User) ' +
		'return ID(post) AS postid, poster.username = {curruser} AS editable, poster.username AS poster, datePosted.created AS postCreated, post.content AS postContent, postLikes, postLikers, collect({commentContent: comment.content, commenter: commenter.username, date: dateCommented.date, likes: commentLikes, likers: commentLikers, commentid: ID(comment), editable: commenter.username = {curruser}}) AS comments;',
		{
			postid: parseInt(req.params.postid),
			curruser: req.session.username,
		}
  ).then(({records: results}) => {
		results.sort(function(a, b) { return b.postCreated - a.postCreated });
		results.forEach(function(elem){
			elem.comments.sort(function(a, b) { return a.date - b.date });
		});
		res.render('includes/post', {post: results[0], curruser: req.session.username});
	});
});

app.post('/post/:postid/like', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (p:Post), (u:User) ' +
		'WHERE ID(p) = {postid} AND u.username = {curruser} ' +
		'CREATE UNIQUE (u)-[:LIKES]->(p) ',
		{
			postid: parseInt(req.params.postid),
			curruser: req.session.username,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/post/:postid/dislike', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (p:Post), (u:User) ' +
		'WHERE ID(p) = {postid} AND u.username = {curruser} ' +
		'MATCH (u)-[likes:LIKES]-(p) ' +
		'DELETE likes',
		{
			postid: parseInt(req.params.postid),
			curruser: req.session.username,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/comment/:commentid/like', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (c:Comment), (u:User) ' +
		'WHERE ID(c) = {commentid} AND u.username = {curruser} ' +
		'CREATE UNIQUE (u)-[:LIKES]->(c) ',
		{
			commentid: parseInt(req.params.commentid),
			curruser: req.session.username,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/comment/:commentid/dislike', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (c:Comment), (u:User) ' +
		'WHERE ID(c) = {commentid} AND u.username = {curruser} ' +
		'MATCH (u)-[likes:LIKES]-(c) ' +
		'DELETE likes',
		{
			commentid: parseInt(req.params.commentid),
			curruser: req.session.username,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.get('/post/:postid/likers', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (p:Post) ' +
		'WHERE ID(p) = {postid} ' +
		'OPTIONAL MATCH (p)<-[:LIKES]-(users:User) ' +
		'RETURN collect(users.username) AS likers',
		{
			postid: parseInt(req.params.postid),
		}
  ).then(({records: results}) => {
		if(results[0].likers.length != 0)
			res.render('liker-list', {likers: results[0].likers});
		else{
			res.send();
			res.end();
		}
	});
});

app.get('/comment/:commentid/likers', function(req, res){
  var session = db.session();
	session.run(
		'MATCH (c:Comment) ' +
		'WHERE ID(c) = {commentid} ' +
		'OPTIONAL MATCH (c)-[:LIKES]-(users:User) ' +
		'RETURN collect(users.username) AS likers',
		{
			commentid: parseInt(req.params.commentid),
		},
  ).then(({records: results}) => {
		if(results[0].likers.length != 0)
			res.render('liker-list', {likers: results[0].likers});
		else{
			res.send();
			res.end();
		}
	});
});

app.post('/comments/:commentid/edit', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (c:Comment) WHERE ID(c) = {id} SET c.content = {newcontent}",
		{
			id: parseInt(req.params.commentid),
			newcontent: req.body.newcontent,
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/comments/:commentid/delete', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (c:Comment) WHERE ID(c) = {id} " +
		"MATCH ()-[r]-(c) " +
		"DELETE c, r",
		{
			id: parseInt(req.params.commentid),
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

app.post('/posts/:postid/delete', function(req, res){
  var session = db.session();
	session.run(
		"MATCH (p:Post) WHERE ID(p) = {postid} " +
		"OPTIONAL MATCH (c:Comment)-[:HAS]-(p) with c, p " +
		"OPTIONAL MATCH (c)-[r]-() WITH c, r, p " +
		"OPTIONAL MATCH ()-[l]-(p) WITH c, r, p, l " +
		"DELETE c, r, p, l",
		{
			postid: parseInt(req.params.postid),
		}
  ).then(({records: results}) => {
		res.sendStatus(200);
		res.end();
  })
  .catch((err) => { throw err; });
});

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, HOST);
console.log("Now listening at...", PORT);
