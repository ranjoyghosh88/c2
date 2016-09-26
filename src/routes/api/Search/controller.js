/**
* GET     /search              ->  index
* query ->
* start = Paging first record indicator.
*         This is the start point in the current data set
*        (0 index based - i.e. 0 is the first record).
* length = Number of records
* order = order by
* search = Global search value string
* filter = Filter query (vary depending on each search type)
* Return Type -->
* recordsTotal = Total records //need to discuss should we send
*                this data to all users that how much records we have?
* data = The data to be displayed
* error = Optional: If an error occurs during the running of the
*         server-side processing script, you can inform the user
*         of this error by passing back the error message to be
*         displayed using this parameter. Do not include if there is no error.
*/
var _ = require('lodash');
var CompanyModel = require('../../../models/companyProfile');
var PersonalProfileModel = require('../../../models/personalProfile');
var ProductModel = require('../../../models/productProfile');

exports.searchData = function(Model, query, userData, callback) {
  Model.search(query, userData, callback);
};
exports.searchDataCount = function(Model, query, userData, callback) {
  Model.searchCount(query, userData, callback);
};
exports.getRefinements = function(Model, query, userData, callback) {
  Model.getRefinements(query, callback);
};
exports.searchCompanyData = function(query, userData, callback) {
  exports.searchData(CompanyModel, query, userData, callback);
};

exports.searchCompanyDataCount = function(query, userData, callback) {
  exports.searchDataCount(CompanyModel, query, userData, callback);
};

exports.getCompanyRefinements = function(query, userData, callback) {
  exports.getRefinements(CompanyModel, query, userData, callback);
};
exports.searchCompany = function(req, res, next) {
  try {
    exports.searchCompanyData(req.query, {}, function(err, result) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(result);
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};
exports.searchProfileData = function(query, userData, callback) {
  exports.searchData(PersonalProfileModel, query, userData, callback);
};
exports.searchProfileDataCount = function(query, userData, callback) {
  exports.searchDataCount(PersonalProfileModel, query, userData, callback);
};
exports.getProfileRefinements = function(query, userData, callback) {
  exports.getRefinements(PersonalProfileModel, query, userData, callback);
};

var getModelByType = function(type) {
  switch (type) {
    case 'people': {
      return { Model: PersonalProfileModel, type: 'profiles' };
    }
    case 'company': {
      return { Model: CompanyModel, type: 'companies' };
    }
    case 'product': {
      return { Model: ProductModel, type: 'products' };
    }
  }
};

exports.getProfileByUid = function(query, cb) {
  var modal = getModelByType(query.connectionFrom);
  modal.Model.findOne({ uid: query.user }).lean().exec(function(err, res) {
    if (err) {
      return cb(err);
    }
    return cb(null, res);
  });
};
exports.searchProfile = function(req, res, next) {
  try {
    exports.searchProfileData(req.query, {}, function(err, result) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(result);
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};
exports.searchProductData = function(query, userData, callback) {
  exports.searchData(ProductModel, query, userData, callback);
};
exports.searchProductDataCount = function(query, userData, callback) {
  exports.searchDataCount(ProductModel, query, userData, callback);
};

exports.getProductRefinements = function(query, userData, callback) {
  exports.getRefinements(ProductModel, query, userData, callback);
};
exports.searchProduct = function(req, res, next) {
  try {
    exports.searchProfileData(req.query, {}, function(err, result) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(result);
    });
  } catch (ex) {
    res.status(400).send(ex.message);
  }
};
exports.getName = function(type, uid, cb) {
  var model, name;
  switch (type) {
    case 'company': {
      model = CompanyModel;
      break;
    }
    case 'product': {
      model = ProductModel;
      break;
    }
    default: {
      model = PersonalProfileModel;
      break;
    }
  }
  model.find({ uid: uid }, function(err, result) {
    if (err) {
      return cb(null);
    }
    if (!result.length) {
      return cb(null);
    }
    if (result[0].lastName) {
      var fullName = result[0].name + ' ' + result[0].lastName;
      cb(fullName);
    } else {
      cb(result[0].name);
    }
  });
};
function handleError(res, err) {
  console.log(err.stack || err.message);
  return res.send(500, err);
}