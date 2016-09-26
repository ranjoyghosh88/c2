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

app.get('/', middleware.requireUser, function(req, res, next) {
});

app.post('/', middleware.requireUser, function(req, res, next) {
  api.qsCreate.create(req.body, function(err, result) {
    if (err) {
      next(err);
    }
    return res.redirect('/qsCreate/createProduct');
  });
});
app.get('/createDiscount', middleware.requireUser,
  function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
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
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    return res.render('pages/qscreate/createDiscount',
    {
      title: 'CSquire | Stripe Discount Create',
      activePage: 'stripeCouponCreate',
      stripeCouponList: results.stripeCouponList,
    });
  });
  });
// Create SKU section
app.get('/createSKU', middleware.requireUser,
  function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
    stripeAllSkuOfProductId: function(callback) {
      api.qsCreateSKU.getAll({
            q: {
              productId: req.query.productId,
              startingAfter: '',
              operation: 'stripeAllSkuOfProductId',
            },
          }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    getStripeProductDetails: function(callback) {
      api.qsCreateSKU.getAll({
            q: {
              productId: req.query.productId,
              operation: 'getProductDetails',
            },
          }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        console.log(JSON.stringify(data));
        callback(null, data);
      });
    },
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    if (req.query.skuCreate) {
      return res.render('pages/qscreate/createSKU',
      {
        title: 'CSquire | Stripe SKU Create',
        activePage: 'stripeSKUCreate',
        stripeAllSkuOfProductId: results.stripeAllSkuOfProductId,
        getStripeProductDetails: results.getStripeProductDetails,
        skuCreate: req.query.skuCreate,
      });
    } else {
      return res.render('pages/qscreate/createSKU',
      {
        title: 'CSquire | Stripe SKU Create',
        activePage: 'stripeSKUCreate',
        stripeAllSkuOfProductId: results.stripeAllSkuOfProductId,
        getStripeProductDetails: results.getStripeProductDetails,
      });
    }
  });
  });

app.get('/getSkuDetailsById/:skuName',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsCreateSKU.getAll({
    q: {
      skuName: req.params.skuName,
      operation: 'getSkuDetails',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      res.send(data);
    }
  });
});

app.post('/submitSKUCreate',
  middleware.requireUser, function(req, res, next) {
  var skuCreateData = req.body;
  var productId = req.body.productId;
  api.qsCreateSKU.create(skuCreateData, req.session,
    function(err, data) {
      if (err) {
        return res.send(err);
      } else {
        return res.send(data.product);
      }
    });
});
app.post('/updateSkuCreate',
  middleware.requireUser, function(req, res, next) {
  var skuUpdateData = req.body;
  var id = req.body.skuEditId;
  var pid = req.body.prodId;
  api.qsCreateSKU.update(id, skuUpdateData, req.session,
    function(err, data) {
      if (err) {
        return res.send(err);
      } else {
        return res.send(data.product);
      }
    });
});
// Coupon create Section
app.get('/createCoupon', middleware.requireUser,
  function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
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
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    return res.render('pages/qscreate/createCoupon',
    {
      title: 'CSquire | Stripe Coupon Create',
      activePage: 'stripeCouponCreate',
      stripeCouponList: results.stripeCouponList,
    });
  });
  });
app.post('/submitCouponCreate',
  middleware.requireUser, function(req, res, next) {
  var couponCreateData = req.body;
  api.qsCreateCoupon.create(couponCreateData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/qsCreate/createCoupon');
      }
    });
});

app.get('/getCouponuDetailsById/:couponId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsCreateCoupon.getAll({
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
// Product create section
app.get('/createProduct', middleware.requireUser,
  function(req, res, next) {
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
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    return res.render('pages/qscreate/createProduct',
    {
      title: 'CSquire | Stripe Product Create',
      activePage: 'stripeProductCreate',
      stripeProductList: results.stripeProductList,
      csquireServices: results.csquireServices,
    });
  });
  });
app.get('/getCsquireAttr/:selectedService', middleware.requireUser,
  function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
    csquireServices: function(callback) {
      api.qsMapping.getAll({
        q: {
          _id: req.params.selectedService,
          operation: 'getCsquireServiceList',
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
      csquireServices: results.csquireServices,
    });
  });
  });
app.get('/getProductDetailsById/:productVals',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsCreateProduct.getAll({
    q: {
      productId: req.params.productVals,
      operation: 'getProductDetails',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      res.send(data);
    }
  });
});
app.post('/submitProductCreate',
  middleware.requireUser, function(req, res, next) {
  var productCreateData = req.body;
  api.qsCreateProduct.create(productCreateData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/qsCreate/createProduct');
      }
    });
});
app.post('/updateProductCreate',
  middleware.requireUser, function(req, res, next) {
  var productUpdateData = req.body;
  var id = req.body.prosEditId;
  api.qsCreateProduct.update(id, productUpdateData, req.session,
    function(err, data) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/qsCreate/createProduct');
      }
    });
});
app.get('/getSKUListOfProductId/:productId',
  middleware.requireUser, function(req, res, next) {
  res.locals.loginData = req.session.user;
  api.qsCreateSKU.getAll({
    q: {
      productId: req.params.productId,
      operation: 'getProductDetails',
    },
  }, req.session, function(err, data) {
    if (err) {
      return next(err);
    }else {
      res.send(data);
    }
  });
});
app.get('/getProductDetailsByProductId/:productId',
  middleware.requireUser, function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
    getProductDetails: function(callback) {
      api.qsCreateSKU.getAll({
            q: {
              productId: req.params.productId,
              operation: 'getProductDetails',
            },
          }, req.session, function(err, data) {
        if (err) {
          return callback(err, null);
        }
        callback(null, data);
      });
    },
    stripeProductList: function(callback) {
      api.qsCreateSKU.getAll({
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
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.send({
      stripeProductList: results.stripeProductList,
      getProductDetails: results.getProductDetails,
    });
  });
  });

// Plan create Section
app.get('/createPlan', middleware.requireUser,
  function(req, res, next) {
    res.locals.loginData = req.session.user;
    async.parallel({
    stripePlanList: function(callback) {
      api.qsCreatePlan.getAll({
            q: {
              startingAfter: '',
              operation: 'getStripePlanList',
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
    return res.render('pages/qscreate/createPlan',
    {
      title: 'CSquire | Stripe Plan Create',
      activePage: 'stripePlanCreate',
      stripePlanList: results.stripePlanList,
    });
  });
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
app.post('/submitPlanCreate',
  middleware.requireUser, function(req, res, next) {
  var planCreateData = req.body;
  api.qsCreatePlan.create(planCreateData, req.session,
    function(err, data) {
      if (err) {
        return res.send(err);
      } else {
        return res.send(data);
      }
    });
});
app.post('/updatePlanCreate',
  middleware.requireUser, function(req, res, next) {
  var planUpdateData = req.body;
  var id = req.body.planEditId;
  api.qsCreatePlan.update(id, planUpdateData, req.session,
    function(err, data) {
      if (err) {
        return res.send(err);
      } else {
        return res.send(data);
      }
    });
});
module.exports = app;
