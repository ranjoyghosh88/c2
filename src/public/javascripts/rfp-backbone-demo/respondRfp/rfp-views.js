var BaseView = Backbone.View.extend({
  initialize: function(options) {
    _.extend(this, options);
    this.subViews = {};
  },
  init: function(index) {
    this.render();
    this.replaceSubViews();
  },
  render: function() {
    throw new Error('Method not implemented!!');
  },
  getSubviewData: function() {
    var temp = {rfp: {}};
    var subdata = null;
    for (var key in this.subViews) {
      subdata = this.subViews[key].getData();
      if (subdata === null) {
        temp.rfp = null;
        return temp;
      }
      temp.rfp = _.extend(temp.rfp, subdata);
    }
    return temp;
  },
  getData: function() {
    throw new Error('Method not implemented!!');
  },
  replaceSubViews: function() {
    var tat = this;
    for (var id in registertedViews) {
      this.replaceView(id, registertedViews[id]);
    }
  },
  replaceView: function(id, view) {
    var $found = this.$(id);
    if ($found.length) {
      view.init();
      $found.replaceWith(view.$el);
      this.subViews[id] = view;
    }
  },
  addErrorMsg: function(ele, msg) {
    ele.append('<label class="error alert alert-danger">' + msg + '</label>');
  },
  clearErrors: function(ele) {
    ele.find('.error.alert.alert-danger').remove();
  },
});

var RfpPageView = BaseView.extend({
  render: function() {
    var template = _.template($(this.pageTemplateId).html());
    this.$el.html(template());
  },
  getData: function() {
    return this.getSubviewData();
  },
});

var RfpWizardView = Backbone.View.extend({
  render: function() {
    var template = _.template($(this.pageTemplateId).html());
    this.$el.html(template());
  },
  getData: function() {
    return this.getSubviewData();
  },
});



var RfpQuestionsview = BaseView.extend({
  events: {
    'input textarea.answer': 'onAnswered',
    'change select.answer': 'onAnswered',
    'input  .comment': 'onCommented',
    'click .commentToggle': 'onCommentToggle',
  },
  onCommentToggle: function(evt) {
    evt.preventDefault();
    $(evt.target).text(
      $(evt.target).text() ===
      'add comment'?'hide comment':'add comment');
    $(evt.target).closest('.commentContainer').
    find('.commentSection').toggleClass('hidden');
  },
  onCommented: function(evt) {
    var qId = $(evt.target).closest('.std-que').attr('data-qid');
    var qGroupId = $(evt.target).closest('.tab-pane').attr('data-gId');
    rfpResponse.answers = rfpResponse.answers || [];
    var ele = _.find(rfpResponse.answers, { qId: qId, });
    var index;
    var pushObj = {qId: qId, qGroupId: qGroupId, };
    var ansField = 'comment';
    pushObj[ansField] =
    [{
      text: $(evt.target).val(),
      isDeleted: false,
    }, ];
    if (ele) {
      index = _.indexOf(rfpResponse.answers, ele);
      rfpResponse.answers[index][ansField] =
      [{
        text: $(evt.target).val(),
        isDeleted: false,
      }, ];
    }else {
      rfpResponse.answers.push(pushObj);
    }
  },
  onAnswered: function(evt) {
    var qId = $(evt.target).closest('.std-que').attr('data-qid');
    var qGroupId = $(evt.target).closest('.tab-pane').attr('data-gId');
    rfpResponse.answers = rfpResponse.answers || [];
    var ele = _.find(rfpResponse.answers, { qId: qId, });
    var index;
    var pushObj = {qId: qId, qGroupId: qGroupId, };
    var ansField = $(evt.target).attr('data-type') === '0'?'text':'enumAns';
    pushObj[ansField] = $(evt.target).val();
    if (ele) {
      index = _.indexOf(rfpResponse.answers, ele);
      rfpResponse.answers[index][ansField] = $(evt.target).val();
    }else {
      rfpResponse.answers.push(pushObj);
    }
  },
  render: function(subView, ind) {
    this.model.set({
      questionGroups: rfpObj.questionGroups,
    });
    var template = _.template($('#add-questions-tmpl').html());
    this.$el.html(template(
      {
        answers: rfpResponse.answers,
        questionGroups: rfpObj.questionGroups,
        userRole: rfpResponse.userRole,
      }));
  },
  getData: function() {
    return rfpResponse;
  },
});
var RfpChooseAnswersView = BaseView.extend({
  events: {
    'change .chooseAnswer': 'onSelected',
    'click .commentToggle': 'onCommentToggle',
  },
  onCommentToggle: function(evt) {
    evt.preventDefault();
    $(evt.target).text(
      $(evt.target).text() ===
      'show comments'?'hide comments':'show comments');
    $(evt.target).closest('.eachAnswer').
    find('.commentSection').toggleClass('hidden');
  },
  onSelected: function(evt) {
    var target = $(evt.target);
    var userId = $(evt.target).val();
    console.log(userId);
    target.closest('.answer-choice').
    find('.eachAnswer').each(function(i, ans) {
      if (userId === $(ans).attr('data-user')) {
        $(ans).show();
      }else {
        $(ans).hide();
      }
    });
  },
  render: function() {
    var template = _.template($('#choose-answers-tmpl').html());
    this.$el.html(template({
      responseList: rfpResponse.responses,
      questionGroups: rfpObj.questionGroups,
    }));
    /* - this.$('.chooseAnswer').each(function(ind, sel) {
      $(sel).val($(sel).find('option[data-select="true"]').
        attr('value')).trigger('change');
    }); */
    this.$('.std-que.answer-choice .chooseAnswer').
    each(function(ind, sel) {
      $(sel).trigger('change');
    });
    var finalResponse = {answers: [], };
    this.$('.std-que.answer-choice').each(function(i, que) {
      var userId = $(que).find('.chooseAnswer').val();
      var qId = $(que).attr('data-qId');
      // - var gId = $(que).closest('.tab-pane').attr('data-gId');
      if (userId && qId) {
        var obj = _.find(rfpResponse.responses, function(obj) {
          return obj.userId._id === userId;
        });
        var ans = _.find(obj.answers, {qId: qId, });
        if (ans) {
          finalResponse.answers.push(ans);
        }
      }
    });
    rfpResponse.finalResponse = finalResponse;
    // - rfpResponse.answers = finalResponse.answers;
  },
  getData: function() {
    var finalResponse = {answers: [], };
    this.$('.std-que.answer-choice').each(function(i, que) {
      var userId = $(que).find('.chooseAnswer').val();
      var qId = $(que).attr('data-qId');
      // - var gId = $(que).closest('.tab-pane').attr('data-gId');
      if (userId && qId) {
        var obj = _.find(rfpResponse.responses, function(obj) {
          return obj.userId._id === userId;
        });
        var ans = _.find(obj.answers, {qId: qId, });
        if (ans) {
          finalResponse.answers.push(ans);
        }
      }
    });
    rfpResponse.finalResponse = finalResponse;
    return rfpResponse;
  },
});

var RfpResponseContribView = BaseView.extend({
  events: {
    'click .commentToggle': 'onCommentToggle',
    'click #TrgrClk': 'triggerFileClick',
    'change #file': 'fileChange',
  },
  fileChange: function(e) {
    this.changed = true;
    this.readURL(e.target);
  },
  readURL: function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('img.rfpPic').attr('src', e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  },
  triggerFileClick: function(evt) {
    evt.preventDefault();
    $('#file').trigger('click');
  },
  onCommentToggle: function(evt) {
    evt.preventDefault();
    $(evt.target).text(
      $(evt.target).text() ===
      'show comments'?'hide comments':'show comments');
    $(evt.target).closest('.commentContainer').
    find('.commentSection').toggleClass('hidden');
  },
  render: function() {
    this.changed = false;
    var template = _.template($('#response-cover-tmpl').html());
    this.$el.html(template({rfpReceipent: rfpReceipent,
      cover: rfpResponse.cover,
      answers: rfpResponse.finalResponse.answers,
      questionGroups: rfpObj.questionGroups,
      userRole: rfpResponse.userRole,
    }));
  },
  getData: function() {
    function getBase64Image(img) {
      // Create an empty canvas element
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      var dataURL = canvas.toDataURL('image/png');

      return dataURL.replace(/^data:image\/(png|jpg);base64,/,
        '');
    }
    if (this.changed) {
      rfpResponse.image = getBase64Image($('img.rfpPic')[0]);
    }
    rfpResponse.cover.description =
    $('textarea[name="description"]').val();
    return rfpResponse;
  },
});

var RfpInviteContribView = BaseView.extend({
  events: {
    'click #show-tmpl': 'showTemplate',
    'click #save-contrib': 'setContrib',
    'change select[name="name"]': 'disableEmail',
    'change input[name="email"]': 'clearContrib',
    'click input[name="role"]': 'roleChanged',
    'click #cancle-contrib': 'emptyContribForm',
  },
  emptyContribForm: function(evt) {
    evt.preventDefault();
    this.$el.find('#add-contrib-ui').empty();
  },
  roleChanged: function(evt) {
    var target = $(evt.target);
    if (target.val() === 'admin') {
      if (target.prop('checked')) {
        $('input[name="role"]').not('[value="admin"]')
        .prop('checked', true);
        $('input[name="role"]').not('[value="admin"]')
        .prop('disabled', true);
      }else {
        $('input[name="role"]').not('[value="admin"]')
        .prop('checked', false);
        $('input[name="role"]').not('[value="admin"]')
        .prop('disabled', false);
      }
    }
  },
  clearContrib: function(evt) {
    contrib = [];
    $(evt.target).closest('#add-contrib-ui').find('select[name="name"]').
    val('').trigger('change');
  },
  disableEmail: function(evt) {
    if (contrib[0]) {
      $(evt.target).closest('#add-contrib-ui').find('[name="email"]').
      val(contrib[0].email);
    }
  },
  showTemplate: function(evt) {
    evt.preventDefault();
    this.renderContribForm();
  },
  renderContribForm: function() {
    var el = this.$el.find('#add-contrib-ui');
    var template = _.template($('#add-contrib-tmpl').html());
    var cons = _.map(rfpResponse.contributorIds, function(value, key) {
      return value.id;
    });
    getData('/rfp/people', cons || [], cb);
    function cb(err, data) {
      var contributorsRole = _.map(data, function(value, key) {
        var role = _.find(rfpResponse.contributorIds, function(obj) {
          return obj.id === value._id;
        });
        value.role = role.role;
        return value;
      });
      el.html(template({
        rederContrib: contributorsRole,
        userRole: rfpResponse.userRole,
      }));
      var ele = el.find('[name="name"]');
      try {
        $(ele).select2();
        $(ele).select2('destroy');
      } catch (exc) {
        console.log(exc);
      } finally {
        $(ele).parent().find('.select2.select2-container').remove();
      }
      var attr = $(ele).attr('data-master');
      setSelect2TypeAhead($(ele), attr);
    }
  },
  validateRole: function() {
    if (!$('input[name="role"]:checked').val()) {
      $('.error-container').
      html('<span class="error alert alert-danger">' +
        'Please select a contributor with some role</span>');
    }else {
      $('.error-container').empty();
      var toPush = [];
      $('input[name="role"]:checked').each(function(i, role) {
        toPush.push($(role).val());
      });
      return toPush;
    }
  },
  setContrib: function(evt) {
    evt.preventDefault();
    var roles = this.validateRole();
    if (!roles) {
      return;
    }
    rfpResponse.contributorIds = rfpResponse.contributorIds || [];
    var toBeInserted = {id: contrib[0]._id, role: []};
    if (contrib && contrib[0]) {
      var doesExist = _.where(rfpResponse.contributorIds, {id: contrib[0]._id});
      if (doesExist.length <= 0) {
        rfpResponse.contributorIds.push({
          id: contrib[0]._id,
          role: roles,
        });
      }
    }
    contrib = [];
    this.renderContribForm();
  },
  render: function(subView, ind) {
    var template = _.template($('#invite-contrib-tmpl').html());
    this.$el.html(template());
  },
  getData: function() {
    return;
  },
});

var RfpTitlView = BaseView.extend({
  render: function() {
    var template = _.template($('#title-placeHolder-tmpl').html());
    this.$el.html(template(rfpObj));
  },
  getData: function() {
    return;
  },
});

var RfpHeaderView = BaseView.extend({
  render: function() {
    var tat = this;
    getData('/rfp/companies', rfpObj.companyId, callback);
    function callback(err, companyId) {
      var template = _.template($('#product-header-tmpl').html());
      companyId = companyId || [];
      tat.$el.html(template(companyId[0]));
      rfpProfile.companyId = companyId[0];
    }
  },
  getData: function() {
    return;
  },
});



var RfpCoverView = BaseView.extend({
  render: function() {
    var template = _.template($('#cover-letter-tmpl').html());
    rfpObj.cover = rfpObj.cover || {};
    rfpObj.milestones =
    rfpObj.milestones &&
    rfpObj.milestones.length > 0 ? rfpObj.milestones : [{title: '',
    date: null, }, ];
    rfpObj.mileStoneDeadline =
    moment(rfpObj.milestones[0].date).format('DD MMM YYYY');
    rfpObj.responseDL =
      moment(rfpObj.responseDeadLine).format('DD MMM YYYY');
    rfpObj.willAcceptLateResponse = rfpObj.willAcceptLateResponse || false;
    this.$el.html(template(rfpObj));
  },

  getData: function() {
    return;
  },
});


function getData(url, q, cb) {
      $.getJSON(url, {
        q: {
          _id: {$in: q},
        },
        populate: 'type' ,
      }, function(data) {
        cb(null, data);
      })
      .fail(function(err) {
        cb(err, null);
      });
    }