var express = require('express');
var app = express.Router();
require('dotenv').load();
var requireDir = require('require-dir');
var middleware = require('./middleware');
var querystring = require('querystring');
var SearchController = require('./api/Search/controller');
var async = require('async');
var _ = require('lodash');
var util = require('./util');
var DEFAULT_PAGE_COUNT = 5;
var getPagination = function(req, res, next) {
  var start = req.query.start | 0;
  var length = req.query.length | DEFAULT_PAGE_COUNT;
  var recordsTotal = res.locals.searchData.recordsTotal;
  var pagination = {
    recordsTotal: recordsTotal,
    start: start,
    length: length,
    defaultPgCount: DEFAULT_PAGE_COUNT,
  };
  pagination
     .totalPages = Math.ceil(pagination.recordsTotal / pagination.length);
  pagination
     .curPage = Math.ceil((pagination.start + 1) / pagination.length);
  if (pagination.curPage > DEFAULT_PAGE_COUNT) {
    pagination.startPage =
          pagination.curPage - ((pagination.curPage % DEFAULT_PAGE_COUNT) - 1);
  }
  res.locals.pagination = pagination;
  next();
};
function preProcess(req, res, next) {
  req.query.search = util.clearSearchQuery(req.query.search);
  _.extend(res.locals, {
    search: req.query.search,
    selectKey: req.query.selectKey,
  });
  var temp = _.clone(req.query);
  delete temp.start;
  delete temp.user;
  delete temp.seeAll;
  if (req.query.uid) {
    if (req.query.connectionFrom) {
      req.query.connectionFrom = req.query.connectionFrom?
            req.query.connectionFrom:'people';
    }
    SearchController.getName(req.query.connectionFrom || req.query.type,
     req.query.uid, function(name) {
      res.locals.uid = name;
    });
  }
  (function() {
    res.locals.queryString = querystring.stringify(temp);
    res.locals.query = req.query;
    req.query.seeAll = res.locals.seeAll;
    res.locals.isSeeAllCon =
          (req.query.seeAll === 'connections' || req.query.seeAll ===
           'connectionsCompany' || req.query.seeAll ===
           'specializations' || req.query.seeAll ===
           'past experience') && req.session.uid;
    res.locals.isSeeAllFol =
          req.query.seeAll === 'followers' && req.session.uid;
    res.locals.isSeeAllFollowing =
          req.query.seeAll === 'followings' && req.session.uid;
    res.locals.isSeeAllWhoViewed =
          req.query.seeAll === 'Who Viewed Your Profile' && req.session.uid;
    res.locals.isSeeFav =
          req.query.seeAll === 'favourites' && req.session.uid;
    if (res.locals.isSeeAllCon || res.locals.isSeeAllFol ||
           res.locals.isSeeFav || res.locals.seeAll === 'connectionsCompany') {
      req.query.user = req.query.uid?req.query.uid:req.session.uid;
    }
  })();
  next();
}
function makeCompanyFilterData(req, res, next) {
  /* -if (req.session.cFilter) {
       res.locals.filters = req.session.cFilter;
       return next();
     }*/
  var temp1;
  var connectionTo = 'company';
  SearchController.getCompanyRefinements(req.query, {},
   function(err, refinements) {
     if (err) {
       return next(err);
     }
     refinements = _.uniq(refinements, 'header');
     getRef(req, res.locals.isSeeAllCon, temp1, res.locals.isSeeAllFollowing,
             refinements, connectionTo);
     if (!res.locals.isSeeAllFol) {
       temp1 = _.filter(refinements, { header: 'Followers' });
       _.pull(refinements, temp1[0]);
     }
     if (!res.locals.isSeeAllFollowing) {
       temp1 = _.filter(refinements, { header: 'Followings' });
       _.pull(refinements, temp1[0]);
     }
     temp1 = _.filter(refinements, { header: 'Who Viewed Your Profile' });
     _.pull(refinements, temp1[0]);
     res.locals.filters = refinements;
     next();
   });
}
function getRef(req, isSeeAllFol, temp1, isSeeAllFollowing,
 refinements, connectionTo) {
  if (isSeeAllFol) {
    var temp = _.findWhere(refinements, { header: 'Connection Type' });
    var connectinRefine = _.filter(temp.data,
        {
          connectionFrom: req.query.connectionFrom,
          connectionTo: connectionTo,
        });
    connectinRefine = _.uniq(connectinRefine, 'connectedAs');
    for (var i = 0; i < connectinRefine.length; i++) {
      connectinRefine[i]._id = connectinRefine[i].connectedAs;
      connectinRefine[i].name = connectinRefine[i].connectedAs;
    }
    temp.data = connectinRefine;
  } else {
    temp1 = _.filter(refinements, { header: 'Connection Type' });
    _.pull(refinements, temp1[0]);
  }
}
function makePeopleFilterData(req, res, next) {
  /* -if (req.session.pFilter) {
       res.locals.filters = req.session.pFilter;
       return next();
     }*/
  SearchController.getProfileRefinements(req.query, {},
   function(err, refinements) {
     if (err) {
       return next(err);
     }
     (function() {
       var temp1;
       var connectionTo = 'people';
       getRef(req, res.locals.isSeeAllCon, temp1, res.locals.isSeeAllFollowing,
                refinements, connectionTo);
       if (!res.locals.isSeeAllFol) {
         temp1 = _.filter(refinements, { header: 'Followers' });
         _.pull(refinements, temp1[0]);
       }
       if (!res.locals.isSeeAllFollowing) {
         temp1 = _.filter(refinements, { header: 'Followings' });
         _.pull(refinements, temp1[0]);
       }
       if (!res.locals.isSeeAllWhoViewed) {
         temp1 = _.filter(refinements, { header: 'Who Viewed Your Profile' });
         _.pull(refinements, temp1[0]);
       }
       res.locals.filters = refinements;
     })();
     next();
   });
}

function makeProductFilterData(req, res, next) {
  /* -if (req.session.prFilter) {
       res.locals.filters = req.session.prFilter;
       return next();
     }*/
  SearchController.getProductRefinements(req.query, {},
    function(err, refinements) {
      if (err) {
        return next(err);
      }
      var temp1;
      var connectionTo = 'product';
      getRef(req, res.locals.isSeeAllCon, temp1, res.locals.isSeeAllFollowing,
                refinements, connectionTo);
      if (!res.locals.isSeeAllFol) {
        temp1 = _.filter(refinements, { header: 'Followers' });
        _.pull(refinements, temp1[0]);
      }
      if (!res.locals.isSeeAllFollowing) {
        temp1 = _.filter(refinements, { header: 'Followings' });
        _.pull(refinements, temp1[0]);
      }
      temp1 = _.filter(refinements, { header: 'Who Viewed Your Profile' });
      _.pull(refinements, temp1[0]);
      // Store in session so next time dont have to fetch from database
      // -req.session.prFilter = refinements;
      res.locals.filters = refinements;
      next();
    });
}

app.get('/claimed/company', function(req, res, next) {
  res.locals.seeAll = 'claimed';
  if (req.query.claimStatus === 'approved') {
    res.locals.header = 'Claimed Companies';
  } else {
    res.locals.header = 'Pending Claims';
  }
  res.locals.hidePeople = true;
  req.query.user = req.session.uid;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);



app.get('/claimed/product', function(req, res, next) {
  res.locals.seeAll = 'claimed';
  if (req.query.claimStatus === 'approved') {
    res.locals.header = 'Claimed Products';
  } else {
    res.locals.header = 'Pending Claims';
  }
  res.locals.hidePeople = true;
  req.query.user = req.session.uid;
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData, handleProductSearch);

app.get('/connections/client', function(req, res, next) {
  res.locals.seeAll = 'connections';
  res.locals.urlKey = 'client';
  res.locals.hidePeople = true;
  res.locals.hideProduct = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);

app.get('/connections/servicePartners', function(req, res, next) {
  res.locals.seeAll = 'connections';
  res.locals.urlKey = 'servicePartners';
  res.locals.hidePeople = true;
  res.locals.hideProduct = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);

app.get('/connections/technologyPartners', function(req, res, next) {
  res.locals.seeAll = 'connections';
  res.locals.urlKey = 'technologyPartners';
  res.locals.hidePeople = true;
  res.locals.hideProduct = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);



app.get('/connections/company', function(req, res, next) {
  res.locals.seeAll = 'connections';
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);
app.get('/favourites/company', function(req, res, next) {
  res.locals.seeAll = 'favourites';
  res.locals.header = 'favorites';
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);
app.get('/followers/company', function(req, res, next) {
  res.locals.seeAll = 'followers';
  req.query.user = req.session.uid;
  req.query.searchRefColl = 'companies';
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData,
 preProcess, handleCompanySearch);

app.get('/connectionsCompany/company', function(req, res, next) {
  res.locals.seeAll = 'connectionsCompany';
  res.locals.hidePeople = true;
  res.locals.hideProduct = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData,
 preProcess, handleCompanySearch);
app.get('/similarCompanies/company', function(req, res, next) {
  res.locals.seeAll = 'Similar Companies';
  res.locals.hidePeople = true;
  res.locals.hideProduct = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData,
 preProcess, handleCompanySearch);
app.get('/followings/company', function(req, res, next) {
  res.locals.seeAll = 'followings';
  req.query.user = req.session.uid;
  next();
},
 middleware.setUser,
 preProcess,
 makeCompanyFilterData,
 preProcess, handleCompanySearch);
app.get('/company',
 middleware.setUser,
 preProcess,
 makeCompanyFilterData, handleCompanySearch);
function handleCompanySearch(req, res, next) {
  res.locals.key = 'company';
  req.query.order = req.query.order || { name: 1 };
  var customData = {};
  if (req.session.customdata && req.session.customdata.searchApi &&
      req.session.customdata.searchApi.CompanyProfile) {
    customData = _.defaults({ favouritedBy: 'null', connections: 'null' },
           req.session.customdata.searchApi.CompanyProfile);
  }
  console.time('Search Time :' + res.locals.key);
  async.parallel({
    searchData: function(cb) {
      SearchController.searchCompanyData(req.query, customData, cb);
    },
    profileCount: function(cb) {
      SearchController.searchProfileDataCount(req.query, {}, cb);
    },
    productCount: function(cb) {
      SearchController.searchProductDataCount(req.query, {}, cb);
    },
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err.message);
    }
    console.timeEnd('Search Time :' + res.locals.key);
    req.query.user = req.query.uid?req.query.uid:req.session.uid;
    req.query.uid = req.query.user;
    req.query.connectionFrom = req.query.connectionFrom?
          req.query.connectionFrom:'people';
    SearchController.getProfileByUid(req.query, function(error, profileInfo) {
      res.locals.isAdmin = false;
      if (req.session._id && profileInfo.admin) {
        res.locals.isAdmin =
            (profileInfo.admin.indexOf(req.session._id) !== -1);
      }
      if (error) {
        return next(error || new Error('Invalid request'));
      }
      afterResult(result.searchData.data, res.locals.key, profileInfo);
      if (req.session._id) {
        res.locals.conFromId = profileInfo._id;
      }
      _.extend(res.locals, { searchData: result.searchData },
              { companyCount: result.searchData.recordsTotal },
              { loggedUser: req.session._id },
              { returnUrl: req.originalUrl },
              { profileCount: result.profileCount },
             { productCount: result.productCount });
      getPagination(req, res, function() {
        return res.render('pages/searchResults');
      });
    });
  });
}

app.get('/whoViewed/people', function(req, res, next) {
  res.locals.seeAll = 'Who Viewed Your Profile';
  res.locals.hideCompany = true;
  res.locals.hideProduct = true;
  if (req.session.isSuperUser) {
    req.query.user = req.session.manageProfile;
  } else {
    req.query.user = req.session.uid;
  }
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);

app.get('/connections/colleagues', function(req, res, next) {
  res.locals.seeAll = 'connections';
  res.locals.urlKey = 'colleagues';
  res.locals.hideCompany = true;
  res.locals.hideProduct = true;
  if (req.session.isSuperUser) {
    req.query.user = req.session.manageProfile;
  } else {
    req.query.user = req.session.uid;
  }
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);

app.get('/employees/people', function(req, res, next) {
  res.locals.seeAll = 'Employees';
  if (req.session.isSuperUser) {
    req.query.user = req.session.manageProfile;
  } else {
    req.query.user = req.session.uid;
  }
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/whoViewed/company', function(req, res, next) {
  res.locals.seeAll = 'Who Viewed Your Profile';
  if (req.session.isSuperUser) {
    req.query.user = req.session.manageProfile;
  } else {
    req.query.user = req.session.uid;
  }
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/whoViewed/product', function(req, res, next) {
  res.locals.seeAll = 'Who Viewed Your Profile';
  if (req.session.isSuperUser) {
    req.query.user = req.session.manageProfile;
  } else {
    req.query.user = req.session.uid;
  }
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/favourites/people', function(req, res, next) {
  res.locals.seeAll = 'favourites';
  res.locals.header = 'favorites';
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/similarProffessionals/people', function(req, res, next) {
  res.locals.headerAll = 'Similar Proffessionals';
  res.locals.seeAll = 'similarProffessionals';
  res.locals.hideCompany = true;
  res.locals.hideProduct = true;
  delete req.query.like;
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/productExperts/people', function(req, res, next) {
  res.locals.headerAll = 'Product Experts';
  res.locals.seeAll = 'Product Experts';
  res.locals.hideCompany = true;
  res.locals.hideProduct = true;
  delete req.query.like;
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/connections/people', function(req, res, next) {
  res.locals.seeAll = 'connections';
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/followers/people', function(req, res, next) {
  res.locals.seeAll = 'followers';
  req.query.user = req.session.uid;
  req.query.searchRefColl = 'profiles';
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/followings/people', function(req, res, next) {
  res.locals.seeAll = 'followings';
  req.query.user = req.session.uid;
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/followings/all', function(req, res, next) {
  res.locals.seeAll = 'followers';
  req.query.searchRefColl = 'profiles';
  req.query.user = req.session.uid;
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/followers/all', function(req, res, next) {
  res.locals.seeAll = 'followers';
  req.query.searchRefColl = 'profiles';
  req.query.user = req.session.uid;
  next();
},
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/people',
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
app.get('/all',
 middleware.setUser,
 preProcess,
 makePeopleFilterData,
 preProcess, handlePeopleSearch);
function handlePeopleSearch(req, res, next) {
  res.locals.key = 'people';
  req.query.order = req.query.order || { name: 1 };
  var customData = {};
  if (req.session.customdata && req.session.customdata.searchApi &&
      req.session.customdata.searchApi.personalProfile) {
    customData = _.defaults({ favouritedBy: 'null', connections: 'null' },
           req.session.customdata.searchApi.personalProfile);
  }
  async.parallel({
    searchData: function(cb) {
      SearchController.searchProfileData(req.query, customData, cb);
    },
    companyCount: function(cb) {
      SearchController.searchCompanyDataCount(req.query, {}, cb);
    },
    productCount: function(cb) {
      SearchController.searchProductDataCount(req.query, {}, cb);
    },
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err.message);
    }
    for (var iIndex = 0; iIndex < result.searchData.data.length; iIndex++) {
      setPersonalSkills(req.query.search, result.searchData.data[iIndex]);
    }
    req.query.user = req.query.uid?req.query.uid:req.session.uid;
    req.query.uid = req.query.user;
    req.query.connectionFrom = req.query.connectionFrom?
          req.query.connectionFrom:'people';
    SearchController.getProfileByUid(req.query, function(error, profileInfo) {
      if (error) {
        return next(error || new Error('Invalid request'));
      }
      res.locals.isAdmin = false;
      if (req.session._id && profileInfo.admin) {
        res.locals.isAdmin =
                   (profileInfo.admin.indexOf(req.session._id) !== -1);
      }
      afterResult(result.searchData.data, res.locals.key, profileInfo);
      if (req.session._id) {
        res.locals.conFromId = profileInfo._id;
      }
      _.extend(res.locals, { searchData: result.searchData },
                      { profileCount: result.searchData.recordsTotal },
                      { loggedUser: req.session._id },
                      { returnUrl: req.originalUrl },
                      { companyCount: result.companyCount },
                      { productCount: result.productCount });
      getPagination(req, res, function() {
        return res.render('pages/searchResults');
      });
    });
  });
}
function setRelation(profileId, connectedProfile) {
  if (connectedProfile) {
    return _.uniq(_.pluck(_.filter(connectedProfile,
            { refId: profileId }), 'relation')).join(', ');
  }
  return '';
}

var getModelByType = function(type) {
  switch (type) {
    case 'personalProfile': {
      return 'profiles';
    }
    case 'companyProfile': {
      return 'companies';
    }
    case 'productProfile': {
      return 'products';
    }
  }
};

function afterResult(searchData, key, connectedProfile) {
  if (!connectedProfile) {
    return;
  }
  var connectFrom = getModelByType(connectedProfile.__t);
  _.each(searchData, function(data) {
    if (data.favouritedBy) {
      data.isFav = _.find(data.favouritedBy, function(fav) {
        return fav.toString() === connectedProfile._id.toString();
      }) != null;
    }
    if (data.connections && connectedProfile.connections) {
      if (data.connections[connectFrom]) {
        data.profileRelations = setRelation(connectedProfile._id,
                         data.connections[connectFrom]);
        data.isCon = _.filter(data.connections[connectFrom],
                      { refId: connectedProfile._id }).length > 0;
        if (data.isCon) {
          data.connStatus =
                    _.filter(data.connections[connectFrom], {
                      refId: connectedProfile._id,
                    })[0].connectionStatus;
        }
      }
    }
  });
}
app.get('/connections/expertise', function(req, res, next) {
  res.locals.seeAll = 'connections';
  res.locals.urlKey = 'expertise';
  res.locals.hideCompany = true;
  res.locals.hidePeople = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);

app.get('/connections/productsUsed', function(req, res, next) {
  res.locals.seeAll = 'connections';
  res.locals.urlKey = 'productsUsed';
  res.locals.hideCompany = true;
  res.locals.hidePeople = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);

app.get('/connectionsCompany/product', function(req, res, next) {
  res.locals.seeAll = 'connectionsCompany';
  res.locals.hideCompany = true;
  res.locals.hidePeople = true;
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);

app.get('/connections/product', function(req, res, next) {
  res.locals.seeAll = 'connections';
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
app.get('/product',
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
app.get('/products/product', function(req, res, next) {
  res.locals.seeAll = 'products';
  if (req.session.isSuperUser) {
    req.query.user = req.session.manageProfile;
  } else {
    req.query.user = req.session.uid;
  }
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
app.get('/product',
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
app.get('/favourites/product', function(req, res, next) {
  res.locals.seeAll = 'favourites';
  res.locals.header = 'favorites';
  req.query.user = req.session.uid;
  req.query.searchRefColl = 'products';
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
app.get('/followers/product', function(req, res, next) {
  res.locals.seeAll = 'followers';
  req.query.user = req.session.uid;
  req.query.searchRefColl = 'products';
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
app.get('/followings/product', function(req, res, next) {
  res.locals.seeAll = 'followings';
  req.query.user = req.session.uid;
  req.query.searchRefColl = 'products';
  next();
},
 middleware.setUser,
 preProcess,
 makeProductFilterData,
 preProcess, handleProductSearch);
function handleProductSearch(req, res, next) {
  res.locals.key = 'product';
  req.query.order = req.query.order || { name: 1 };
  var customData = {};
  if (req.session.customdata && req.session.customdata.searchApi &&
      req.session.customdata.searchApi.ProductProfile) {
    customData = _.defaults({ favouritedBy: 'null', connections: 'null' },
           req.session.customdata.searchApi.ProductProfile);
  }
  async.parallel({
    searchData: function(cb) {
      SearchController.searchProductData(req.query, customData, cb);
    },
    companyCount: function(cb) {
      SearchController.searchCompanyDataCount(req.query, {}, cb);
    },
    profileCount: function(cb) {
      SearchController.searchProfileDataCount(req.query, {}, cb);
    },
  }, function(err, result) {
    if (err) {
      return res.status(500).send(err.message);
    }
    req.query.user = req.query.uid?req.query.uid:req.session.uid;
    req.query.uid = req.query.user;
    req.query.connectionFrom = req.query.connectionFrom?
          req.query.connectionFrom:'people';
    SearchController.getProfileByUid(req.query, function(error, profileInfo) {
      if (error) {
        return next(error || new Error('Invalid request'));
      }
      res.locals.isAdmin = false;
      if (req.session._id && profileInfo.admin) {
        res.locals.isAdmin =
                   (profileInfo.admin.indexOf(req.session._id) !== -1);
      }
      afterResult(result.searchData.data, res.locals.key, profileInfo);
      if (req.session._id) {
        res.locals.conFromId = profileInfo._id;
      }
      _.extend(res.locals, { searchData: result.searchData },
              { productCount: result.searchData.recordsTotal },
              { loggedUser: req.session._id },
              { returnUrl: req.originalUrl },
              { conFromId: profileInfo._id },
              { companyCount: result.companyCount },
              { profileCount: result.profileCount });
      getPagination(req, res, function() {
        return res.render('pages/searchResults');
      });
    });
  });
}

function setPersonalSkills(search, data, maxSkills) {
  maxSkills = maxSkills || 5;
  var spl = search && search.length?new RegExp(search, 'gi'):null;
  data.skills = [];
  var allSkills = getPaths(data.path);
  function getSkills(arr) {
    var skills = [];
    if (arr) {
      _.forEach(arr, function(obj) {
        getPaths(obj.path, skills);
      });
    }
    return skills;
  }
  function getPaths(path) {
    var skills = [];
    if (!path) {
      return skills;
    }
    var temp = path.split(';');
    _.forEach(temp, function(ob1) {
      if (ob1 && ob1.length) {
        var last = ob1.lastIndexOf('/');
        if (last >= 0) {
          skills.push({
            skill: ob1.substring(last + 1),
            path: ob1,
          });
        }
      }
    });
    return skills;
  }
  function addSkill(skill) {
    if (data.skills.indexOf(skill) === -1) {
      data.skills.push(skill);
    }
    if (data.skills.length >= maxSkills) {
      return false;
    }
    return true;
  }
  function searchInSkills() {
    for (var i = 0; i < allSkills.length; i++) {
      var info = allSkills[i];
      if (info.skill.search(search) !== -1) {
        if (!addSkill(info.skill)) {
          break;
        }
      }
    }
    return data.skills.length >= maxSkills;
  }
  if (searchInSkills()) {
    return;
  }
  function searchInPath() {
    for (i = 0; i < allSkills.length; i++) {
      info = allSkills[i];
      if (info.path.search(spl) !== -1) {
        if (!addSkill(info.skill)) {
          break;
        }
      }
    }
    return data.skills.length >= maxSkills;
  }
  if (searchInPath()) {
    return;
  }
  function addExtraSkills() {
    for (i = 0; i < allSkills.length; i++) {
      if (!addSkill(allSkills[i].skill)) {
        break;
      }
    }
  }
  addExtraSkills();
}
module.exports = app;
