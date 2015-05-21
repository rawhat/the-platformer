var express = require('express')
 ,  jade = require('jade')
 ,	neo4j = require('neo4j')
 ,	bodyParser = require('body-parser')
 ,	cookieParser = require('cookie-parser');

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
		query: 	'MATCH (p:User)-[posted:MADE]-(post:Post) ' +
				'OPTIONAL MATCH (post)-[:HAS]-(comment:Comment)-[commented:POSTED]-(u:User) ' +
				'RETURN p.username AS poster, posted.created AS postCreated, post.content AS postContent, ID(post) AS postid, post.likes AS postLikes, collect(comment.content) AS commentBodies, collect(commented.date) AS commentDates, collect(u.username) AS commentUsernames, collect(comment.likes) AS commentLikes'
	}, function(err, results){
		if(err){
			console.log(err);
			throw err;
		}
		parseComments(results);
		results.sort(function(a, b) { return b.postCreated - a.postCreated });
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
		query: 'MATCH (user:User {username: {curruser}})-[:FRIEND]-(user2:User) RETURN user2.username AS friendname',
		params: {
			curruser: "test"//req.params.curruser
		}
	}, function(err, results){
		//res.render('friendlist', {friends: results})
		res.send(results);
		res.end();
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
				'CREATE (u)-[:POSTED {date: {commentDate}}]->(c:Comment {content: {commentBody}, likes: 0})-[:HAS]->(p)',
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
		query: 	'MATCH (p:User)-[posted:MADE]-(post:Post) ' +
				'WHERE ID(post) = {postid} ' +
				'OPTIONAL MATCH (post)-[:HAS]-(comment:Comment)-[commented:POSTED]-(u:User) ' +
				'RETURN p.username AS poster, posted.created AS postCreated, post.content AS postContent, ID(post) AS postid, collect(comment.content) AS commentBodies, collect(commented.date) AS commentDates, collect(u.username) AS commentUsernames, collect(comment.likes) AS commentLikes',
		params: {
			postid: parseInt(req.params.postid),
		}		
	}, function(err, results){
		parseComments(results);
		res.render('includes/post', {posts: results});
	});
});

app.post('/post/:postid/like', function(req, res){
	db.cypher({
		query: 	'MATCH (p:Post), (u:User) ' +
				'WHERE ID(p) = {postid} AND u.username = {curruser} ' + 
				''
	}, function(err, results){

	});
});

function parseComments(resultSet){
	resultSet.forEach(function(elem){
			elem.comments = []
			if(elem.commentUsernames.length > 0){
				elem.commentUsernames.forEach(function(ele, index){
					elem.comments[index] = {
						commenter: elem.commentUsernames[index],
						commentDate: elem.commentDates[index],
						commentBodies: elem.commentBodies[index],
						commentLikes: elem.commentLikes[index],
					}
				});
				elem.comments.sort(function(a, b){ return a.commentDate - b.commentDate });
			}
			delete elem.commentUsernames;
			delete elem.commentBodies;
			delete elem.commentDates;
			delete elem.commentLikes;
	});
}

app.listen(3000);