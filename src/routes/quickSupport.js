var express = require('express');
var app = express.Router();
require('dotenv').load();
var async = require('async');
var requireDir = require('require-dir');
var middleware = require('./middleware');
var querystring = require('querystring');
var requestify = require('requestify');
var OpenTok = require('opentok');
var TOKBOX_API_KEY = process.env.TOKBOX_API_KEY;
var TOKBOX_API_SECRET = process.env.TOKBOX_API_SECRET;
var TWILIO_SID = process.env.TWILIO_SID;
var TWILIO_TOKEN = process.env.TWILIO_TOKEN;
var opentok = new OpenTok(TOKBOX_API_KEY, TOKBOX_API_SECRET);
var twilio = require('twilio');
var client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
var _ = require('lodash');
var api = require('../routes/csquire-api/');
var utils = require('./util');
var qsUtils = require('./quickSupportUtil');
var ProductModel = require('../models/productProfile');
var getCompanyDetails = function(companyId, req, cb) {
  api.companyProfile.getFirst({
    q: {
      _id: companyId,
    }, }, req.session,
    function(err, companyProfile) {
      if (err) {
        return cb(err);
      }else {
        cb(null, companyProfile);
      }
    });
};
app.get('/dashboard', middleware.requireUser, function(req, res, next) {
  qsUtils.quickSupportCount(req, function(err, results) {
    if (results.waiting === 0) {
      return res.redirect('/quickSupport/dashboard/questions?' +
        'filterProfile=true');
    }else {
      return res.redirect('/quickSupport/dashboard/waiting');
    }
  });
});

app.post('/getAllProducts', middleware.requireUser, function(req, res, next) {
  query = {
    q: {_id: {$in: req.body.products}},
    select: '_id name',
  };
  api.productProfile.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.post('/getTagList', middleware.requireUser, function(req, res, next) {
  query = {
    q: {_id: {$in: req.body.tags}, all: true},
    select: '_id name',
  };
  api.tag.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.get('/getTags', middleware.requireUser, function(req, res, next) {
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: '^' + req.query.q,
          $options: 'i',
        },
        all: true,
      },
    };
  }else {
    query = {
      q: {
        all: true,
      },
    };
  }
  api.tag.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.use('/dashboard', middleware.requireUser, function(req, res, next) {
  res.locals.chromeId = process.env.CHROME_EXTN_ID;
  async.waterfall([
    function(callback) {
      api.quickSupportQuestions.getAll({
    q: {
      operation: 'getLockedQuestion',
      userId: req.session._id,
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      callback(null, data);
    }
  });
    }, ],
        function(err, results) {
    if (err) {
      return callback(err, null);
    } else {
      res.locals.lockedQuestion = results;
      qsUtils.quickSupportCount(req, function(err, data) {
      if (err) {
        return next(err);
      }
      res.locals.quicksupportCount = data;
      next();
    });
    }
  });

});
/* App.use('/dashboard', middleware.requireUser, function(req, res, next) {
  qsUtils.quickSupportQueue(req, function(err, results) {
    res.locals.userID = req.session._id;
    res.locals.feedBackcount = results.quickSupportResponderPendingList.length;
    res.locals.respondingAs = results.getAnswerbuttonactive;
    if (_.isEmpty(results.lockedQuestion)) {
      res.locals.lockedQuestion = []; var responderHistoryId = '';
    } else {
      var lockedQuestionId = results.lockedQuestion[0].qsQuestionId;
      res.locals.responderHistoryId = results.lockedQuestion[0]._id;
      res.locals.lockedQuestion =
   _.findWhere(results.quickSupportQuestions, { _id: lockedQuestionId });
    } if (results.expertLockedQuestion === undefined) {
      res.locals.expertWaiting = [];
    }else {
      res.locals.expertWaiting = results.expertLockedQuestion;
    }
    res.locals.qsData = results;
    res.locals.asked = results.askedTab;
    next();
  });
});
*/

app.get('/dashboard/waiting',
  middleware.requireUser, function(req, res, next) {
  res.locals.tab = 'waiting';
  api.quickSupportQuestions.getAll({
    q: {
      operation: 'expertLockedQuestion',
      userId: req.session._id,
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.locals.expertWaiting = data;
    res.render('pages/las/liveApplication', {
      title: 'CSquire | Quick Support',
      activePage: 'quicksupport',
    });
  });
});

var optsApi = [{
    path: 'businessProcessArea',
  },
  {
    path: 'connections.products.refId',
    model: 'productProfile',
  },
];

app.get('/dashboard/questions',
  middleware.requireUser, function(req, res, next) {
  res.locals.tab = 'question';
  api.personalProfile.get(req.session._id, {populate: optsApi},
  req.session, function(err, personalData) {
    if (err) {
      return next(err);
    }
    async.parallel({
      businessProcessArea: function(callback) {
        if (personalData.businessProcessAreas.length > 0) {
          api.businessProcessArea.getAll({
            q: {_id: {$in: personalData.businessProcessAreas}},
            order: {createdDate: -1},
          }, req.session, function(err, data) {
            if (err) {
              return callback(err, null);
            }
            callback(null, data);
          });
        }else {
          var result = [];
          callback(null, result);
        }
      },
      getAnswerbuttonactive: function(callback) {
        qsUtils.getAnswerbuttonactive(req, personalData,
          function(err, result) {
            if (err) {
              return callback(err, null);
            }
            callback(null, result);
          });
      },
    },
    function(err, results) {
      res.locals.respondingAs = results.getAnswerbuttonactive;
      var pData = personalData.connections.products;
      if (personalData.connections && pData) {
        for (var iIndex = 0; iIndex < pData.length;) {
          if (!personalData.connections.products[iIndex].refId) {
            personalData.connections.products.splice(iIndex, 1);
            continue;
          }
          iIndex++;
        }
      }
      personalData.businessProcessAreas = results.businessProcessArea;
      res.locals.mySkills = personalData;
      if (req.query.filterProfile === 'true') {
        api.quickSupportQuestions.getAll({
          q: {
            operation: 'getSkilledBasedQuestion',
            userId: req.session._id,
          },
        }, req.session, function(err, questionList) {
          res.locals.quicksupportCount.question = questionList.length;
          if (err) {
            return next(err);
          }
          res.render('pages/las/liveApplication', {
            title: 'CSquire | Quick Support',
            activePage: 'quicksupport',
            lasData: questionList,
            filterProfile: true,
          });
        });
      }else if (req.query.industry !== undefined ||
        req.query.product !== undefined ||
        req.query.businessProcessArea !== undefined ||
        req.query.tags !== undefined) {
        qsUtils.quickSupportFilterbyPif(req, function(err, data) {
          res.locals.quicksupportCount.question = data.length;
          res.render('pages/las/liveApplication', {
            title: 'CSquire | Quick Support',
            activePage: 'quicksupport',
            lasData: data,
            industry: req.query.industry,
            product: req.query.product,
            businessProcessArea: req.query.businessProcessArea,
          });
        });

      }else {
        api.quickSupportQuestions.getAll({
          q: {
            operation: 'getAllQuestion',
            userId: req.session._id,
          },
        }, req.session, function(err, questionList) {
          res.locals.quicksupportCount.question = questionList.length;
          if (err) {
            return next(err);
          }
          res.render('pages/las/liveApplication', {
            title: 'CSquire | Quick Support',
            activePage: 'quicksupport',
            lasData: questionList,
          });
        });
      }
    });
  });
});
app.get('/dashboard/answered',
  middleware.requireUser, function(req, res, next) {
    res.locals.tab = 'answered';
    if (req.query.status !== undefined) {
      qsUtils.filterAnswerTab(req,
        function(err, data) {
        res.locals.quicksupportCount.answered = data.length;
        res.locals.filterFlag = true;
        res.render('pages/las/liveApplication', {
          title: 'CSquire | Quick Support',
          activePage: 'quicksupport',
          totalPayment: data.totalPayment,
          answeredTab: data,
        });
      });
    }else {
      api.quickSupportQuestions.getAll({
        q: {
          operation: 'getAnsweredQuestion',
          userId: req.session._id,
        },
      }, req.session, function(err, questionList) {
        if (err) {
          return next(err);
        }
        res.locals.quicksupportCount.answered = questionList.length;
        var totalPayment = 0;
        _.each(questionList, function(ques) {
          if (ques.status === 'completed') {
            totalPayment += 19;
          }
        });
        questionList.totalPayment = totalPayment;
        res.locals.filterFlag = false;
        res.render('pages/las/liveApplication', {
          title: 'CSquire | Quick Support',
          activePage: 'quicksupport',
          totalPayment: totalPayment,
          answeredTab: questionList,
        });
      });
    }
  });
app.get('/dashboard/feedback',
  middleware.requireUser, function(req, res, next) {
  res.locals.tab = 'feedback';
  qsUtils.quickSupportFeedbackQuestion(req, function(err, questionList) {
      res.locals.userID = req.session._id;
      res.render('pages/las/liveApplication', {
        title: 'CSquire | Quick Support',
        activePage: 'quicksupport',
        feedbackPedingList: questionList,
      });
    });
});

app.get('/dashboard/asked',
  middleware.requireUser, function(req, res, next) {
  res.locals.tab = 'asked';
  api.quickSupportQuestions.getAll({
    q: {
      operation: 'getAskedQuestion',
      userId: req.session._id,
    },
  }, req.session, function(err, questionList) {
    res.locals.quicksupportCount.asked = questionList.length;
    if (err) {
      return next(err);
    }
    res.locals.asked = questionList;
    res.render('pages/las/liveApplication', {
      title: 'CSquire | Quick Support',
      activePage: 'quicksupport',
    });
  });
});

app.get('/videocall/:questionID/:responderHistoryId/:userId',
  middleware.requireUser, function(req, res, next) {
  async.parallel({
    quickSupportQuestions: function(callback) {
      api.quickSupportQuestions.getAll({
        q: {_id: req.params.questionID, operation: 'getAllQuestionByCondition'},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }else {
          api.stripe.getAll({
            q: {
              stripeSku: data[0].stripeSku,
              operation: 'getValueSku',
            },
          }, req.session, function(err, sku) {
            if (err) {
              return callback(err, null);
            }
            data[0].stripeSku = sku;
            callback(null, data);
          });
        }
      });
    },
    responderHistory: function(callback) {
      api.quickSupportResponderHistorys.getAll({
        q: {_id: req.params.responderHistoryId},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    extendCallSku: function(callback) {
      api.stripe.getAll({
        q: {
          _id: req.params.userId,
          csquireService: 3,
          operation: 'getPostQuestionSku',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
        function(err, results) {
          res.locals.chromeId = process.env.CHROME_EXTN_ID;
          var requesterData = results.quickSupportQuestions[0];
          var responderData = results.responderHistory[0];
          res.locals.Mode = requesterData.supportCommunicationMode._id;
          var getRequesterDataImage =
          getRequesterImage(requesterData, responderData, res.locals);
          if (requesterData.createdBy._id === req.session._id) {
            var updateDataJoined = {
              requesterJoined: true,
            };
            if (responderData.company) {
              companyName = '(behalf of ' + responderData.company.name + ')';
            }else {
              companyName = '';
            }
            getName = responderData.userId.name + ' ' +
            responderData.userId.lastName + ' ' + companyName;
            api.quickSupportResponderHistorys.update
            (req.params.responderHistoryId, updateDataJoined, req.session,
              function(err, data) {
                        if (err) {
                          next(err);
                        } else {
                          var token = opentok.generateToken
                          (data.responderHistory.sessionRoom, {
                            role: 'moderator',
                          });
                          res.locals.getNameData = getName;
                          res.render('pages/las/liveVideo', {
                            title: 'CSquire | Quick Support',
                            apiKey: TOKBOX_API_KEY,
                            token: token,
                            sessionId: data.responderHistory.sessionRoom,
                            activePage: 'quicksupport',
                            name: getName,
                            iamResponder: false,
                            questionData: requesterData,
                            price: dollarformat(results.extendCallSku.price),
                            extendSku: results.extendCallSku.id,
                            pictureUrl: getRequesterDataImage.pictureUrl,
                            pictureUrlSub: getRequesterDataImage.pictureUrlSub,
                          });
                        }
                      });
          }else if (responderData.userId._id === req.session._id) {
            res.locals.Mode = requesterData.supportCommunicationMode._id;
            var getResponderDataImage =
            getResponderImage(requesterData, responderData, res.locals);
            qsUtils.quickSupportUpdate(requesterData._id,
            responderData._id, {}, {
              responderJoined: true,
            }, req,
            function(err, result) {
                        if (err) {
                          next(err);
                        } else {
                          res.locals.getNameData =
                          requesterData.createdBy.name +
                          ' ' + requesterData.createdBy.lastName;
                          var token = opentok.generateToken
                          (result.responderHistory.sessionRoom, {
                            role: 'moderator',
                          });
                          res.render('pages/las/liveVideo', {
                            title: 'CSquire | Quick Support',
                            apiKey: TOKBOX_API_KEY,
                            token: token,
                            sessionId: result.responderHistory.sessionRoom,
                            activePage: 'quicksupport',
                            name: requesterData.createdBy.name + ' ' +
                            requesterData.createdBy.lastName,
                            iamResponder: true,
                            price: dollarformat(results.extendCallSku.price),
                            extendSku: results.extendCallSku.id,
                            questionData: requesterData,
                            pictureUrl: getResponderDataImage.pictureUrl,
                            pictureUrlSub: getResponderDataImage.pictureUrlSub,
                          });
                        }
                      });
          }

        });
});

var getResponderImage = function(requesterData, responderData, locals) {
      if (requesterData.createdBy.pictureUrl) {
        pictureUrlSub = requesterData.createdBy.pictureUrl;
      }else {
        pictureUrlSub = 'https://res.cloudinary.com/csquireqa/' +
        'raw/upload/0.3.75/images/profile.jpg';
      }
      if (responderData.userId.pictureUrl) {
        pictureUrl = responderData.userId.pictureUrl;
      }else {
        pictureUrl = 'https://res.cloudinary.com/csquireqa/' +
        'raw/upload/0.3.75/images/profile.jpg';
      }
      var data = {
        pictureUrlSub: pictureUrlSub,
        pictureUrl: pictureUrl,
      };
      return data;
    };

var getRequesterImage = function(requesterData, responderData, locals) {
      if (requesterData.createdBy.pictureUrl) {
        pictureUrl = requesterData.createdBy.pictureUrl;
      }else {
        pictureUrl = 'https://res.cloudinary.com/csquireqa/' +
        'raw/upload/0.3.75/images/profile.jpg';
      }
      if (responderData.userId.pictureUrl) {
        pictureUrlSub = responderData.userId.pictureUrl;
      }else {
        pictureUrlSub = 'https://res.cloudinary.com/csquireqa/' +
        'raw/upload/0.3.75/images/profile.jpg';
      }
      var data = {
        pictureUrlSub: pictureUrlSub,
        pictureUrl: pictureUrl,
      };
      return data;
    };

app.get('/products', middleware.requireUser, function(req, res, next) {
  var fields = ['name'];
  var arr = req.query.q.split(' ');
  var mongoQuery = { $or: [] };
  for (var iIndex = 0; iIndex < fields.length; iIndex++) {
    for (var iQIndex = 0; iQIndex < arr.length; iQIndex++) {
      mongoQuery.$or.push(getQuery(fields[iIndex], arr[iQIndex]));
    }
  }
  ProductModel
    .find(mongoQuery, function(err, data) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.send(data);
    }).lean();
});
function getQuery(field, query) {
  var q = {};
  var regx = new RegExp('^' + query, 'i');
  q [field] = { $regex: regx, $options: 'i' };
  return q;
}
app.get('/industry', middleware.requireUser, function(req, res, next) {
  api.industry.getAll(
    { q: {}, order: {name: 1}, },
    req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});

app.get('/businessProcessArea', middleware.requireUser,
  function(req, res, next) {
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: '^' + req.query.q,
          $options: 'i',
        },
        all: true,
      },
    };
  }else {
    query = {
      q: {
        all: true,
      },
    };
  }
  api.businessProcessArea.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});



app.get('/postquestion', middleware.requireUser, function(req, res) {

  async.parallel({
    industry: function(callback) {
      api.industry.getAll({
        q: {},
        order: {name: 1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    businessProcessArea: function(callback) {
      api.businessProcessArea.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    commnucationMode: function(callback) {
      api.supportCommunicationModes.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    userQuestion: function(callback) {
      api.quickSupportQuestions.getFirst({
        q: {
          createdBy: req.session._id,
          operation: 'getAllQuestionByCondition',
        },
        order: {createdDate: -1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    sku: function(callback) {
      api.stripe.getAll({
        q: {
          _id: req.session._id,
          csquireService: 1,
          operation: 'getPostQuestionSku',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
    function(err, results) {
      res.locals.price = dollarformat(results.sku.price);
      res.locals.defaultPrice = dollarformat(results.sku.defaultPrice);
      res.locals.lasData = results;
      res.locals.userData = {
        mailId: req.session.user,
        userName: utils.formatTextCapitalize(req.session.username),
      };
      if (results.userQuestion !== null) {
        res.locals.userData.phoneNumber =
        results.userQuestion.phoneNumber.slice(2);
      }else {
        res.locals.userData.phoneNumber = '';
      }
      res.render('pages/las/livePostQuestion', {
        title: 'CSquire | Quick Support',
        activePage: 'quicksupport',
        stripePubKey: process.env.STRIPE_PUBKEY,
      });
    });

});

function dollarformat(num) {
  var conv = num / 100;
  return '$' + conv.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

app.post('/submitquestion', middleware.requireUser, function(req, res, next) {
  var qsPostData = req.body;
  var getPhone = qsPostData.phoneNumber;
  qsPostData.phoneNumber = '+1' + getPhone.replace(/[^0-9\.]+/g, '');
  qsPostData.createdBy = req.session._id;
  qsPostData.name = req.session.username;
  qsPostData.uid = req.session.uid;
  qsPostData.userEmail = req.session.user;
  api.quickSupportQuestions.create(qsPostData, req.session,
        function(err, data) {
          if (err) {
            return next(err);
          } else {
            res.render('pages/paymentSuccess', {
              title: 'CSquire | Success Payment',
            });
          }
        });

});

app.get('/quickSupportReview', middleware.requireUser, function(req, res) {
  res.render('pages/las/quickSupportReview', {
    title: 'CSquire | Quick Support',
  });
});

app.get('/voip', middleware.requireUser, function(req, res) {

  // Send an SMS text message
  console.log('i am in voip service');
  var capability = new twilio.Capability(TWILIO_SID, TWILIO_TOKEN);
  capability.allowClientOutgoing('AP297ed7f1b396f5a422de3954f1cc8554');

  res.render('pages/las/liveCall', {
    title: 'CSquire | Quick Support',
    twilioToken: capability.generate(),
  });

});

app.get('/locking/:questionId/:requesterId/:skuId',
  middleware.requireUser, function(req, res, next) {
  async.waterfall([
    function(callback) {
      api.personalProfile.get(req.session._id, {},
      req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } else {
          callback(null, data);
        }
      });
    }, ],
        function(err, results) {
    if (err) {
      return callback(err, null);
    } else {
      if (results.payments !== undefined &&
        results.payments.stripe !== null &&
        results.payments.stripe !== undefined) {
        api.quickSupportQuestions.getAll({
        q: {
          _id: req.params.questionId,
          operation: 'getAllQuestionByCondition',
        },
      }, req.session, function(err, data) {
        if (err) {return callback(err, null);
        }else {
          if (data[0].supportStatus !== 'Locked') {

            var lockingQuestion = {
    qsQuestionId: req.params.questionId,
    status: 'Locked',
    userId: req.session._id,
    requesterId: req.params.requesterId,
    stripeSku: [{
      parent: req.params.skuId,
    }, ],
  };
            api.quickSupportResponderHistorys.create(lockingQuestion,
              req.session, function(err, data) {
          if (data.msg) {
            res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              Message: data.msg,
            });
          } else {
            return res.redirect('/quickSupport/dashboard');
          }
        });


          }else {
            res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              activePage: 'quicksupport',
              Message:
              'Question is alreday locked by another CSquire adviser',
            });
          }

        }

      });
      }else {
        return res.redirect('/quickSupport/authorize?url= ' + req.originalUrl);
      }


    }
  });
});


app.get('/locking/:questionId/:requesterId/:identity/:skuId',
  middleware.requireUser, function(req, res, next) {
  async.waterfall([
    function(callback) {
      api.companyProfile.getFirst({
      q: {
        _id: req.params.identity,
      }, }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } else {
          callback(null, data);
        }
      });
    }, ],
        function(err, results) {
    if (err) {
      return callback(err, null);
    } else {
      console.log(results);
      if (results.payments !== undefined &&
        results.payments.stripe !== null &&
        results.payments.stripe !== undefined) {
        api.quickSupportQuestions.getAll({
        q: {
          _id: req.params.questionId,
          operation: 'getAllQuestionByCondition',
        },
      }, req.session, function(err, data) {
        if (err) {return callback(err, null);
        }else {
          if (data[0].supportStatus !== 'Locked') {

            var lockingQuestion = {
    qsQuestionId: req.params.questionId,
    status: 'Locked',
    userId: req.session._id,
    requesterId: req.params.requesterId,
    company: req.params.identity,
    stripeSku: [{
      parent: req.params.skuId,
    }, ],
  };
            api.quickSupportResponderHistorys.create(lockingQuestion,
              req.session, function(err, data) {
          if (data.msg) {
            res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              Message: data.msg,
            });
          } else {
            return res.redirect('/quickSupport/dashboard');
          }
        });


          }else {
            res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              activePage: 'quicksupport',
              Message:
              'Question is alreday locked by another CSquire adviser',
            });
          }

        }

      });
      }else {
        var userIsOwner =
         _.filter(results.claimedBy.profiles, _.matches({
           profileId: req.session._id,
           status: 'approved',
         })).length > 0;
        if (userIsOwner) {
          return res.redirect('/quickSupport/authorize?url= ' +
            req.originalUrl + '&companyId=' + results._id);
        }else {
          res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              activePage: 'quicksupport',
              Message:
              'Please inform your owner of the' +
              'company to set the stripe account',
            });
        }

      }


    }
  });
});

app.post('/unlocking', middleware.requireUser, function(req, res, next) {
  if (req.body.status === 'unlocked') {
    var unlockingQuestion = {
    questionId: req.body.questionId,
    responderHistoryId: req.body.responderHistoryId,
    status: 'unlocked',
    unlockingBy: req.body.unlockingBy,
  };
    api.quickSupportResponderHistorys.create(unlockingQuestion, req.session,
        function(err, data) {
          if (err) {
            return next(err);
          }else {
            res.redirect('/quickSupport/dashboard');
          }
        });
  }else {

    api.quickSupportQuestions.getAll({
        q: {
          _id: req.body.questionId,
          operation: 'getAllQuestionByCondition',
        },
      }, req.session, function(err, data) {
        if (err) {return callback(err, null);
        }else {
          if (data[0].supportStatus !== 'Locked') {

            var lockingQuestion = {
    qsQuestionId: req.body.questionId,
    status: 'Locked',
    userId: req.session._id,
    requesterId: req.body.requesterId,
  };
            api.quickSupportResponderHistorys.create(lockingQuestion,
              req.session, function(err, data) {
          if (data.msg) {
            res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              Message: data.msg,
            });
          } else {
            return res.redirect('/quickSupport/dashboard');
          }
        });


          }else {
            res.render('pages/las/quickSupportError', {
              title: 'CSquire | Quick Support',
              activePage: 'quicksupport',
              Message:
              'Question is alreday locked by another CSquire adviser',
            });
          }

        }

      });

  }
});

app.post('/postDuration', middleware.requireUser,
  function(req, res, next) {
    var qData = {
    supportStatus: 'pending',
  };
    if (req.body.finalData.responderDuration) {
      req.body.finalData.callEndedDate = (new Date()).toUTCString();
    }
    qsUtils.quickSupportUpdate(req.body.qId,
    req.body.id, qData, req.body.finalData, req,
  function(err, result) {
              if (err) {
                return next(err);
              } else {
                res.json(result);
              }
            });
  });

app.post('/validCoupon', middleware.requireUser,
  function(req, res, next) {
    console.log('coupon validation');
    api.stripe.getAll({
    q: {
      coupon: req.body.coupon,
      operation: 'validCouponCode',
    },
  }, req.session, function(err, result) {
    if (err) {
      return next(err);
    }else {
      res.json(result);
    }
  });
  });

app.post('/validReferalCoupon', middleware.requireUser,
  function(req, res, next) {
    console.log('Referal validation');
    api.stripe.getAll({
    q: {
      email: req.body.coupon,
      operation: 'validReferalCode',
      csquireService: 4,
    },
  }, req.session, function(err, result) {
    if (err) {
      return next(err);
    }else {
      res.json(result);
    }
  });
  });

app.post('/postSku', middleware.requireUser,
  function(req, res, next) {
    console.log(req.body);
    var data = {
      stripeSku: {
        parent: req.body.parent,
      },
    };
    api.quickSupportResponderHistorys.update
      (req.body.id, data, req.session, function(err, res) {
          if (err) {
            console.log(err);
            return next(err);
          }
          res.json(result);
        });
  });

app.get('/requesterFeedback/:questionID/:responderHistoryId',
  middleware.requireUser, function(req, res, next) {

    async.parallel({
    quickSupportQuestions: function(callback) {
      api.quickSupportQuestions.getAll({
        q: {_id: req.params.questionID, operation: 'getAllQuestionByCondition'},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    responderHistory: function(callback) {
      api.quickSupportResponderHistorys.getAll({
        q: {_id: req.params.responderHistoryId},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
        function(err, results) {
          var requesterData = results.quickSupportQuestions[0];
          var responderData = results.responderHistory[0];
          res.locals.questionData = results.quickSupportQuestions[0];
          res.locals.responderHistoryData = results.responderHistory[0];
          var stripeSku = requesterData.stripeSku;
          var stripeSkuLength = responderData.stripeSku.length;
          api.stripe.getAll({
            q: {
              stripeSku: stripeSku,
              operation: 'getValueSku',
            },
          }, req.session, function(err, sku) {
            if (err) {
              return next(err);
            }else {
              if (stripeSkuLength === 1) {
                res.locals.price = dollarformat(sku.price);
                res.locals.toatlPrice = dollarformat(sku.price);
                if (requesterData.createdBy._id === req.session._id) {
                  res.render('pages/las/requesterFeedback', {
                  title: 'CSquire | Quick Support',
                  activePage: 'quicksupport',
                });

                }else if (responderData.userId._id === req.session._id) {
                  var getName = utils.formatTextCapitalize(
                    requesterData.createdBy.name + ' ' +
                    requesterData.createdBy.lastName);
                  res.render('pages/las/responderFeedback', {
                  title: 'CSquire | Quick Support',
                  activePage: 'quicksupport',
                });
                }
              }else {

                api.stripe.getAll({
            q: {
              stripeSku: responderData.stripeSku[1].parent,
              operation: 'getValueSku',
            },
          }, req.session, function(err, extendsku) {
            if (err) {
              return next(err);
            }else {

              res.locals.price = dollarformat(sku.price);
              res.locals.Extendprice =
              dollarformat(extendsku.price * (stripeSkuLength - 1));
              res.locals.toatlPrice = dollarformat(sku.price +
                (extendsku.price * (stripeSkuLength - 1)));
              if (requesterData.createdBy._id === req.session._id) {
                res.render('pages/las/requesterFeedback', {
                  title: 'CSquire | Quick Support',
                  activePage: 'quicksupport',
                });

              }else if (responderData.userId._id === req.session._id) {
                var getName = utils.formatTextCapitalize(
                  requesterData.createdBy.name + ' ' +
                  requesterData.createdBy.lastName);
                res.render('pages/las/responderFeedback', {
                  title: 'CSquire | Quick Support',
                  activePage: 'quicksupport',
                });
              }
            }});
              }
            }
          });
        });
  });


app.post('/QuickSupportfeedback', middleware.requireUser,

  function(req, res) {
    var getAnswer;
    if (req.body.isAnswered === 'true') {
      getAnswer = true;
    }else {
      getAnswer = false;
    }
    if (req.body.responderFeedback === 'true') {
      var responderFeedback = {
        responderFeedback: {
          isAnswered: getAnswer,
          message: req.body.message,
        },
      };
      api.quickSupportResponderHistorys.update
      (req.body.responderHistoryId, responderFeedback, req.session,
        function(err, data) {
          if (err) {
          } else {
            res.redirect('/quickSupport/dashboard');
          }
        });
    }else {
      var requesterFeedback = {
        requesterFeedback: {
          isAnswered: getAnswer,
          message: req.body.message,
        },
      };
      api.quickSupportResponderHistorys.update
      (req.body.responderHistoryId, requesterFeedback, req.session,
        function(err, data) {
          if (err) {
          } else {
            var qData;
            var rData;
            if (getAnswer) {
              rData = {
                status: 'completed',
              };
              qData = {
                supportStatus: 'completed',
              };
            }else {
              if (req.body.postquestion === 'true') {
                rData = {
                status: 'closed',
              };
                qData = {
                supportStatus: 'unlocked',
              };
              }else {
                rData = {
                status: 'closed',
              };
                qData = {
                supportStatus: 'closed',
              };
              }
            }
            qsUtils.quickSupportUpdate(data.qsQuestionId,
            data._id, qData, rData, req,
            function(err, result) {
              if (err) {
              } else {
                res.redirect('/quickSupport/dashboard');
              }
            });
          }
        });

    }
  });


app.post('/savenote', middleware.requireUser,
  function(req, res) {
    api.quickSupportResponderHistorys.update
    (req.body.id, req.body, req.session,
        function(err, data) {
          if (err) {
          } else {
            res.json(data);
          }});

  });

app.get('/editquestion/:questionId', middleware.requireUser,
  function(req, res) {
  async.parallel({
    industry: function(callback) {
      api.industry.getAll({
        q: {},
        order: {name: 1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    businessProcessArea: function(callback) {
      api.businessProcessArea.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    commnucationMode: function(callback) {
      api.supportCommunicationModes.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    tags: function(callback) {
      api.tag.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    quickSupportQuestions: function(callback) {
      api.quickSupportQuestions.getAll({
        q: {_id: req.params.questionId, operation: 'getAllQuestionByCondition'},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
        function(err, results) {
          results.quickSupportQuestions[0].phoneNumber =
          results.quickSupportQuestions[0].phoneNumber.slice(2);
          res.locals.lasData = results;
          res.locals.userData = {
            mailId: req.session.user,
            userName: utils.formatTextCapitalize(req.session.username),
          };
          res.render('pages/las/quickSupportEditQuestion', {
            title: 'CSquire | Quick Support',
            activePage: 'quicksupport',
            edit: true,
            questionData: results.quickSupportQuestions,
          });
        });

});
app.post('/updateQuestion', middleware.requireUser, function(req, res, next) {
  var qsPostData = req.body;
  var getPhone = qsPostData.phoneNumber;
  qsPostData.phoneNumber = '+1' + getPhone.replace(/[^0-9\.]+/g, '');
  api.quickSupportQuestions.update(qsPostData.questionId,
    qsPostData, req.session, function(err, data) {
      if (err) {
        return next(err);
      }else {
        return res.redirect('/quickSupport/dashboard/asked');
      }
    });
});


// Connect to stripe Account

app.get('/authorize', middleware.requireUser, function(req, res) {
  req.session.url = req.query.url;
  if (req.query.companyId !== undefined) {
    req.session.companyIdAuth =  req.query.companyId;
  }
  var key1 = 'response_type';
  var key2 = 'client_id';
  var key3 = 'redirect_uri';
  var obj = {scope: 'read_write'};
  obj[key1] = 'code';
  obj[key2] = process.env.STRIPE_CLIENT_ID;
  obj[key3] = process.env.STRIPE_REDIRECT_URI;
  console.log(querystring.stringify(obj));
  res.redirect(process.env.STRIPE_AUTHORIZE_URI + '?' +
    querystring.stringify(obj));
});

function stripeRedirect(req, res) {
  if (req.session.companyIdAuth !== undefined) {
    if (req.session.url !== undefined) {
      return res.redirect('/quickSupport/dashboard/questions?' +
    'filterProfile=true');
    }else {
      return res.redirect('/company/CompanySettings/' +
        req.session.companyIdAuth);
    }
  }else {
    if (req.session.url !== undefined) {
      return res.redirect('/quickSupport/dashboard/questions?' +
    'filterProfile=true');
    }else {
      return res.redirect('/AccountSettings');
    }
  }
}

app.get('/oauth/callback', middleware.requireUser, function(req, res, next) {
  if (req.query.error === 'access_denied') {
    stripeRedirect(req, res);
  }else {
    var key1 = 'grant_type';
    var key2 = 'client_id';
    var key3 = 'client_secret';
    var obj = {code: req.query.code};
    obj[key1] = 'authorization_code';
    obj[key2] = process.env.STRIPE_CLIENT_ID;
    obj[key3] = process.env.STRIPE_SECRET_KEY;
    requestify.request(process.env.STRIPE_TOKEN_URI, {
  method: 'POST',
  body: obj,
  dataType: 'form-url-encoded',
}).then(function(response) {
  var data = {
    payments: {
      stripe: JSON.parse(response.body),
    },
  };

  if (req.session.companyIdAuth !== undefined) {
    data.admin = req.session._id;
    var updateCompany = function() {
      api.companyProfile.update(req.session.companyIdAuth,
        data, req.session, function(err, data) {
          if (err) {
            return next(err);
          }else {
            if (req.session.url !== undefined) {
              return res.redirect(req.session.url);
            }else {
              return res.redirect('/company/CompanySettings/' +
                req.session.companyIdAuth);
            }
          }
        });
    };
    if (req.session.isSuperUser) {
      getCompanyDetails(req.session.companyIdAuth, req, function(err, comp) {
        data.admin = comp.admin[0];
        updateCompany();
      });
    }else {
      updateCompany();
    }
  }else {
    api.personalProfile.update(req.session._id, data,
    req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      if (req.session.url !== undefined) {
        res.redirect(req.session.url);
      }else {
        return res.redirect('/AccountSettings');
      }
    }

  });
  }



});
  }
});


app.get('/deauthorize', middleware.requireUser, function(req, res, next) {
  if (req.query.companyId !== undefined) {
    options = {
  stripeDeauthorize: true,
  id: req.session._id,
  companyId: req.query.companyId,
};
  }else {
    options = {
  stripeDeauthorize: true,
  id: req.session._id,
};
  }

  api.stripe.update(req.session._id, options,
    req.session, function(err, result) {
      if (err) {
        return next(err);
      }else {
        if (req.query.companyId !== undefined) {
          return res.redirect('/company/CompanySettings/' +
            req.query.companyId);
        }else {
          return res.redirect('/AccountSettings');
        }
      }

    });
});

app.post('/addProduct', middleware.requireUser, function(req, res, next) {
  var adminId = req.session._id;
  if (req.session.manageProfile && req.session.isSuperUser &&
  req.body.connectFrom === 'people') {
    adminId = req.session.manageProfileId;
  }
  api.productProfile.create(_.extend(req.body, { admin: adminId }),
    req.session, function(err, result) {
      if (err) {
        return next(err);
      }else {
        res.send(result);
      }
    });
});
app.post('/addBusinessProcessArea',
 middleware.requireUser, function(req, res, next) {
  api.businessProcessArea.create({name: req.body.name},
    req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.post('/addTag', function(req, res) {
  api.tag.create({name: req.body.name}, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});
app.post('/addResponder', middleware.requireUser, function(req, res, next) {
  var companyId = req.body.companyId;
  getCompanyDetails(companyId, req, function(err, companyProfile) {
      if (err) {
        return callback(err);
      }
      if (req.body.quickSupportResponderList !== undefined &&
        !(req.body.quickSupportResponderList instanceof Array)) {
        req.body.quickSupportResponderList =
        [req.body.quickSupportResponderList];
      }
      if (companyProfile.quickSupportResponderList !== undefined &&
        companyProfile.quickSupportResponderList.length > 0) {
        for (var resCount = 0;
          resCount < req.body.quickSupportResponderList.length;resCount++) {
          var id = req.body.quickSupportResponderList[resCount];
          (companyProfile.quickSupportResponderList).push(id);
        }
      }else {
        companyProfile.quickSupportResponderList =
        req.body.quickSupportResponderList;
      }
      var postData = {
        quickSupportResponderList: companyProfile.quickSupportResponderList,
        admin: req.session._id,
      };
      if (req.session.isSuperUser) {
        postData.admin = companyProfile.admin[0];
      }
      api.companyProfile.update(companyProfile._id, postData, req.session,
        function(err, companyProfile) {
          if (err) {
            return next(err);
          } else {
            res.redirect('/company/CompanySettings/' + companyProfile._id);
          }
        });
    });
});
app.post('/removeResponder', middleware.requireUser, function(req, res, next) {
  var companyId = req.body.companyId;
  getCompanyDetails(companyId, req, function(err, companyProfile) {
      if (err) {
        return callback(err);
      }
      var index =
      companyProfile.quickSupportResponderList.indexOf(req.body.responderId);
      if (index !== -1) {
        (companyProfile.quickSupportResponderList).splice(index, 1);
        var postData = {
          quickSupportResponderList: companyProfile.quickSupportResponderList,
          admin: req.session._id,
        };
        if (req.session.isSuperUser) {
          postData.admin = companyProfile.admin[0];
        }
        api.companyProfile.update(companyProfile._id, postData, req.session,
          function(err, companyProfile) {
            if (err) {
              return next(err);
            } else {
              res.send(companyProfile);
            }
          });
      }else {
        res.send(null);
      }
    });
});
app.post('/addProductResponder', middleware.requireUser,
  function(req, res, next) {
  var productId = req.body.productId;
  function getProductDetails(companyId, cb) {
    api.productProfile.getFirst({
      q: {
        _id: productId,
      }, }, req.session,
      function(err, productProfile) {
        if (err) {
          return cb(err);
        }else {
          cb(null, productProfile);
        }
      });
  }
  getProductDetails(productId, function(err, productProfile) {
      if (err) {
        return callback(err);
      }
      if (req.body.quickSupportResponderList !== undefined &&
        !(req.body.quickSupportResponderList instanceof Array)) {
        req.body.quickSupportResponderList =
        [req.body.quickSupportResponderList];
      }
      if (productProfile.quickSupportResponderList !== undefined &&
        productProfile.quickSupportResponderList.length > 0) {
        for (var resCount = 0;
          resCount < req.body.quickSupportResponderList.length;resCount++) {
          var id = req.body.quickSupportResponderList[resCount];
          (productProfile.quickSupportResponderList).push(id);
        }
      }else {
        productProfile.quickSupportResponderList =
        req.body.quickSupportResponderList;
      }
      var postData = {
        quickSupportResponderList: productProfile.quickSupportResponderList,
        admin: req.session._id,
      };
      api.productProfile.update(productProfile._id, postData, req.session,
        function(err, productProfile) {
          if (err) {
            return next(err);
          } else {
            res.redirect('/product/productSetting/' + productProfile._id);
          }
        });
    });
});
app.get('/getQuestionAfterInterval', middleware.requireUser,
  function(req, res, next) {
    api.quickSupportQuestions.getFirst({
    q: {
      operation: 'getAllQuestionByCondition',
    },
    select: '_id',
  }, req.session,
    function(err, question) {
      if (err) {
        return res.send(null);
      }else {
        return res.send(question);
      }
    });
  });
app.post('/removeProductResponder', middleware.requireUser,
  function(req, res, next) {
  var productId = req.body.productId;
  function getProductDetails(productId, cb) {
    api.productProfile.getFirst({
      q: {
        _id: productId,
      },
      select: 'quickSupportResponderList',
    }, req.session,
      function(err, productProfile) {
        if (err) {
          return cb(err);
        }else {
          cb(null, productProfile);
        }
      });
  }
  getProductDetails(productId, function(err, productProfile) {
      if (err) {
        return callback(err);
      }
      var index =
      productProfile.quickSupportResponderList.indexOf(req.body.responderId);
      if (index !== -1) {
        (productProfile.quickSupportResponderList).splice(index, 1);
        var postData = {
          quickSupportResponderList: productProfile.quickSupportResponderList,
          admin: req.session._id,
        };
        api.productProfile.update(productProfile._id, postData, req.session,
          function(err, productProfile) {
            if (err) {
              return next(err);
            } else {
              res.send(productProfile);
            }
          });
      }else {
        res.send(null);
      }
    });
});
module.exports = app;