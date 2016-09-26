var registertedViews = {
};
var app = null;
var registerView = function(id, view) {
  registertedViews[id] = view;
};
var rfpResponse = {};
var rfpReceipent = {};
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
      var rfpData = tempView.getData().rfp;
      rfpObj = rfpResponse;
      console.log('completing Rfp');
      rfpObj.state = 'Responded';
      console.log(rfpObj);
      sendRfp('/rfp/response/' +
        rfpObj._id, 'PUT', rfpObj, function(err, data) {
          if (data) {
            window.location.replace('/rfp-dashboard');
          }
        });
    });
    tempView.$el.on('click', '.continue', function(evt) {
      evt.preventDefault();
      var rfpData = tempView.getData().rfp;
      var rfpObj = rfpResponse;
      if (rfpData) {
        _.extendOwn(rfpObj, rfpData);
        console.log(rfpObj);
        res = _.map(rfpObj.responses, function(obj) {
          obj.userId = obj.userId._id;
          return obj;
        });
        rfpObj.responses = res;
        sendRfp('/rfp/response/' +
          rfpObj._id, 'PUT', rfpObj, function(err, data) {
          if (data) {
            rfpObj = data;
            rfpResponse.responses = data.responses;
            rfpResponse.answers = data.answers || [];
            // - rfpWizard = processRfpWizData(data.definition.wizard);
            // - console.log(rfpWizard);
            // - console.log(stepTitles);
            if (rfpResponse.userRole.indexOf('admin') < 0 && index === '1') {
              window.location.replace('/rfp-dashboard');
            }else {
              app.navigate('next/' + (parseInt(index) + 1),
                {trigger: true, });
            }

          }
        });
      }
    });
    tempView.$el.on('click', '.next', function(evt) {
      evt.preventDefault();
      app.navigate('next/' + (parseInt(index) + 1),
          {trigger: true, });

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
        '#rfp-add-questions':
 new RfpQuestionsview({ model: RfpAddQuestionsModel }),
        '#rfp-product-header': new RfpHeaderView(),
        '#rfp-title-placeHolder': new RfpTitlView(),
        '#rfp-cover-letter': new RfpCoverView(),
        '#rfp-invite-contrib': new RfpInviteContribView(),
        '#rfp-response-cover': new RfpResponseContribView(),
        '#rfp-choose-answers': new RfpChooseAnswersView(),
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
      app = new AppRouter();
      Backbone.history.start();
      app.navigate('next/0', { trigger: true, });
    }
    rfpObj = rfpObj || {title: '', };
    if (rfpObj._id) {
      sendRfp('/rfp/response/' + rfpObj._id, 'GET', {}, function(err, data) {
          if (err || !data) {
            window.location = '/404';
            return;
          }
          rfpResponse = data;
          rfpObj = data.rfpId;
          rfpReceipent = data.rfpReceipent;
          rfpResponse.answers = rfpResponse.answers || [];
          if (rfpResponse.userRole.indexOf('admin') >= 0) {
            rfpWizard = [
             { view: 'page-6', step: 0 }, {view: 'page-5', step: 1},
             {view: 'page-1', step: 1},
             {view: 'page-7', step: 2},
            ];
            stepTitles = ['Cover Letter & Milestones', 'Questions',
             'Review & Finalize', ];
          }
          start();
        });
    }
  });
});
function generateRfpSteps(rfpData, stepNumber) {
  $('#rfpSteps').empty();
  $('#rfpSteps').
  append('<div class="row"><div class="pull-left">' +
    '</div><div class="col-xs-12 text-center pull-right ' +
    'SignUpSteps hidden-xs">' +
    ' <span></span></div></div>');
  for (i = 0; i < (stepTitles.length); i++) {
    var cls = i === 0?' margin-left:15px;':'';
    $('#rfpSteps .SignUpSteps>span').
    append('<span class="outerCircle" style="margin-right:0;' +
      'width:50px;height:50px;' +
      cls + '">' +
      '<span class="circle" style="position:relative;font-size:23px;' +
      'width:35px;height:35px;margin-top:8px;">' +
      (i + 1) + '<span class="blueDash hidden" ' +
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