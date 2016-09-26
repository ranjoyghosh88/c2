/**
 * GET     /productProfile             ->  index
 * POST    /productProfile              ->  create
 * GET     /productProfile/:id          ->  show
 * PUT     /productProfile/:id          ->  update
 * DELETE  /productProfile/:id          ->  destroy
 */
var _ = require('lodash');
var utils = require('../../../models/util');
var productProfile = require('../../../models/productProfile');
var opts = [
  { path: 'CSquire.company', select: '_id CSquire.name' },
  { path: 'intendedFor' },
  { path: 'company' },
  { path: 'goodFor' },
  {
    path: 'followers.profiles',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  },
  {
    path: 'connections.profiles.refId',
    match: { accountStatus: utils.EnumAccountStatus.ENABLED },
    model: 'personalProfile',
  },
  {
    path: 'connections.companies.refId',
    model: 'companyProfile',
  },
  {
    path: 'connections.products.refId',
    model: 'productProfile',
  },
];
// Get list of productprofiles
/*exports.index = function(req, res) {
  productProfile.find(function(err, productprofiles) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(201, productprofiles);
  });
};*/
// Get list of companyprofiles
exports.index = function(req, res, next) {
  productProfile.find(function(err, productprofiles) {
    if (err) { return handleError(res, err); }
    if (req.xhr) {
      return res.json(productprofiles);
    } else {
      res.locals.productprofiles = productprofiles;
      next();
    }
  });
};
// Get a single productProfile
exports.show = function(req, res) {
  productProfile.findById(req.params.id, function(err, productprofile) {
    productProfile.populate(productprofile,
        opts,
            function(err, productprofile) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, productprofile);
    });
  });
};
// Creates a new productprofile in the DB.
exports.createAPI = function(data, cb) {
  console.log('############');
  console.log(data);
  productProfile.create(data, function(err, data) {
    console.log('=====');
    console.log(data);
    if (data) {
      // = global.MasterCollection.products.push(data);
      // = global.MasterCollection.productsDic[data._id] = data;
    }
    cb(err, data);
  });
};

exports.create = function(req, res) {
  productProfile.create(req.body, function(err, productprofile) {
    productProfile.populate(productprofile, opts,
            function(err, productprofile) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(201, productprofile);
    });
  });
};
exports.findByName = function(nm, cb) {
  productProfile.findOne({ name: nm.toLowerCase() }, cb);
};
exports.createProduct = function(req, cb) {
  productProfile.create(req.body, function(err, productprofile) {
    productProfile.populate(productprofile, opts,
            function(err, productprofile) {
      if (err) {
        return cb(null);
      }
      return cb(productprofile);
    });
  });
};

exports.getProductById = function(req, cb) {
  productProfile.findById(req.params.id, function(err, profile) {
    productProfile.populate(profile, opts, function(err, profile) {
      if (err) {
        return cb(null);
      }
      return cb(profile);
    });
  });
};
exports.addDemo = function(id, demo, cb) {
  productProfile.findByIdAndUpdate(id, { $push: { demo: demo } }, cb);
};
exports.removeDemo = function(id, demoId, cb) {
  productProfile.findByIdAndUpdate(id,
   { $pull: { demo: { _id: demoId } } }, cb);
};
exports.updateProdProfileById = function(prodProfile, id, cb) {
  if (prodProfile._id) {
    delete prodProfile._id;
  }
  console.log('id=' + id);
  productProfile.findOne({ _id: id },
     function(err, profile) {
    console.log(err);
    console.log(profile);
    if (err) {
      return cb(err, null);
    }
    if (!profile) {
      return cb(err, null);
    }
    var updated = _.merge(profile, prodProfile);
    profile = updated;
    profile.markModified('admin');
    profile.markModified('intendedFor');
    profile.markModified('goodFor');
    console.log(profile);
    profile.save(function(err, data) {
      console.log('profile updated===');
      console.log(err);
      if (err) {
        return cb(err, null);
      }
      return cb(null, data);
    });
  });
};

exports.getProductByUId = function(req, cb) {
  productProfile.findOne({ uid: req.params.uid }, function(err, profile) {
    productProfile.populate(profile, opts, function(err, profile) {
      if (err) {
        return cb(null);
      }
      return cb(profile);
    });
  });
};
exports.getProfileByUId = function(req, cb) {
  productProfile.findOne({
    uid: req.params.uid,
  }, function(err, profile) {
    productProfile.populate(profile, opts, function(err, profile) {
      if (err) {
        return cb(null);
      }
      return cb(profile);
    });
  });
};

// Updates an existing productProfile in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  productProfile.findById(req.params.id, function(err, productprofile) {
    if (err) {
      return handleError(res, err);
    }
    if (!productprofile) {
      return res.send(404);
    }
    var updated = _.merge(productprofile, req.body);
    updated.save(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, productprofile);
    });
  });
};
// Deletes a productProfile from the DB.
exports.destroy = function(req, res) {
  productProfile.findById(req.params.id, function(err, productprofile) {
    if (err) {
      return handleError(res, err);
    }
    if (!productprofile) {
      return res.send(404);
    }
    productprofile.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

exports.getProductByName = function(name, cb) {
  exports.findByName(name, cb);
};

exports.getDetailsById = function(arr, cb) {
  var products = [];
  productProfile.find({ _id: { $in: arr } }, function(err, docs) {
    if (err) {
      return cb(err);
    }
    for (var i = 0; i < docs.length; i++) {
      var product = {
        name: docs[i].uid,
        type: 'products',
        logo: docs[i].log ? docs[i].logo : null,
      };
      products.push(product);
    }
    cb(null, products);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
