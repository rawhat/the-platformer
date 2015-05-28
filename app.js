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

app.get('/', function(req, res){
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
				'return ID(post) AS postid, poster.username AS poster, datePosted.created AS postCreated, post.content AS postContent, postLikes, postLikers, collect({commentContent: comment.content, commenter: commenter.username, date: dateCommented.date, likes: commentLikes, likers: commentLikers, commentid: ID(comment)}) AS comments;',
		}, function(err, results){
		if(err){
			console.log(err);
			throw err;
		}
		results.sort(function(a, b) { return a.postCreated - b.postCreated });
		results.forEach(function(elem){
			elem.comments.sort(function(a, b) { return a.date - b.date });
		});
		res.render('postlist', {posts: results});
	});
});

app.post('/post/new', function(req, res){
	db.cypher({
		query: 'MATCH (user:User {username: {username}}) CREATE (user)-[:MADE {created: {created}}]->(p:Post {content: {content}, likes: 0})',
		params: {
			username: req.body.curruser,
			created: ((new Date).getTime() / 1000),
			content: req.body.content,
		}
	}, function(err, results){
		if(err) throw err;
		res.send(results);
		res.end();
	});
});

app.get('/reviews/:platform*?', function(req, res){
	if(req.params.platform){

	}
	db.cypher({
	}, function(err, results){

	});
});

app.post('/reviews/new', function(req, res){
	db.cypher({

	}, function(err, results){

	});
});

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

app.get('/games/:platform*?/', function(req, res){
	var query = "MATCH (g:Game) ";
	if(req.params.platform){
		query += "WHERE g.platform = " + req.params.platform + " ";
	}
	query += "RETURN g";
	db.cypher({
		query: query,
	}, function(err, results){
		res.render('gameslist', {games: results});
	});
});

app.get('/games/:platform/scrape', function(req, res){
	var platform = req.params.platform;
	unirest.get("https://metacritic-2.p.mashape.com/game-list/" + platform + "/new-releases")
	.header("X-Mashape-Key", "CnzoTLknEBmshl9WtjuLaLzqa5Wzp1oMLunjsnN2uPBnYdWamp")
	.header("Accept", "application/json")
	.end(function(results){
		results.body.results.forEach(function(gameObj){
			db.cypher({
				query: "CREATE (g:Game {title: {title}, date: {releaseDate}, platform: {platform}, url: {url}})", // thumbUrl: {thumb}});",
				params: {
					title: gameObj.name,
					releaseDate: gameObj.rlsdate,
					platform: platform,
					url: gameObj.url,
					//thumb: gameObj.thumbnail,
				},
			}, function(err, results){
				if(err) throw err;
			});
		});
		res.sendStatus(200);
		res.end();
	});
});

app.get('/profile/:username', function(req, res){
	db.cypher({
		query: 'MATCH (user:User {username: {username}}) RETURN user.username AS username, user.email AS email',
		params: {username: req.params.username},
	}, function(err, results){
		res.render('profile', {userinfo: results[0]})
	});
});

app.post('/friends/', function(req, res){
	db.cypher({
		query: 'MATCH (user:User {username: {curruser}})-[:FRIEND]-(user2:User) RETURN user2.username AS username',
		params: {
			curruser: req.body.curruser,
		}
	}, function(err, results){
		results.sort(function(a, b) { return a.username - b.username });
		res.render('friendlist', {friendlist: results})
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
			commenter: req.body.commenter,
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
				'return ID(post) AS postid, poster.username AS poster, datePosted.created AS postCreated, post.content AS postContent, postLikes, postLikers, collect({commentContent: comment.content, commenter: commenter.username, date: dateCommented.date, likes: commentLikes, likers: commentLikers, commentid: ID(comment)}) AS comments;',		params: {
			postid: parseInt(req.params.postid),
		}		
	}, function(err, results){
		results.sort(function(a, b) { return b.postCreated - a.postCreated });
		results.forEach(function(elem){
			elem.comments.sort(function(a, b) { return a.date - b.date });
		});
		res.render('includes/post', {posts: results});
	});
});

app.post('/post/:postid/like', function(req, res){
	db.cypher({
		query: 	'MATCH (p:Post), (u:User) ' +
				'WHERE ID(p) = {postid} AND u.username = {curruser} ' + 
				'CREATE (u)-[:LIKES]->(p) ' + 
				'OPTIONAL MATCH (p)-[likes:LIKES]-() ' +
				'RETURN count(likes) AS postLikes',
		params:{
			postid: req.params.postid,
			curruser: "test",
		}
	}, function(err, results){
		res.send(results);
		res.end();
	});
});

app.get('/post/:postid/likers', function(req, res){
	db.cypher({
		query: 	'MATCH (p:Post) ' +
				'WHERE ID(p) = {postid} ' + 
				'OPTIONAL MATCH (p)-[:LIKES]-(users:User) ' + 
				'RETURN collect(users.username) AS likers',
		params: {
			postid: req.params.postid,
		}
	}, function(err, results){
		res.render('liker-list', {likers: results});
	});
});

app.get('/comment/:commentid/likers', function(req, res){
	db.cypher({
		query: 	'MATCH (p:Post) ' +
				'WHERE ID(p) = {commentid} ' + 
				'OPTIONAL MATCH (p)-[:LIKES]-(users:User) ' + 
				'RETURN collect(users.username) AS likers',
		params: {
			commentid: req.params.commentid,
		}, 
	}, function(err, results){
		res.render('liker-list', {likers: results});
	});
});

app.listen(3000);