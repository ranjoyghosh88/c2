var express = require('express');
var router = express.Router();
var _ = require('lodash');
var Profile = require('../../models/personalProfile');
var companyProfile = require('../../models/companyProfile');
var productProfile = require('../../models/productProfile');
var async = require('async');
var api = require('../../routes/csquire-api');


var userProfileFollow = function(req, res) {
  var db, followingProp;
  switch (req.body.key) {
    case 'people': {
      db = Profile;
      followingProp = 'profiles';
      break;
    }
    case 'company': {
      db = companyProfile;
      followingProp = 'companies';
      break;
    }
    case 'product': {
      db = productProfile;
      followingProp = 'products';
      break;
    }
  }
  var query = {
    uid: req.body.uId,
  };
  var queryGetmyId = {
    uid: req.body.myuId,
  };

  var options = {};
  async.parallel({
    getMyID: function(callback) {
      Profile.findOne(queryGetmyId,
                    function(err, profile) {
                      if (err) {
                        return handleError(res, err);
                      }
                      if (!profile) {
                        return handleError(res, err);
                      }
                      callback(null, profile);
                    });
    },
    getuId: function(callback) {
      db.findOne(query,
                    function(err, profile) {
                      if (err) {
                        return handleError(res, err);
                      }
                      if (!profile) {
                        return handleError(res, err);
                      }
                      callback(null, profile);
                    });
    },
  },
  function(err, r) {
    if (req.path === '/add') {
      exports.addFollow(r.getMyID._id,
                     r.getuId._id, db, followingProp,
            function(err, data) {
              return res.json(200, data);
            });
    } else if (req.path === '/remove') {
      exports.removeFollow(r.getMyID._id,
             r.getuId._id, db, followingProp, function(err, data) {
               return res.json(200, data);
             });
    }
  }
  );
};

var userProfileFollow = function(req, res) {
  var data = {
    connectionType: req.body.key,
    process: req.path.replace('/', '') === 'add'?'follow':'unfollow',
    followerId: req.body._id,
    loggedPersonId: req.session._id,
  };
  if (req.session.manageProfile && req.session.isSuperUser) {
    data.loggedPersonId = req.session.manageProfileId;
  }
  api.follower.create(data, req.session, function(err, data) {
    if (err) {
      res.status(500).send(err);
    }
    return res.json(200, data);
  });
};

exports.removeFollow =
function(userID, followingId, db, followingProp, callback) {
  var query = {
    _id: followingId,
  };
  var queryGetmyId = {
    _id: userID,
  };
  var pull = {};
  pull['followingProfiles.' + followingProp] = followingId;
  async.parallel({
    getMyID: function(callback) {
      Profile.update(
    queryGetmyId, {
      $pull: pull,
    }, {
      safe: true,
    },
                    function(err, profile) {
                      console.log(err);
                      if (err) {
                        return handleError(res, err);
                      }
                      callback(null, profile);
                    }
                   );
    },
    getuId: function(callback) {
      db.update(
    query, {
      $pull: {
        'followers.profiles': userID,
      },
    }, {
      safe: true,
    },
                    function(err, profile) {
                      console.log(err);
                      if (err) {
                        return handleError(res, err);
                      }
                      callback(null, profile);
                    }
                   );
    },
  },
        function(err, r) {
          // Can use r.team and r.games as you wish
          // =console.log("i am here");
          var data = {
            followers: 'Succcessfuly Removed',
          };
          return callback(null, data);
        }
        );
};



exports.addFollow = function(userID, followingId, db, followingProp, callback) {
  var query = {
    _id: followingId,
  };
  var queryGetmyId = {
    _id: userID,
  };
  var push = {};
  push['followingProfiles.' + followingProp] = {
    $each: [followingId],
    $position: 0,
  };
  async.parallel({
    getMyID: function(callback) {
      Profile.update(
    queryGetmyId, {
      $addToSet: push,
    }, {
      safe: true,
    },
                    function(err, profile) {
                      console.log(err);
                      console.log(profile);
                      if (err) {
                        return handleError(res, err);
                      }
                      callback(null, profile);
                    }
                   );
    },
    getuId: function(callback) {
      db.update(
    query, {
      $addToSet: {
        'followers.profiles': {
          $each: [userID],
          $position: 0,
        },
      },
    }, {
      safe: true,
    },
                    function(err, profile) {
                      console.log(err);
                      if (err) {
                        return handleError(res, err);
                      }
                      callback(null, profile);
                    }
                   );
    },
  },
        function(err, r) {
          var data = {
            followers: 'Succcessfuly Added',
          };
          return callback(null, data);
        }
        );


};

function handleError(res, err) {
  return res.send(500, err);
}
router.post('/add', userProfileFollow);
router.post('/remove', userProfileFollow);
module.exports = router;