var cloudinary = require('cloudinary');
var _ = require('lodash');
var allRouter = '../routes/api';
var connectionRelationController = require(allRouter + '/connectionRelation/' +
  'controller');
var api = require('../routes/csquire-api/');
var async = require('async');
var queryParam = require('node-jquery-param');
var mongoose = require('mongoose');
exports.quickSupportDashboardCount = function(req, callback) {
  var obj = {
    operation: 'getCount',
    userId: req.session._id,
  };
  api.quickSupportQuestions.getAll({
    q: obj,
  }, req.session, function(err, results) {
    if (err) {
      return callback(err, null);
    }
    var qsQueueCount = [{
      heading: 'Questions',
      number: results.question,
      href: '/quickSupport/dashboard/questions?filterProfile=true',
    }, {
      heading: 'Answered',
      number: results.answered,
      href: '/quickSupport/dashboard/answered',
    }, {
      heading: 'Asked',
      number: results.asked,
      href: '/quickSupport/dashboard/asked',
    }, {
      heading: 'Feedback',
      number: results.feedback,
      href: '/quickSupport/dashboard/feedback',
    }, ];
    callback(null, qsQueueCount);
  });
};
exports.quickSupportCount = function(req, callback) {
  var obj = {
    operation: 'getCount',
    userId: req.session._id,
  };
  api.quickSupportQuestions.getAll({
    q: obj,
  }, req.session, function(err, results) {
    if (err) {
      return callback(err, null);
    }
    return callback(null, results);
  });
};
exports.quickSupportFeedbackQuestion = function(req, callback) {
  api.quickSupportQuestions.getAll({
    q: {
      operation: 'getFeedBackQuestion',
      userId: req.session._id,
    },
  }, req.session, function(err, questionList) {
    if (err) {
      return next(err);
    }
    callback(null, questionList);
  });
};
exports.quickSupportUpdate = function(qId, rId, qData, rData, req, callback) {
  async.parallel({
    quickSupportQuestions: function(cb) {
      api.quickSupportQuestions.update(qId,
        qData, req.session, function(err, res) {
        if (err) {
          return cb(err, null);
        }
        cb(null, res);
      });
    },
    responderHistory: function(cb) {
      api.quickSupportResponderHistorys.update
      (rId, rData, req.session, function(err, res) {
          if (err) {
            return cb(err, null);
          }
          cb(null, res);
        });
    },
  }, function(err, result) {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
exports.getAnswerbuttonactive = function(req, personalProfile, callback) {
  var finalResult = {};
  if (personalProfile.indvidualQuickSupportResponder ||
    personalProfile.indvidualQuickSupportResponder === undefined) {
    finalResult.indvidualResponder = true;
  }else {
    finalResult.indvidualResponder = false;
  }
  var currentCompanyId = personalProfile.company[0];
  if (currentCompanyId !== undefined) {
    var obj = {_id: currentCompanyId, quickSupportResponderList: {
        $in: [personalProfile._id],
      }, };
    api.companyProfile.getFirst({
      q: obj,
    }, req.session, function(err, data) {
      if (err) {
        return callback(err, null);
      }else {
        if (_.isEmpty(data)) {
          finalResult.companyResponder = false;
          callback(null, finalResult);
        }else {
          if (data.ownerId.profileId) {
            data.companyResponder = true;
          }else {
            data.companyResponder = false;
          }
          data.indvidualResponder = finalResult.indvidualResponder;
          callback(null, data);
        }
      }
    });
  }else {
    callback(null, finalResult);
  }
};
exports.filterQueue = function(req, callback) {
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
    },
    function(data, callback) {
      var productData = _.pluck(data.connections.products, 'refId');
      if (_.isEmpty(productData) && _.isEmpty(data.businessProcessAreas)) {
        return callback(null, []);
      }else if (_.isEmpty(productData)) {
        obj = {
          businessProcessArea: {
            $in: data.businessProcessAreas,
          },
          supportStatus: {
            $nin: ['Locked', 'pending', 'completed', 'closed'],
          },
          createdBy: {$nin: req.session._id},
        };
      } else {
        obj = {
          $or: [{
            product: {
              $in: productData,
            },
          }, {
            businessProcessArea: {
              $in: data.businessProcessAreas,
            },
          }, ],
          supportStatus: {
              $nin: ['Locked', 'pending', 'completed', 'closed'],
            },
          createdBy: {$nin: req.session._id},
        };
      }
      obj.operation = 'getAllQuestionByCondition';
      api.quickSupportQuestions.getAll({
          q: obj,
        }, req.session, function(err, data) {
          if (err) {
            return callback(err, null);
          } callback(null, data);
        });
    }, ],
        function(err, results) {
    if (err) {
      return callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
exports.quickSupportFilterbyPif = function(req, callback) {
  var orCondition = [];
  if (req.query.product !== undefined &&
    !(req.query.product instanceof Array)) {
    req.query.product = [req.query.product];
  }
  if (req.query.tags !== undefined &&
    !(req.query.tags instanceof Array)) {
    req.query.tags = [req.query.tags];
  }
  if (req.query.industry === undefined) {
    req.query.industry = '';
  }else {
    var industry = parseInt(req.query.industry);
  }
  if (req.query.businessProcessArea !== undefined) {
    req.query.businessProcessArea = parseInt(req.query.businessProcessArea);
  }else {
    req.query.businessProcessArea = '';
  }
  if (req.query.andorFlag === 'and' &&
      req.query.industry !== '' &&
      req.query.businessProcessArea !== '') {
    orCondition = {
      $or:
      [
        {product: {$in: req.query.product}, },
        { tags: {$in: req.query.tags}, },
        {
          $and:
              [
                  {businessProcessArea: req.query.businessProcessArea},
                  {industry: req.query.industry},
              ],
        },
      ],
      supportStatus: {
        $nin: ['Locked', 'pending', 'completed', 'closed'],
      },
      createdBy: {$nin: req.session._id},
      operation: 'getAllQuestionByCondition',
    };
  }else {
    orCondition = {$or: [{product: {$in: req.query.product}, },
        { businessProcessArea: req.query.businessProcessArea},
        { tags: {$in: req.query.tags}, },
        { industry: industry}, ],
      supportStatus: {
        $nin: ['Locked', 'pending', 'completed', 'closed'],
      }, createdBy: {$nin: req.session._id},
      operation: 'getAllQuestionByCondition',
    };
  }
  api.quickSupportQuestions.getAll({
    q: orCondition,
  }, req.session, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    callback(null, data);
  });
};
exports.filterAnswerTab = function(req, callback) {
  var queryData = '';
  if (req.query.status === '1') {
    objStaus = 'completed';
  }else if (req.query.status === '2') {
    objStaus = 'closed';
  }else {
    objStaus = { $in: ['completed', 'closed'] };
  }
  if (req.query.startDate !== '' && req.query.endDate !== '') {
    var startDate = new Date(req.query.startDate);
    var endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);
    var dateData = {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    };
    if (objStaus === '') {
      queryData = {
        userId: req.session._id,
        lastupdateDate: dateData,
      };
    }else {
      queryData = {
        userId: req.session._id,
        status: objStaus,
        lastupdateDate: dateData,
      };
    }
  }else {
    queryData = {
      userId: req.session._id,
      status: objStaus,
    };
  }
  api.quickSupportResponderHistorys.getAll({
      q: queryData,
    }, req.session, function(err, data) {
      if (err) {
        return callback(err, null);
      }else {
        var totalPayment = 0;
        if (data.length > 0) {
          var questionIds = _.pluck(data, 'qsQuestionId');
          if (questionIds.length > 0) {
            api.quickSupportQuestions.getAll({
              q: {
                operation: 'getAllQuestionByCondition',
                _id: {$in: questionIds},
              },
            }, req.session, function(err, questionList) {
              if (err) {
                return next(err);
              }
              refineAnswerdTabResult(data, questionList, callback);
            });
          }else {
            callback(null, data);
          }
        }else {
          callback(null, data);
        }
      }
    });
};
function refineAnswerdTabResult(quickSupportResponderQuestion,
  questions, callback) {
  var totalPayment = 0;
  _.each(quickSupportResponderQuestion, function(ques) {
    var quest = _.filter(questions, { _id: ques.qsQuestionId });
    ques.qsQuestionId = quest[0];
    if (ques.status === 'completed') {
      totalPayment += 19;
    }
  });
  quickSupportResponderQuestion.totalPayment = totalPayment;
  callback(null, quickSupportResponderQuestion);
}
exports.quickSupportQueue = function(req, callback) {
  async.parallel({
    getAnswerbuttonactive: function(callback) {
      exports.getAnswerbuttonactive(req, function(err, data) {
        if (err) {
          return callback(err, null);
        } else {
          callback(null, data);
        }
      });
    },
    quickSupportQuestions: function(callback) {
      api.quickSupportQuestions.getAll({
        q: {},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } callback(null, data);
      });
    },
    lockedQuestion: function(callback) {
      api.quickSupportResponderHistorys.getAll({
        q: {
          userId: req.session._id,
          status: 'locked',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } callback(null, data);
      });
    },
    expertLockedQuestion: function(callback) {
      api.quickSupportQuestions.getAll({
        q: {
          createdBy: req.session._id,
          supportStatus: 'Locked',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } callback(null, data);
      });
    },
    quickSupportResponderHistorysAll: function(callback) {
      api.quickSupportResponderHistorys.getAll({
        q: {
          userId: req.session._id,
          status: { $in: ['completed', 'closed'] },
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } callback(null, data);
      });
    },
    quickSupportResponderPendingList: function(callback) {
      api.quickSupportResponderHistorys.getAll({
        q: {
          _id: req.session._id,
          pendingFeedback: true,
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        } callback(null, data);
      });
    },
    quickSupportUserSkillQuestion: function(callback) {
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
        },
        function(data, callback) {
          var productData = _.pluck(data.connections.products, 'refId');
          if (_.isEmpty(productData) && _.isEmpty(data.businessProcessAreas)) {
            return callback(null, []);
          }else if (_.isEmpty(productData)) {
            obj = {
              businessProcessArea: {
                $in: data.businessProcessAreas,
              },
              supportStatus: {
                  $nin: ['Locked', 'pending', 'completed', 'closed'],
                }, createdBy: {$nin: req.session._id},
            };
          } else {
            obj = {
              $or: [{
                product: {
                  $in: productData,
                },
              }, {
                businessProcessArea: {
                  $in: data.businessProcessAreas,
                },
              }, ],
              supportStatus: {
                  $nin: ['Locked', 'pending', 'completed', 'closed'],
                }, createdBy: {$nin: req.session._id},
            };
          }
          api.quickSupportQuestions.getAll({
              q: obj,
            }, req.session, function(err, data) {
              if (err) {
                return callback(err, null);
              } callback(null, data);
            });
        }, ],
            function(err, results) {
              if (err) {
                return callback(err, null);
              } else {
                callback(null, results);
              }
            });
    },
  },
        function(err, results) {
    if (err) {
      return callback(err, null);
    } else {
      var combine = allquestionFilter(results, req.session._id);
      results.askedTab = combine.asked;
      var qsQueueCount = [/*{
          heading: 'Waiting',
          number: results.expertLockedQuestion.length,
          href: '/quickSupport/dashboard/waiting',
        }, */{
          heading: 'Questions',
          number: results.quickSupportUserSkillQuestion.length,
          href: '/quickSupport/dashboard/questions?filterProfile=true',
        }, {
          heading: 'Answered',
          number: results.quickSupportResponderHistorysAll.length,
          href: '/quickSupport/dashboard/answered',
        }, {
          heading: 'Asked',
          number: results.askedTab.length,
          href: '/quickSupport/dashboard/asked',
        }, {
          heading: 'Feedback',
          number: results.quickSupportResponderPendingList.length,
          href: '/quickSupport/dashboard/feedback',
        }, ];
      results.qsQueueCount = qsQueueCount;
      results.dataQuestion = combine.lasDataFinal.reverse();
      var getAllquestion = results.quickSupportQuestions;
      _.each(results.quickSupportResponderPendingList, function(ques) {
        var quest = _.filter(getAllquestion, { _id: ques.qsQuestionId });
        ques.questionFullPath = quest;
      });
      results.pendingList = results.quickSupportResponderPendingList;
      var totalPayment = 0;
      _.each(results.quickSupportResponderHistorysAll, function(ques) {
        var quest = _.filter(getAllquestion, { _id: ques.qsQuestionId });
        ques.questionFullPath = quest;
        if (ques.status === 'completed') {
          totalPayment += 10;
        }
      });
      results.totalPayment = totalPayment;
      callback(null, results);
    }
  });
};


var allquestionFilter = function(results, id) {
  var finalData = _.partition(results.quickSupportQuestions, {
        supportStatus: 'Locked',
      });
  var finalDataRemovePending = _.partition(finalData[1], {
        supportStatus: 'pending',
      });
  var finalDataRemoveClosed = _.partition(finalDataRemovePending[1], {
        supportStatus: 'closed',
      });
  var lasDataFinal = _.partition(finalDataRemoveClosed[1],
  { supportStatus: 'completed' });


  var askedTab = results.quickSupportQuestions;
  var finalAsked = [];
  _.each(askedTab, function(ques) {
    if (ques.createdBy !== null) {
      if (ques.createdBy._id === id) {
        finalAsked.push(ques);
      }
    }
  });
  var removeUserLoginQuestion = [];
  _.each(lasDataFinal[1], function(ques) {
    if (ques.createdBy !== null) {
      if (ques.createdBy._id !== id) {
        removeUserLoginQuestion.push(ques);
      }
    }
  });
  var combine = {
    asked: finalAsked,
    lasDataFinal: removeUserLoginQuestion,
  };

  return combine;
};