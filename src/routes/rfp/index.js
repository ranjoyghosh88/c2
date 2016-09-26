var express = require('express');
var app = express.Router();
var api = require('../csquire-api');
var _ = require('lodash');
var middleware = require('../middleware');
var util = require('../util');
var async = require('async');

app.use('/', middleware.requireUser, middleware.requirePremium);
app.get('/people', function(req, res, next) {
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: req.query.q,
          $options: 'gi',
        },
      },
    };
  }
  api.personalProfile.getAll(query, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/products', function(req, res, next) {
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: req.query.q,
          $options: 'gi',
        },
      },
    };
  }
  api.productProfile.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/companies', function(req, res, next) {
  var query = req.query;
  if (typeof (query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: req.query.q,
          $options: 'gi',
        },
      },
    };
  }
  api.companyProfile.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/stdQuestions/:qType', function(req, res, next) {
  api.rfpStdQuestions.getAll({
    qType: req.params.qType,
    questionText: {
      $regex: req.query.search, $option: 'gi',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
// Get All RFp for dashboard
app.get('/all', function(req, res, next) {
  api.rfps.getAll({
    q: {
      adminIds: req.session._id,
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/response/:_id', function(req, res, next) {
  api.rfpResponse.getFirst(
    {
      q: {
        rfpId: req.params._id,
        $or: [
          { adminIds: { $in: [req.session._id], }, },
          { 'contributorIds.id': { $in: [req.session._id], }, },
         ],
      },
      populate: 'rfpId rfpReceipent responses.userId',
    },  req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    var userData = _.find(data.responses, function(obj) {
      return obj.userId._id === req.session._id;
    });
    userData = userData || {};
    data.answers = userData.answers;
    var userRole = _.find(data.contributorIds, function(obj) {
      return obj.id === req.session._id;
    });
    userRole = userRole || {role: ['admin']};
    data.userRole = userRole.role;
    res.send(data);
  });
});
app.put('/response/:_id', function(req, res, next) {
  req.body.user = req.session._id;
  if (req.body.image) {
    util.uploadBase64Image(req.body.image,
      function(err, result) {
      if (err) {
        return next(err);
      }
      if (result) {
        console.log(result);
        req.body.cover = req.body.cover || {};
        req.body.cover.logo = result.url;
        updateRfp(req, res);
      }else {
        return next(err);
      }
    });
  }else {
    updateRfp(req, res);
  }
  function updateRfp(req, res) {
    api.rfpResponse.update(req.params._id, req.body,
      req.session, function(err, data) {
      if (err) {
        return next(err);
      }
      var userData = _.find(data.responses, function(obj) {
        return obj.userId._id === req.session._id;
      });
      userData = userData || {};
      data.answers = userData.answers;
      var userRole = _.find(data.contributorIds, function(obj) {
        return obj.id === req.session._id;
      });
      userRole = userRole || {role: ['admin']};
      data.userRole = userRole.role;
      res.send(data);
    });
  }

});
// Get Single RFP by Id
app.get('/:_id', function(req, res, next) {
  api.rfps.get(req.params._id, req.query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.post('/', function(req, res, next) {
  var userLog = {
    createdBy: {
      userId: req.session._id,
    },
  };
  req.body = _.extend(req.body, {
    adminIds: [req.session._id],
    userLog: userLog,
  });
  api.rfps.create(req.body, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.put('/:_id', function(req, res, next) {

  if (req.body.image) {
    util.uploadBase64Image(req.body.image,
      function(err, result) {
      if (err) {
        return next(err);
      }
      if (result) {
        console.log(result);
        req.body.cover = req.body.cover || {};
        req.body.cover.image = result.url;
        updateRfp(req, res);
      }else {
        return next(err);
      }
    });
  }else {
    updateRfp(req, res);
  }
  function updateRfp(req, res) {
    api.rfps.update(req.params._id, req.body,
      req.session, function(err, data) {
      if (err) {
        return next(err);
      }
      res.send(data);
    });
  }

});
app.get('/definitions/:type', function(req, res, next) {
  api.rfpDefinitions.getFirst({
    q: {
      type: req.params.type,
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/analyze-summary/:refId', function(req, res, next) {
  api.rfpResponse.getAll({
    q: {
      rfpId: req.params.refId,
      state: 'Responded',
    },
    populate: 'rfpReceipent',
    select: 'finalResponse rfpReceipent cover',
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/analyze-compare/:refId', function(req, res, next) {
  if (!req.params.refId) {
    res.status = 400;
    return next('Not Found!!');
  }
  api.rfps.get(req.params.refId, {
    select: 'questionGroups',
  }, req.session, function(err, rfp) {
    if (err) {
      return next(err);
    }
    if (!rfp) {
      res.status = 400;
      return next('Not Found!!');
    }
    var q = {
      rfpId: rfp._id,
      state: 'Responded',
    };
    if (req.query.ids) {
      q._id = {
        $in: _.isArray(req.query.ids)?
       req.query.ids:[req.query.ids],
      };
    }
    api.rfpResponse.getAll({
      q: q,
      populate: 'rfpReceipent',
      select: 'finalResponse rfpReceipent cover',
    }, req.session, function(err, allResponses) {
      if (err) {
        return next(err);
      }
      res.send({
        rfp: rfp,
        responses: allResponses,
      });
    });
  });
});

function setRfpReponseCount(req, rfps, responses, callback) {
  var ids = [];
  _.each(rfps, function(rfp) {
    if (rfp.state === 'completed') {
      ids.push(rfp._id);
    }
  });
  _.each(rfps, function(rfp) {
    rfp.responseCount = _.filter(responses, function(res) {
      return res.rfpId === rfp._id;
    }).length;
  });
  callback();
}
function setMyRfps(req, rfps, callback) {
  var rfpIds = _.unique(_.pluck(rfps, '_id'));
  api.rfpResponse.getAll({
    q: {
      rfpId: { $in: rfpIds },
      state: 'Responded',
    },
    limit: '*',
    select: 'rfpId state adminIds contributorIds.id',
  }, req.session, function(err, responses) {
    // Needs modification
    callback(err, responses);
  });
}
// Render dashboard
app.get('/rfp-dashboard/:type',
 function(req, res, next) {
  /* - var order = {};
  if (req.query.order) {
    _.each(req.query.order, function(temp) {
      var col = req.query.columns[temp.column];
      if (col && col.name) {
        var toPush = {};
        order[col.name] = temp.dir;
      }
    });
  }*/
  if (req.params.type !== 'all' && req.params.type !== 'my') {
    res.statusCode = 400;
    return next(new Error('Bad Request'));
  }
  var query = {};
  if (req.params.type === 'all') {
    query = {
      state: 'completed',
    };
  } else {
    query = {
      adminIds: req.session._id,
    };
  }
  api.rfps.getAll({
    q: query,
    populate: 'userLog.createdBy.userId companyId',
    select: 'title date userLog.createdBy.userId companyId state',
    start: req.query.start,
    limit: req.query.length,
    order: { 'userLog.createdBy.date': 'desc' },
  }, req.session, function(err, rfps) {
    if (err) {
      return next(err);
    }
    api.rfps.getAll({
      q: {
        state: 'completed',
      },
      select: '_id',
      limit: '*',
    }, req.session, function(err, all) {
      if (err) {
        return next(err);
      }
      res.send({
        recordsTotal: all.length,
        recordsFiltered: all.length,
        data: rfps,
      });
    });
  });
});

module.exports = app;