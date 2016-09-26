var rfpProfile = {};
function onFailRequest(obj) {
  obj = obj || {};
  window.location = obj.redirect || '/404';
}
$(document).ready(function() {
  if (!rfpObj) {
    window.location = '/404';
    return;
  }
  async.series([
    function(cb) {
      $.getJSON('/rfp/' + rfpObj._id, {
        populate: 'companyId',
      },
   function(obj) {
        rfpObj = obj;
        rfpProfile = _.clone(obj);
        cb();
      }).fail(function(err) {
        cb(err);
      });
    },
    function(cb) {
      initRfpModels(function(err) {
        if (err) {
          return cb(err);
        }
        if (rfpObj.timeFrame) {
          rfpProfile.timeFrame = RfpProductQ1Model.get('options');
          rfpProfile.timeFrame =
          rfpProfile.timeFrame[parseInt(rfpObj.timeFrame) - 1].name;
        }
        if (rfpObj.budget) {
          rfpProfile.budget = RfpProductQ1Model.get('options');
          rfpProfile.budget =
          rfpProfile.budget[parseInt(rfpObj.budget) - 1].name;
        }
        if (rfpObj.whyRFP) {
          rfpProfile.whyRFP = RfpProductQ1Model.get('options');
          rfpProfile.whyRFP =
          rfpProfile.whyRFP[parseInt(rfpObj.whyRFP) - 1].name;
        }
        cb();
      });
    }, function(cb) {
      rfpObj.solutionsInPlaceIds = rfpObj.solutionsInPlaceIds || [];
      if (!rfpObj.solutionsInPlaceIds.length) {
        rfpProfile.solutionsInPlaceIds = [];
        return cb();
      }
      getData('/rfp/products', rfpObj.solutionsInPlaceIds, function(err, data) {
        if (err) {
          return cb(err);
        }
        rfpProfile.solutionsInPlaceIds = data;
        cb();
      });
    }, ], function() {
    var rfpSummay = new RfpSummaryView({ el: '#rfp-review' });
    rfpSummay.init();
  });
});