/**
 * Module dependencies.
 */
var express = require('express'),
    Resource = require('express-resource'),
    routes = require('./routes'),
    everyauth = require('everyauth'),
    conf = require('./conf');

var Nohm = require('nohm').Nohm;
var BoardModel = require(__dirname + '/BoardModel.js');
var ShapesModel = require(__dirname + '/ShapesModel.js');
var UserModel = require(__dirname + '/UserModel.js');
var redis = require("redis"),
    redisClient = redis.createClient(); //go thru redis readme for anyother config other than default: localhost 6379
redisClient.select(4);
Nohm.setPrefix('matisse'); //setting up app prefix for redis
Nohm.setClient(redisClient);

//-------------------- EveryAuth START---------------------------------//
var usersById = {};
var nextUserId = 0;
var usersByTwitId = {};
var userInfo = {};
everyauth.twitter.consumerKey(conf.twit.consumerKey).consumerSecret(conf.twit.consumerSecret).findOrCreateUser(function (sess, accessToken, accessSecret, twitUser) {
    var userDetails = usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    userInfo = userDetails;

    var data = {
        userID: "twitter-" + userDetails.twitter.id
    };
    var newUser = new UserModel();
    newUser.store(data, function (err) {
        if (!err) console.log("saved to DB");
        else console.log("Couldnot Save to DB");
    });

    UserModel.find(function (err, ids) {
        if (err) {
            console.log(err);
        }
        var len = ids.length;
        var count = 0;
        if (len === 0) {
            console.log("no keys found");
        } else {
            console.log("found: " + ids);

            ids.forEach(function (id) {
                var twitUser = new UserModel();
                twitUser.load(id, function (err, props) {
                    if (err) {
                        return next(err);
                    }
                    console.log("value: " + props.userID);
                });
            });
        }
    });

    return userDetails;
}).redirectPath('/');

function addUser(source, sourceUser) {
    var user;
    if (arguments.length === 1) { // password-based
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
    } else { // non-password-based
        user = usersById[++nextUserId] = {
            id: nextUserId
        };
        user[source] = sourceUser;
    }
    return user;
}

everyauth.debug = true;

//-------------------- EveryAuth END---------------------------------//
//logging
Nohm.logError = function (err) {
    console.log("===============");
    console.log(err);
    console.log("===============");
};

redisClient.on("error", function (err) {
    console.log("Error %s", err);
});

var app = module.exports = express.createServer(),
    io = require('socket.io').listen(app);


// Configuration
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'foobar'
    }));
    app.use(express.bodyParser());
    app.use(everyauth.middleware());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    everyauth.helpExpress(app);
});

app.configure('development', function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/favicon', function (req, res, next) {

});

app.get('/boards', function (req, res, next) {
    var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    var data = {
        url: randomstring
    };
    var whiteBoard = new BoardModel();
    whiteBoard.store(data, function (err) {
        if (err === 'invalid') {
            next(whiteBoard.errors);
        } else if (err) {
            next(err);
        } else {
            res.writeHead(302, {
                'Location': randomstring
            });
            res.end();
            //res.json({result: 'success', data: whiteBoard.allProperties()});
            //       		res.sendfile(__dirname + '/index.html');
        }
    });
});

app.resource('api', {
    index: function (req, res, next) {

        ShapesModel.find(function (err, ids) {
            if (err) {
                return next(err);
            }
            var shapes = [];
            var len = ids.length;
            var count = 0;
            if (len === 0) {
                return res.json(shapes);
            }
            //console.log(ids);
            ids.forEach(function (id) {
                var shape = new ShapesModel();
                shape.load(id, function (err, props) {
                    if (err) {
                        return next(err);
                    }
                    shapes.push({
                        id: this.id,
                        palette: props.palette,
                        action: props.action,
                        args: props.args,
                        board_url: props.board_url
                    });
                    if (++count === len) {
                        res.json(shapes);
                    }
                });
            });
        });
    }
});
app.resource('boards', {
    show: function (req, res, next) {
        if (req.params.id != "favicon") {
            res.sendfile(__dirname + '/board.html');
        }
    }
});


app.use(function (err, req, res, next) {
    if (err instanceof Error) {
        err = err.message;
    }
    res.json({
        result: 'error',
        data: err
    });
});

app.listen(8000);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
io.sockets.on('connection', function (socket) {
    socket.emit('eventConnect', {
        message: 'welcome'
    });
    socket.emit('userInfo', userInfo);
    socket.on("setUrl", function (location, data) {
        var wb_url = location.replace("/", "");
        var randomnString = wb_url.substr(wb_url.indexOf('/') + 1);
        socket.join(wb_url);

        BoardModel.find(function (err, ids) {
            if (err) {
                console.log(err);
            } else {
                ids.forEach(function (id) {
                    var board = new BoardModel();
                    board.load(id, function (err, props) {
                        if (err) {
                            return next(err);
                        } else {
                            console.log("##" + props + " - " + props.url + " - " + props.container);
                            if (props.url == randomnString) {
                                console.log("::: " + props.container);
                                if (props.container == undefined || props.container == "") {
                                    socket.emit('containerDraw', "empty");
                                    console.log(":::: EMPTY");
                                } else {
                                    socket.emit('containerDraw', props.container);
                                    console.log(":::: not EMPTY: " + props.container);
                                }
                            }
                        }
                    });
                });
            }
        });


        ShapesModel.find({
            board_url: wb_url
        }, function (err, ids) {
            if (err) {
                console.log(err);
            }
            var boards = [];
            var len = ids.length;
            var count = 0;
            if (len === 0) {} else {
                ids.forEach(function (id) {
                    var board = new ShapesModel();
                    board.load(id, function (err, props) {
                        if (err) {
                            return next(err);
                        }
                        boards.push({
                            id: this.id,
                            palette: props.palette,
                            action: props.action,
                            args: props.args
                        });

                        if (++count === len) {
                            //socket.emit('eventDraw',boards);
                        }
                        socket.emit('eventDraw', eval({
                            palette: props.palette,
                            action: props.action,
                            args: [props.args]
                        }));

                    });
                });
            }
        });
    });

    socket.on("setContainer", function (location, data) {
        var wb_url = location.replace("/", "");
        console.log("got container:" + wb_url + " - " + data.containerName);
        var randomnString = wb_url.substr(wb_url.indexOf('/') + 1);

        BoardModel.find(function (err, ids) {
            if (err) {
                console.log(err);
            } else {
                ids.forEach(function (id) {
                    var board = new BoardModel();
                    board.load(id, function (err, props) {
                        if (err) {
                            return next(err);
                        } else {
                            console.log("##" + props + " - " + props.url + " - " + props.container);
                            if (props.url == randomnString) {
                                console.log("updating");
                                props.container = data.containerName;

                                board.store(props, function (err) {
                                    //console.log("***** Error in URL:"+url+" Err:"+err);
                                });
                            }
                        }
                    });
                });
            }
        });
    });

    socket.on('eventDraw', function (location, data) {
        console.log(data);
        var url = location.replace("/", "");
        ko = new Date();
        ji = ko.getTime();

        if (data.action != "clearText") {
            var newShape = new ShapesModel();
            socket.broadcast.to(url).emit('eventDraw', data);
            data.args = data.args[0];
            data.shapeId = data.args.uid;
            data.board_url = url;

            if (data.action == "modified" || data.action == "zindexchange") {
                data.args = data.args.object;
                ShapesModel.find({
                    shapeId: data.shapeId
                }, function (err, id) {
                    if (err) {
                        console.log(err);
                    }
                    var shape = new ShapesModel();
                    shape.load(id, function (err, props) {
                        if (err) {
                            //return next(err);
                        }

                        data.args.name = props.args.name;
                        data.args.uid = props.shapeId;
                        data.args.palette = props.palette;
                        data.palette = props.palette;
                        data.action = props.action;
                        shape.store(data, function (err) {
                            //console.log("***** Error in URL:"+url+" Err:"+err);
                        });
                        socket.broadcast.to(url).emit('eventDraw', shape);
                    });
                });
            } else if (data.action == "delete") {
                ShapesModel.find({
                    shapeId: data.shapeId
                }, function (err, id) {
                    if (err) {
                        console.log(err);
                    }
                    var shape = new ShapesModel();
                    shape.load(id, function (err, props) {
                        if (err) {
                            //return next(err);
                        }

                        shape.delete(data, function (err) {
                            console.log("***** Error while deleting ID:" + id + " errr:" + err);
                        });

                    });
                });

            } else {
                newShape.store(data, function (err) {});
                socket.broadcast.to(url).emit('eventDraw', newShape);
            }
        }
    });

});
