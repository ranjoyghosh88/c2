var express = require('express');
var app = express.Router();
var middleware = require('../middleware');
var async = require('async');
var requireDir = require('require-dir');
var querystring = require('querystring');
var requestify = require('requestify');
var _ = require('lodash');
var api = require('../../routes/csquire-api/');
var _ = require('lodash');

app.get('/', middleware.requireUser,
  function(req, res, next) {
  res.locals.tab = 'productMapping';
  res.locals.loginData = req.session.user;
  async.parallel({
    csquireServices: function(callback) {
      api.qsMapping.getAll({
        q: {operation: 'getCsquireServiceList'},
        order: {name: 1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    stripeProductList: function(callback) {
      api.qsMapping.getAll({
        q: {
          startingAfter: '',
          operation: 'getStripeProductList',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    csquireProductMapping: function(callback) {
      if (req.query.csquireService &&
        req.query.csquireService !== '0') {
        query = {
          q: {
            csquireService: parseInt(req.query.csquireService),
            operation: 'getCsquireProductMapping',
          },
          order: {createdDate: -1},
        };
      }else {
        query = {
          q: {operation: 'getCsquireProductMapping'},
          order: {createdDate: -1},
        };
      }
      api.csquireStripeProductMapping.getAll(query,
        req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    if (req.query.csquireService) {
      res.locals.isServiceFilter = true;
      var selectedFilter =
           _.filter(results.csquireServices, _.matches({
             _id: parseInt(req.query.csquireService),
           }));
      (function() {
        res.locals.serviceFilterArray = null;
        if (selectedFilter.length > 0) {
          res.locals.serviceFilterArray = selectedFilter[0];
        }
      })();
    }
    if (req.query && req.query.isEdited === 'true') {
      res.locals.isMappingEdit = true;
      var productMappingData =
           _.filter(results.csquireProductMapping, _.matches({
             _id: req.query.productMapping,
           }));
      if (productMappingData.length > 0) {
        res.locals.productMappingData = productMappingData[0];
        skusListOfProductIds(req, productMappingData[0].stripeProductId,
          results, function(err, results) {
          return res.render('pages/qsmapping/productMapping',
          {
            title: 'CSquire | Stripe Mapping',
            activePage: 'stripeMapping',
            stripeProductList: results.stripeProductList,
            csquireServices: results.csquireServices,
            productMappingList: results.csquireProductMapping,
            skusListOfProductId: results.skusListOfProductId,
          });
        });
      }else {
        return next('No matching product mapping');
      }
    }else {
      qsProductMapping(results, req, function(err, results) {
        return res.render('pages/qsmapping/productMapping',
        {
          title: 'CSquire | Stripe Mapping',
          activePage: 'stripeMapping',
          stripeProductList: results.stripeProductList,
          csquireServices: results.csquireServices,
          productMappingList: results.csquireProductMapping,
        });
      });
    }
  });
});
var skusListOfProductIds = function(req, stripeProductId, results, callback) {
  api.qsMapping.getAll({
    q: {
        product: stripeProductId,
        startingAfter: '',
        operation: 'getStripeSKUList',
      },
  }, req.session, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    if (results.stripeProductList.length > 0 &&
    results.csquireProductMapping.length > 0) {
      for (var iIndex = 0; iIndex < results.csquireProductMapping.length;) {
        var stripeProduct =
        _.filter(results.stripeProductList, _.matches({
           id: results.csquireProductMapping[iIndex].stripeProductId,
         }));
        if (stripeProduct &&
          stripeProduct.length > 0 && stripeProduct[0]) {
          results.csquireProductMapping[iIndex].StripeProductName =
          stripeProduct[0].name;
        }
        iIndex++;
      }
    }
    results.skusListOfProductId = data;
    callback(null, results);
  });
};

var qsProductMapping = function(results, req, cb) {
  if (results.stripeProductList.length > 0 &&
    results.csquireProductMapping.length > 0) {
    for (var iIndex = 0; iIndex < results.csquireProductMapping.length;) {
      var stripeProduct =
      _.filter(results.stripeProductList, _.matches({
         id: results.csquireProductMapping[iIndex].stripeProductId,
       }));
      if (stripeProduct &&
        stripeProduct.length > 0 && stripeProduct[0]) {
        results.csquireProductMapping[iIndex].StripeProductName =
        stripeProduct[0].name;
      }
      iIndex++;
    }
  }
  cb(null, results);
};

app.get('/personalProfile', middleware.requireUser, function(req, res, next) {
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: '^' + req.query.q,
          $options: 'i',
        },
        email: { $ne: 'guest@user.com' },
      },
    };
  }else {
    query = {
      q: {
        email: { $ne: 'guest@user.com' },
      },
    };
  }
  api.personalProfile.getAll(query, req.session, function(err, data) {
    if (err) {
      return next(err);
    }
    res.send(data);
  });
});

app.get('/companyProfile', middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: '^' + req.query.q,
          $options: 'i',
        },
        uid: { $ne: 'unknown' },
      },
    };
  }else {
    query = {
      q: {
        uid: { $ne: 'unknown' },
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

app.get('/productProfile', middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  var query = req.query;
  if (typeof (req.query.q) === 'string') {
    query = {
      q: {
        name: {
          $regex: '^' + req.query.q,
          $options: 'i',
        },
        uid: { $ne: 'unknown' },
      },
    };
  }else {
    query = {
      q: {
        uid: { $ne: 'unknown' },
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

app.post('/submitProductMapping',
  middleware.requireUser, function(req, res, next) {
  var productMappingData = req.body;
  if (productMappingData.defaultService ||
    productMappingData.editDefaultService) {
    delete productMappingData.defaultService;
    productMappingData.isDefaultForCsquireService = true;
    if (productMappingData.isDefaultForCsquireService) {
      if (productMappingData.csquireCompanyProfiles) {
        delete productMappingData.csquireCompanyProfiles;
      }
      if (productMappingData.csquirePersonalProfiles) {
        delete productMappingData.csquirePersonalProfiles;
      }
    }
  }else {
    productMappingData.isDefaultForCsquireService = false;
  }
  api.csquireStripeProductMapping.create(productMappingData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        if (data.status === 'already_exists') {
          return res.send(data);
        }else {
          return res.redirect('/qsmapping');
        }
      }
    });
});
app.post('/editProductMapping',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  var productMappingData = req.body;
  var mappingId = productMappingData.mappingId;
  delete productMappingData.mappingId;
  if (productMappingData.isDefaultForCsquireService === 'true') {
    productMappingData.isDefaultForCsquireService = true;
  }else {
    productMappingData.isDefaultForCsquireService = false;
  }
  api.csquireStripeProductMapping.update
  (mappingId, productMappingData, req.session, function(err, results) {
      if (err) {
        return next(err);
      }else {
        if (results.status === 'already_exists') {
          return res.send(results);
        }else {
          return res.redirect('/qsmapping');
        }
      }
    });
});

app.post('/submitReferralMapping',
  middleware.requireUser, function(req, res, next) {
  var referralMappingData = req.body;
  if (referralMappingData.defaultService ||
    referralMappingData.editDefaultService) {
    delete referralMappingData.defaultService;
    referralMappingData.isDefaultForCsquireService = true;
    if (referralMappingData.isDefaultForCsquireService) {
      if (referralMappingData.csquireCompanyProfiles) {
        delete referralMappingData.csquireCompanyProfiles;
      }
      if (referralMappingData.csquirePersonalProfiles) {
        delete referralMappingData.csquirePersonalProfiles;
      }
    }
  }else {
    referralMappingData.isDefaultForCsquireService = false;
  }
  api.csquireStripeReferralMapping.create(referralMappingData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        if (data.status === 'already_exists') {
          return res.send(data);
        }else {
          return res.redirect('/qsmapping/referralMapping');
        }
      }
    });
});

app.get('/deleteProductMapping/:mappingId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.csquireStripeProductMapping.delete
    (req.params.mappingId, req.session, function(err, results) {
      if (err) {
        res.render('pages/qsmapping/qsMappingError', {
          title: 'CSquire | Quick Support',
          Message: 'Error in deleting mapping.',
        });
      }else {
        return res.redirect('/qsmapping');
      }
    });
});


app.get('/deletePlanMapping/:serviceId/:planId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  query = {
    q: {
      serviceId: parseInt(req.params.serviceId),
      planId: req.params.planId,
      operation: 'removePlansMapping',
    },
  };
  api.csquireStripePlanMapping.getAll(query,
    req.session, function(err, dataDelete) {
    if (err) {
      res.render('pages/qsmapping/qsMappingError', {
        title: 'CSquire | Quick Support',
        Message: 'Error in deleting plan mapping.',
      });
    }else {
      return res.redirect('/qsmapping/planMapping');
    }
  });
});

app.get('/referralMapping', middleware.requireUser,
  function(req, res, next) {
  res.locals.tab = 'referralMapping';
  res.locals.loginData = req.session.user;
  async.parallel({
    stripeProductList: function(callback) {
      api.qsMapping.getAll({
        q: {
          startingAfter: '',
          operation: 'getStripeProductList',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    getCouponList: function(callback) {
      api.qsMapping.getAll({
        q: {
          startingAfter: '',
          operation: 'getStripeCouponList',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    getCsquireReferralMapping: function(callback) {
      query = {
        q: {operation: 'getCsquireReferralMapping'},
        order: {createdDate: -1},
      };
      api.csquireStripeReferralMapping.getAll(query,
        req.session, function(err, data) {
          console.log('getCsquireReferralMapping', err);
          if (err) {
            return callback(err, null);
          }
          callback(null, data);
        });
    },
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    if (req.query && req.query.isEdited === 'true') {
      res.locals.isMappingEdit = true;
      var referralMappingData =
           _.filter(results.getCsquireReferralMapping, _.matches({
             _id: req.query.referralMapping,
           }));
      if (referralMappingData.length > 0) {
        res.locals.referralMappingData = referralMappingData[0];
        referralSkusListOfProductIds(req,
          referralMappingData[0].stripeProductId,
          results, function(err, results) {
          return res.render('pages/qsmapping/productMapping',
          {
            title: 'CSquire | Stripe Mapping',
            activePage: 'stripeMapping',
            stripeCouponList: results.getCouponList,
            csquireServices: results.csquireServices,
            stripeProductList: results.stripeProductList,
            referralMappingList: results.getCsquireReferralMapping,
            skusListOfProductId: results.skusListOfProductId,
          });
        });
      }else {
        return next('No matching product mapping');
      }
    }else {
      return res.render('pages/qsmapping/productMapping',
      {
        title: 'CSquire | Stripe Mapping',
        activePage: 'stripeMapping',
        stripeCouponList: results.getCouponList,
        csquireServices: results.csquireServices,
        stripeProductList: results.stripeProductList,
        referralMappingList: results.getCsquireReferralMapping,
      });
    }
  });
});
var referralSkusListOfProductIds =
function(req, stripeProductId, results, callback) {
  api.qsMapping.getAll({
    q: {
        product: stripeProductId,
        startingAfter: '',
        operation: 'getStripeSKUList',
      },
  }, req.session, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    results.skusListOfProductId = data;
    callback(null, results);
  });
};
// Delete referral Mapping
app.get('/deleteReferralMapping/:mappingId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.csquireStripeReferralMapping.delete
    (req.params.mappingId, req.session, function(err, results) {
      if (err) {
        res.render('pages/qsmapping/qsMappingError', {
          title: 'CSquire | Quick Support',
          Message: 'Error in deleting mapping.',
        });
      }else {
        return res.redirect('/qsmapping/referralMapping');
      }
    });
});

// Edit referral mappping
app.post('/editReferralMapping',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  var productMappingData = req.body;
  var mappingId = productMappingData.mappingId;
  delete productMappingData.mappingId;
  if (productMappingData.isDefaultForCsquireService === 'true') {
    productMappingData.isDefaultForCsquireService = true;
  }else {
    productMappingData.isDefaultForCsquireService = false;
  }
  api.csquireStripeReferralMapping.update
  (mappingId, productMappingData, req.session, function(err, results) {
      if (err) {
        return next(err);
      }else {
        if (results.status === 'already_exists') {
          return res.send(results);
        }else {
          return res.redirect('/qsmapping/referralMapping');
        }
      }
    });
});

function dollarformat(num) {
  var conv = num / 100;
  return '$' + conv.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

// For coupon mapping section
app.get('/couponMapping', middleware.requireUser,
  function(req, res, next) {
    res.locals.tab = 'couponMapping';
    res.locals.loginData = req.session.user;
    async.parallel({
    csquireServices: function(callback) {
      api.qsMapping.getAll({
        q: {operation: 'getCsquireServiceList'},
        order: {name: 1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    stripeCouponList: function(callback) {
      api.qsMapping.getAll({
            q: {
              startingAfter: '',
              operation: 'getStripeCouponList',
            },
          }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    csquireCouponMapping: function(callback) {
      if (req.query.csquireService) {
        query = {
          q: {
            csquireService: parseInt(req.query.csquireService),
            operation: 'getCsquireCouponMapping',
          },
          order: {createdDate: -1},
        };
      }else {
        query = {
          q: {operation: 'getCsquireCouponMapping'},
          order: {createdDate: -1},
        };
      }
      api.csquireStripeCouponMapping.getAll(query,
        req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    if (req.query.csquireService) {
      res.locals.isServiceFilter = true;
      var selectedFilter =
         _.filter(results.csquireServices, _.matches({
           _id: parseInt(req.query.csquireService),
         }));
      if (selectedFilter.length > 0) {
        res.locals.serviceFilterArray = selectedFilter[0];
      }else {
        res.locals.serviceFilterArray = null;
      }
    }
    if (req.query && req.query.isduplicate === 'true') {
      res.locals.isMappingEdit = true;
      var couponMappingData =
         _.filter(results.csquireCouponMapping, _.matches({
           _id: req.query.productMapping,
         }));
      if (couponMappingData.length > 0) {
        res.locals.couponMappingData = couponMappingData[0];
      }else {
        return next('No matching coupon mapping');
      }
    }
    return res.render('pages/qsmapping/productMapping',
    {
      title: 'CSquire | Stripe Mapping',
      activePage: 'stripeMapping',
      stripeCouponList: results.stripeCouponList,
      csquireServices: results.csquireServices,
      couponMappingList: results.csquireCouponMapping,
    });
  });
  });

app.post('/submitCouponMapping',
  middleware.requireUser, function(req, res, next) {
  var couponMappingData = req.body;
  couponMappingData.isDefaultForCsquireService = false;
  api.csquireStripeCouponMapping.create(couponMappingData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        if (data.status === 'already_exists') {
          return res.send(data);
        }else {
          return res.redirect('/qsMapping/couponMapping');
        }
      }
    });
});

app.get('/deleteCouponMapping/:mappingId',
  middleware.requireUser, function(req, res, next) {
    res.locals.loginData = req.session.user;
    api.csquireStripeCouponMapping.delete
      (req.params.mappingId, req.session, function(err, results) {
        if (err) {
          res.render('pages/qsmapping/couponMapping/qsMappingError', {
            title: 'CSquire | Quick Support',
            Message: 'Error in deleting mapping.',
          });
        }else {
          return res.redirect('/qsMapping/couponMapping');
        }
      });
  });

// Get SKUS list for product id
app.get('/getSKUSListOfProductIdApi/:productID', middleware.requireUser,
  function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
    skusListOfProductId: function(callback) {
      api.qsMapping.getAll({
            q: {
              product: req.params.productID,
              startingAfter: '',
              operation: 'getStripeSKUList',
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
    if (err) {
      return next(err);
    }
    return res.send({
      skusListOfProductId: results.skusListOfProductId,
    });
  });
  });

// Get coupon details
app.get('/getCouponuDetailsById/:couponId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsMapping.getAll({
    q: {
      couponId: req.params.couponId,
      operation: 'getCouponDetails',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      res.send(data);
    }
  });
});

// Get coupon sku details
app.get('/getCouponSkuDetails/:couponId/:skuId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  async.parallel({
    getCouponDetails: function(callback) {
      api.qsMapping.getAll({
        q: {
          couponId: req.params.couponId,
          operation: 'getCouponDetails',
        },
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    getSkuDetails: function(callback) {
      api.qsMapping.getAll({
        q: {
          skuId: req.params.skuId,
          operation: 'getSkuDetails',
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
    if (err) {
      return next(err);
    }
    results.getSkuDetails.price = dollarformat(results.getSkuDetails.price);
    res.send(results);
  });
});

// Get sku details
app.get('/getSkuDetails/:skuId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsMapping.getAll({
    q: {
      skuId: req.params.skuId,
      operation: 'getSkuDetails',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      data.price = dollarformat(data.price);
      res.send(data);
    }
  });
});

// Get coupon sku details
app.get('/planMapping',
  middleware.requireUser, function(req, res, next) {
  res.locals.tab = 'planMapping';
  res.locals.loginData = req.session.user;
  async.parallel({
    csquireServices: function(cb) {
      api.qsMapping.getAll({
        q: {operation: 'getCsquireServiceList'},
        order: {name: 1},
      }, req.session, function(err, data) {
        if (err) {
          return cb(err, null);
        }
        cb(null, data);
      });
    },
    stripePlanList: function(cb) {
      api.csquireStripePlanMapping.getAll({
        q: {
          operation: 'getStripePlanList',
        },
      }, req.session, function(err, planList) {
        if (err) {
          return cb(err, null);
        }
        return cb(null, planList);
      });
    },
    csquirePlanMapping: function(callback) {
      if (req.query.csquireService &&
        req.query.csquireService !== '0') {
        query = {
          q: {
            csquireService: parseInt(req.query.csquireService),
            operation: 'getPlanMappingList',
          },
          order: {csquireService: -1},
        };
      }else {
        query = {
          q: {operation: 'getPlanMappingList'},
          order: {csquireService: -1},
        };
      }
      api.csquireStripePlanMapping.getAll(query,
        req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    subscribedPlan: function(callback) {
      api.subscription.getAll({
        q: {operation: 'getAllSubscribedPlanList', },
        order: {csquireService: 1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    if (req.query.csquireService) {
      res.locals.isServiceFilter = true;
      var selectedFilter =
           _.filter(results.csquireServices, _.matches({
             _id: parseInt(req.query.csquireService),
           }));
      (function() {
        res.locals.serviceFilterArray = null;
        if (selectedFilter.length > 0) {
          res.locals.serviceFilterArray = selectedFilter[0];
        }
      })();
    }
    return res.render('pages/qsmapping/productMapping',
    {
      title: 'CSquire | Stripe Mapping',
      activePage: 'stripeMapping',
      stripePlanList: results.stripePlanList,
      csquireServices: results.csquireServices,
      planMappingList: results.csquirePlanMapping,
      subscribedPlan: results.subscribedPlan,
    });
  });
});
app.post('/submitPlanMapping',
  middleware.requireUser, function(req, res, next) {
  var planMappingData = req.body;
  console.log(planMappingData);
  if (planMappingData.action && planMappingData.action === 'edit') {
    api.csquireStripePlanMapping.getAll({
      q: {
        operation: 'updateMapping',
        body: planMappingData,
      },
    }, req.session, function(err, planList) {
      if (err) {
        return next(err);
      }
      return res.redirect('/qsmapping/planMapping');
    });
  }else {
    api.csquireStripePlanMapping.create(planMappingData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        if (data.status === 'already_exists') {
          return res.send(data);
        }else {
          return res.redirect('/qsmapping/planMapping');
        }
      }
    });
  }
});
app.get('/getPlanDetailsById/:planId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsCreatePlan.getAll({
    q: {
      planId: req.params.planId,
      operation: 'getPlanDetails',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      res.send(data);
    }
  });
});
// Edit plan Mapping
app.get('/editPlanMapping/:csquireService/:planId',
  middleware.requireUser, function(req, res, next) {
  res.locals.tab = 'planMapping';
  res.locals.loginData = req.session.user;
  res.locals.isMappingEdit = true;
  async.parallel({
    csquireServices: function(cb) {
      api.qsMapping.getAll({
        q: {operation: 'getCsquireServiceList'},
        order: {name: 1},
      }, req.session, function(err, data) {
        if (err) {
          return cb(err, null);
        }
        cb(null, data);
      });
    },
    stripePlanList: function(cb) {
      api.csquireStripePlanMapping.getAll({
        q: {
          operation: 'getStripePlanList',
        },
      }, req.session, function(err, planList) {
        if (err) {
          return cb(err, null);
        }
        return cb(null, planList);
      });
    },
    csquirePlanMapping: function(callback) {
      if (req.query.csquireService &&
        req.query.csquireService !== '0') {
        query = {
          q: {
            csquireService: parseInt(req.query.csquireService),
            operation: 'getPlanMappingList',
          },
          order: {csquireService: -1},
        };
      }else {
        query = {
          q: {operation: 'getPlanMappingList'},
          order: {csquireService: -1},
        };
      }
      api.csquireStripePlanMapping.getAll(query,
        req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    subscribedPlan: function(callback) {
      api.subscription.getAll({
        q: {operation: 'getAllSubscribedPlanList', },
        order: {csquireService: 1},
      }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    editPlan: function(callback) {
      api.csquireStripePlanMapping.getAll({
        q: {
          operation: 'getPlanMappingList',
          planId: req.params.planId,
          csquireService: req.params.csquireService,
        },
      }, req.session, function(err, planList) {
        if (err) {
          return callback(err, null);
        }
        if (planList && planList.length > 0) {
          planList = planList[0];
        }
        return callback(null, planList);
      });
    },
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    if (req.query.csquireService) {
      res.locals.isServiceFilter = true;
      var selectedFilter =
           _.filter(results.csquireServices, _.matches({
             _id: parseInt(req.query.csquireService),
           }));
      (function() {
        res.locals.serviceFilterArray = null;
        if (selectedFilter.length > 0) {
          res.locals.serviceFilterArray = selectedFilter[0];
        }
      })();
    }
    return res.render('pages/qsmapping/productMapping',
    {
      title: 'CSquire | Stripe Mapping',
      activePage: 'stripeMapping',
      stripePlanList: results.stripePlanList,
      editPlan: results.editPlan,
      csquireServices: results.csquireServices,
      planMappingList: results.csquirePlanMapping,
      subscribedPlan: results.subscribedPlan,
    });
  });
});
module.exports = app;