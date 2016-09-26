var registertedViews = {
};
var app = null;
var registerView = function(id, view) {
  registertedViews[id] = view;
};
function processRfpWizData(wizData) {
  var pgArr = [];
  stepTitles = [];
  for (var i = 0;i < wizData.length;i++) {
    for (var j = 0;j < wizData[i].step.views.length;j++) {
      pgArr.push({view: wizData[i].step.views[j], step: i, });
    }
    stepTitles.push(wizData[i].step.title);
  }
  return pgArr;
}

function sendRfp(url, method, data, cb) {
  $.ajax({
  method: method,
  url: url,
  data: data,
}).done(function(data) {
  cb(null, data);
}).fail(function(err) {
    cb(err, null);
  });
}
$(document).ready(function() {
  var allPages = {};
  var $rfpwizard = null;
  function Getpage(index) {
    var obj = rfpWizard[index];
    var tempView = new RfpPageView({ pageTemplateId: '#' + obj.view });
    tempView.init();
    allPages[obj.view] = tempView;
    $('.page', $rfpwizard).children().first().detach();
    $('.page', $rfpwizard).html(tempView.$el);
    tempView.delegateEvents();
    tempView.$el.on('click', '.complete-rfp', function(evt) {
      evt.preventDefault();
      console.log('completing Rfp');
      rfpObj.state = 'completed';
      console.log(rfpObj);
      sendRfp('/rfp/' + rfpObj._id, 'PUT', rfpObj, function(err, data) {
          if (data) {
            window.location.replace('/rfp-dashboard');
          }
        });
    });
    tempView.$el.on('click', '.continue', function(evt) {
      evt.preventDefault();
      var rfpData = tempView.getData().rfp;
      if (rfpData) {
        _.extendOwn(rfpObj, rfpData);
        console.log(rfpObj);
        if (rfpObj._id) {
          sendRfp('/rfp/' + rfpObj._id, 'PUT', rfpObj, function(err, data) {
            if (err && err.status === 403) {
              window.location.href = '/error/403';
            }
            if (data) {
              rfpObj = data;
              rfpWizard = processRfpWizData(data.definition.wizard);
              console.log(rfpWizard);
              console.log(stepTitles);
              app.navigate('next/' + (parseInt(index) + 1),
                {trigger: true, });
            }
          });
        }else {
          sendRfp('/rfp/', 'POST', rfpObj, function(err, data) {
            if (err && err.status === 403) {
              window.location.href = '/error/403';
            }
            if (data) {
              rfpObj = data;
              rfpWizard = processRfpWizData(data.definition.wizard);
              console.log(rfpWizard);
              console.log(stepTitles);
              app.navigate('next/' + (parseInt(index) + 1),
                {trigger: true, });
            }
          });
        }
      }
    });
    tempView.$el.on('click', '.back', function(evt) {
      evt.preventDefault();
      var prev = null;
      if (parseInt(index) > 0) {
        app.navigate('next/' + (parseInt(index) - 1),
              {trigger: true, });
      }else {
        window.history.back();
      }
    });
    $('.weight').rating({
  filled: 'fa fa-circle',
  filledSelected: 'fa fa-circle',
  empty: 'fa fa-circle-o',
});
    $('select', tempView.$el).not('.notSelect2').each(function(index, ele) {
      var attr = $(ele).attr('data-master');
      try {
        $(ele).select2();
        $(ele).select2('destroy');
      } catch (exc) {
        console.log(exc);
      } finally {
        $(ele).parent().find('.select2.select2-container').remove();
      }
      if (typeof attr !== typeof undefined && attr !== false) {
        setSelect2TypeAhead($(ele), attr);
      } else {
        $(ele).select2({});
      }
    });
    generateRfpSteps(rfpWizard, rfpWizard[parseInt(index)].step + 1);
  }
  AppRouter = Backbone.Router.extend({
    routes: {
      '': 'index',
      'next/:id': 'next',
    },
    initialize: function() {
      _.extend(registertedViews, {
        '#rfp-select': new RfpSelectTypeView(),
        '#rfp-title': new RfpTitleView(),
        '#rfp-company-select':
 new RfpCompanySelectView({ model: RfpSelectTypeAheadModel }),
        '#rfp-std-question': new RfpStdQuestion(),
        '#rfp-inquire-product': new RfpInquireProductView(),
        '#rfp-product-q-1': new RfpProductQView({ model: RfpProductQ1Model }),
        '#rfp-product-q-2': new RfpProductQView({ model: RfpProductQ2Model }),
        '#rfp-product-q-3':
 new RfpCompanySelectView({ model: RfpSelectProductTypeAheadModel }),
        '#rfp-product-q-4': new RfpProductQView({ model: RfpProductQ4Model }),
        '#rfp-add-company': new RfpAddCompanyView(),
        // - '#rfp-popup-tmpl': new RfpModalview(),
        '#rfp-reciepent-list':
 new RfpReciepentListview({ model: RfpReciepentList }),
        '#rfp-add-questions':
 new RfpQuestionsview({ model: RfpAddQuestionsModel }),
        '#rfp-product-header': new RfpHeaderView(),
        '#rfp-title-placeHolder': new RfpTitlView(),
        '#rfp-cover-letter': new RfpCoverView(),
        '#rfp-summary': new RfpSummaryView({ model: BaseModel }),
        '#rfp-profile': new RfpProfileView(),
      });
      var $content = $('#content');
      var wizTemplate = $('#rfp-wizard-tmpl').html();
      $content.empty();
      $content.append(wizTemplate);
      $rfpwizard = $('.rfp-wizard', $content);
      var pageNoTemplate = _.template($('#wizard-page-no-tmpl').html());
      _.each(rfpWizard, function(obj, index) {
        var $header = $('.header-counter', $rfpwizard);
        $header.append(pageNoTemplate());
      });
    },
    index: function() {
      new Getpage(0);
    },
    next: function(id) {
      new Getpage(id);
    },
  });
  initRfpModels(function(err) {
    if (err) {
      console.log(err);
    }
    function start() {
      rfpObj.title = rfpObj.title || '';
      rfpProfile.title = rfpObj.title;
      (function() {
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
        if (defaultCompany) {
          rfpObj.companyId = defaultCompany[0]._id;
          rfpProfile.companyId = defaultCompany[0];
        }
      })();
      app = new AppRouter();
      Backbone.history.start();
      app.navigate('next/0', { trigger: true, });
    }

    if ($('input[name="is-draft"]').length > 0) {
      start();
    }else {
      rfpObj = rfpObj || {title: '', };
      if (rfpObj._id) {
        sendRfp('/rfp/' + rfpObj._id, 'GET', {}, function(err, data) {
          if (err || !data) {
            window.location = '/404';
            return;
          }
          rfpObj = data;
          start();
        });
      } else {
        start();
      }
    }
  });
});
function generateRfpSteps(rfpData, stepNumber) {
  $('#rfpSteps').empty();
  $('#rfpSteps').
  append('<div class="row"><div class="col-xs-12 text-center ' +
    'SignUpSteps hidden-xs">' +
    ' <span></span></div></div>');
  for (i = 0; i < (stepTitles.length); i++) {
    $('#rfpSteps .SignUpSteps>span').
    append('<span class="outerCircle" style="margin-right:0;' +
      'width:50px;height:50px;">' +
      '<span class="circle" style="position:relative;font-size:23px;' +
      'width:35px;height:35px;margin-top:8px;">' +
      (i + 1) +
     '<span class="blueDash hidden" ' +
     'style="position:absolute;left:35px;margin-top:11px;width:50px">' +
     '</span></span></span><span class="dash" ' +
     'style="left: 0;margin-top: -10px; position:relative;width:75px"></span>');
  }
  var outerCirc = $('#rfpSteps .SignUpSteps .outerCircle');
  outerCirc.last().find('.blueDash').remove().end().next().remove();
  for (i = 0; i < stepNumber; i++) {
    outerCirc.eq(i).find('.circle').addClass('active');
    outerCirc.eq(i - 1).find('.blueDash').
    css('width', '95px').removeClass('hidden');
    outerCirc.eq(i).find('.blueDash').removeClass('hidden');
  }
}