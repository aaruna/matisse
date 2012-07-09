var nohm = require(__dirname+'/../node_modules/nohm/lib/nohm.js').Nohm;

/**
 * Model definition of a User
 */
var userModel = module.exports = nohm.model('User', {
    idGenerator: 'increment',
    properties: {
	userID: {
	    type: 'string',
	    unique: true,
	    index: true,
	    validations: [
		'notEmpty'
	    ]
	}
    },
    methods: {
	// custom methods we define here to make handling this model easier.
      
	/**
	 * You can specify a data array that might come from the user and an array containing the fields that should be used from used from the data.
	 * Optionally you can specify a function that gets called on every field/data pair to do a dynamic check if the data should be included.
	 * The principle of this might make it into core nohm at some point.
	 */
	fill: function (data, fields) {
	    var props = {},
            self = this;
	    
	    fields = Array.isArray(fields) ? fields : Object.keys(data);
	  
	    fields.forEach(function (i) {
		props[i] = data[i];
	    });
	    
	    this.p(props);
	    return props;
	},
	

	/**
	 * This is a wrapper around fill and save.
	 */
	store: function (data, callback) {
	    var self = this;
	    
	    this.fill(data);
	    this.save(function () {
		callback.apply(self, Array.prototype.slice.call(arguments, 0));
	    });
	},
	getUserID: function(session_data) {
	  var userID;
	    if (typeof(session_data.twitter) != "undefined") {
		userID = "twitter- " + session_data.twitter.user.id;
	    }
	    else if (session_data.facebook) {
		userID = "facebook- " + session_data.facebook.user.id;
	    }
	    else if (session_data.google) {
		userID = "google- " + session_data.google.user.id;
	    }
	    return userID;
	},
	linkBoard: function(whiteBoard, dbUserID) {
	    this.find({userID:dbUserID}, function(err,ids) {
		if (err){
		}
		else{
		    this.load(ids[0], function (err, props) {
			if (err) {
			    return err;
			} else {                         
			    
			    console.log(":::" + props);
			}
			whiteBoard.load(whiteBoard.id, function(id) {
			});
			this.link(whiteBoard, 'ownedBoard');
			this.save(function(err) {
			    if (err) {
				console.log(err);
			    }
			    else {
				console.log("relation is saved");
			    }				    
			});
		    });  
		}
	    });
	},
	getUserFromSession: function(session_data) {
	  var user = {'id': null};
    if (typeof(session_data.twitter) != "undefined") {
      user.id  = session_data.twitter.user.id;
      user.twitter = session_data.twitter.user;
      user.loginService = "Twitter";
    }
    else if (session_data.facebook) {
      user.id  = session_data.facebook.user.id;
      user.facebook = session_data.facebook.user;
      user.loginService = "Facebook";
    }
    else if (session_data.google) {
      user.id  = session_data.google.user.id;
      user.google = session_data.google.user;
      user.loginService = "Google";
    }
    return user;
  }
    }
});
