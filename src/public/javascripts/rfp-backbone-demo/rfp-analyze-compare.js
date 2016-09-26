var rfpCompareTableTmpl = _.template($('#rfp-compare-table').html());
var rfpQueSingleTmpl = _.template($('#rfp-single-sel-que').html());
var rfpQueMultiTmpl = _.template($('#rfp-multi-sel-que').html());
var rfpQueFreeTmpl = _.template($('#rfp-free-que').html());
var rfpListAnsTmpl = _.template($('#rfp-listans-que').html());

function getTemplateByType(type) {
  type = parseInt(type);
  switch (type) {
    case 0: {
      return rfpQueFreeTmpl;
    }
    case 1: {
      return rfpQueSingleTmpl;
    }
    case 2: {
      return rfpQueMultiTmpl;
    }
    case 3: {
      return rfpListAnsTmpl;
    }
  }
  return null;
}
function renderAnswer(obj) {
  var tmplate = getTemplateByType(obj.question.type);
  if (!tmplate) {
    return null;
  }
  return tmplate(obj);
}
var ResponseCompareView = Backbone.View.extend({
  events: {
    'tr click': 'onClick',

  },
  onClick: function(evt) {
    console.log(evt);
  },
  render: function(responses) {
    this.$('.rfp_company_details').html(rfpCompareTableTmpl({
      questions: this.model.qGroup.questions,
      responses: this.model.allResponses,
      renderAnswer: renderAnswer,
    }));
    this.$('.seemoreQtext')
    .removeClass('hide');

    bindSeeeMore(this.$('.seemoreQtext'), this.$('table'));
  },
});
var rfpTabTemplate = _.template($('#rfp-compare-tab-view').html());
var ResponseTabView = Backbone.View.extend({
  render: function() {
    this.$el.html(rfpTabTemplate(this.model.rfps));
    var tat = this;
    this.$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
      tat.onTabClick(e);
    });
  },
  onTabClick: function(e) {
    var href = $(e.currentTarget).closest('li').attr('role');
    var view = this.model.compareView[href];
    if (view) {
      view.render();
    }
  },
});
$(document).ready(function() {
  if (!rfpId) {
    window.location = '/404';
    return;
  }
  var compareIds = [];
  $('.compareIds').each(function(elm) {
    compareIds.push($(this).val());
  });

  $.get('/rfp/analyze-compare/' + rfpId, {ids: compareIds}, function(data) {
    var rfp = data.rfp;
    var allResponses = data.responses;
    var compareView = {};
    var tabView = new ResponseTabView({
      el: '#rfp-compare-tabs',
      model: {
        rfps: rfp,
        compareView: compareView,
      },
    });
    tabView.render();
    // After tab view render each group tables
    _.each(rfp.questionGroups, function(qGroup) {
      _.each(allResponses, function(response) {
        // MakeQuestionGroup(qGroup, response);
        _.each(qGroup.questions, function(que) {
          que.answers = que.answers || [];
          var answer = _.findWhere(response.finalResponse.answers, {
            qGroupId: qGroup._id,
            qId: que._id,
          });
          if (answer) {
            if (!(answer.enumAns && answer.enumAns.length ||
             (answer.text && answer.text.trim().length))) {
              answer = null;
            }
          }
          que.answers.push(answer);
        });
      });
    });
    _.each(rfp.questionGroups, function(qGroup) {
      var view = new ResponseCompareView({
        el: '#' + qGroup._id,
        model: { qGroup: qGroup, allResponses: allResponses },
      });
      view.render();
      compareView[qGroup._id] = view;
    });
  })
  .fail(function(err) {
    console.log(err);
    window.location = '/404';
    return;
  });
});
function makeQuestionGroup(qGroup, response) {
  _.each(qGroup.questions, function(question) {
    question.answers = [];
    var answer = _.findWhere(response.finalResponse.answers, {
      qGroupId: qGroup._id,
      qId: question._id,
    });
    question.answers.push(answer);
  });
}