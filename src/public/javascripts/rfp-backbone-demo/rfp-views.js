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
    if (window.registertedViews) {
      for (var id in registertedViews) {
        this.replaceView(id, registertedViews[id]);
      }
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
var RfpSelectTypeView = BaseView.extend({
  render: function() {
    var template = _.template($('#rfp-input-template').html());
    this.$el.html(template({
      title: 'Select type of RFP',
      inputs: [{ text: 'Product', value: '1', },
       { text: 'Services', value: '2', }, ],
      name: 'select-rfp',
      type: 'radio',
    }));
    rfpObj.typeId = rfpObj.typeId || '1';
    this.$el.find('[value="' + rfpObj.typeId + '"]').trigger('click');
  },
  getData: function() {
    return {
      typeId: this.$('input[name="select-rfp"]:checked').val(),
    };
  },
});
var RfpStdQuestion = BaseView.extend({
  render: function() {
    var template = _.template($('#rfp-input-template').html());
    this.$el.html(template({
      title: '3. Would you like to start by using our standard RFP questions ?',
      inputs: [{ text: 'Yes', value: 'Yes', },
       { text: 'No', value: 'No', }, ],
      name: 'select-std-que',
      type: 'radio',
    }));
  },
  getData: function() {
    return {
      type: this.$('input[name="select-std-que"]:checked').val(),
    };
  },
});

var RfpTitleView = BaseView.extend({
  render: function() {
    var template = _.template($('#title-text').html());
    this.$el.html(template({
      title: 'Title of the RFP',
      name: 'title',
      value: rfpObj.title,
    }));
  },
  getData: function() {
    this.clearErrors(this.$('input[name="title"]').parent());
    rfpProfile.title = this.$('input[name="title"]').val();
    if (this.$('input[name="title"]').val().length <= 0) {
      this.addErrorMsg(this.$('input[name="title"]').parent(),
        'RFP title is required');
      return null;
    }
    return {
      title: this.$('input[name="title"]').val(),
    };
  },
});
var RfpCompanySelectView = BaseView.extend({
  render: function() {
    var template = _.template($('#select-typeahead').html());
    this.$el.html(template(this.model.toJSON()));
    var tat = this;
    if (rfpObj[this.model.attributes.name] &&
      rfpObj[this.model.attributes.name].length > 0) {
      getData('/rfp/' + this.model.attributes.dataMaster,
        rfpObj[this.model.attributes.name], callback);
    }
    function callback(err, companyId) {
      var sel = tat.$el.
      find('select[name="' + tat.model.get('name') + '"]');
      try {
        sel.select2();
        sel.select2('destroy');
      } catch (exc) {
        console.log(exc);
      } finally {
        sel.empty();
      }
      for (var i = 0; companyId && i < companyId.length; i++) {
        sel.append('<option selected value="' +
        companyId[i]._id + '">' +
        companyId[i].name + '</option>');
      }
      setSelect2TypeAhead(sel, sel.attr('data-master'));
    }
  },
  getData: function() {
    this.clearErrors(this.$el);
    var returnObj = {};
    var sel = null;
    returnObj[this.model.attributes.name] =
    this.$('select[name="' + this.model.attributes.name + '"]').val();
    if (returnObj[this.model.attributes.name] === null) {
      sel = this.$el.
      find('select[name="' + this.model.attributes.name + '"]');
      this.addErrorMsg(sel.parent(),
        this.model.attributes.errorMsg);
      return null;
    }
    rfpProfile[this.model.attributes.name] =
    returnObj[this.model.attributes.name];
    returnObj[this.model.attributes.name] =
    returnObj[this.model.attributes.name] || [];
    return returnObj;
  },
});
var RfpProductQView = BaseView.extend({
  render: function() {
    var template = _.template($('#rfp-product-q-1').html());
    this.$el.html(template(this.model.toJSON()));
    this.$el.find('select[name="' + this.model.attributes.name + '"]').
    val(rfpObj[this.model.attributes.name]);
  },
  getData: function() {
    this.clearErrors(this.$el);
    var returnObj = {};
    var sel = null;
    returnObj[this.model.attributes.name] =
    this.$('select[name="' + this.model.attributes.name + '"]').val();
    if (!returnObj[this.model.attributes.name] &&
      returnObj[this.model.attributes.name].length <= 0) {
      sel = this.$el.find('select[name="' + this.model.attributes.name + '"]');
      this.addErrorMsg(sel.parent(),
        this.model.attributes.errorMsg);
      return null;
    }
    rfpProfile[this.model.attributes.name] =
    this.$('select[name="' + this.model.attributes.name +
      '"] option:selected').html();
    return returnObj;
  },
});



var RfpInquireProductView = BaseView.extend({
  events: {
    'click input[name="hasProduct"]': 'onSelectProduct',
    'click input[name="analysis-help"]': 'onSelectAnalyticHelp',
  },
  onSelectProduct: function() {
    var val = $('input[name="hasProduct"]:checked').val();
    if (val === 'No') {
      this.$('[name="select-product"]').attr('disabled', 'disabled');
      this.$('[name="select-intrested-company"]').parent().addClass('hidden');
      this.$('[name="type-of-prod"]').parent().removeClass('hidden');
      this.$('[name="analysis-help"]').
      closest('.radio-arrange').removeClass('hidden');
      this.onSelectAnalyticHelp();
    } else {
      this.$('[name="select-product"]').removeAttr('disabled');
      this.$('[name="select-intrested-company"]').
      parent().removeClass('hidden');
      this.$('[name="type-of-prod"]').parent().addClass('hidden');
      this.$('[name="analysis-help"]').
      closest('.radio-arrange').addClass('hidden');
    }
  },
  onSelectAnalyticHelp: function() {
    var val = $('input[name="analysis-help"]:checked').val();
    if (val === 'No') {
      this.$('[name="type-of-prod"]').parent().removeClass('hidden');
    } else {
      this.$('[name="type-of-prod"]').parent().addClass('hidden');
    }
  },
  render: function() {
    var template = _.template($('#inquire-product-tmpl').html());
    this.$el.html(template());
    this.onSelectProduct();
    var tat = this;
    if (rfpObj.inquireProducts &&
      rfpObj.inquireProducts.length > 0) {
      getData('/rfp/products',
        rfpObj.inquireProducts, callbackprods);
    }
    if (rfpObj.inquireCompanies &&
      rfpObj.inquireCompanies.length > 0) {
      getData('/rfp/companies',
        rfpObj.inquireCompanies, callbackcomps);
    }
    function callbackprods(err, companyId) {
      var sel = tat.$el.
      find('select[name="select-product"]');
      setDefaults(err, companyId, sel);
    }
    function callbackcomps(err, companyId) {
      var sel = tat.$el.
      find('select[name="select-intrested-company"]');
      setDefaults(err, companyId, sel);
    }
    function setDefaults(err, companyId, sel) {
      try {
        sel.select2();
        sel.select2('destroy');
      } catch (exc) {
        console.log(exc);
      } finally {
        sel.empty();
      }
      for (var i = 0; companyId && i < companyId.length; i++) {
        sel.append('<option selected value="' +
        companyId[i]._id + '">' +
        companyId[i].name + '</option>');
      }
      setSelect2TypeAhead(sel, sel.attr('data-master'));
    }
  },
  getData: function() {
    this.clearErrors(this.$el);
    var toRet = {};
    var val = $('input[name="hasProduct"]:checked').val();
    if (val === 'Yes') {
      toRet.inquireProducts = this.$('[name="select-product"]').val();
      if (toRet.inquireProducts === null) {
        this.addErrorMsg(this.$('[name="select-product"]').parent(),
          'Products are required');
        return null;
      }
      toRet.inquireCompanies =
this.$('[name="select-intrested-company"]').val();
      if (toRet.inquireCompanies === null) {
        this.addErrorMsg(this.$('[name="select-intrested-company"]').parent(),
          'Companies are required');
        return null;
      }
    } else {
      var tat = this;
      (function() {
        var val2 = tat.$('input[name="analysis-help"]:checked').val();
        toRet.needAnalyticHelp = val2;
        if (val2 !== 'Yes') {
          toRet.typeOfProd = tat.$('[name="type-of-prod"]').val();
        }
      })();

    }
    return toRet;
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


var RfpAddCompanyView = BaseView.extend({
  initData: {
    target: '#addComapnyModal',
    toggle: 'modal',
  },
  render: function() {
    var template = _.template($('#add-company').html());
    this.$el.html(template(this.initData));
  },
  getData: function() {
    var obj = {};
    obj[this.$el.attr('name')] = this.$el.find('select').val();
    return obj;
  },
});

var RfpModalview = BaseView.extend({
  initData: {
    id: 'addComapnyModal',
  },
  render: function() {
    var template = _.template($('#popup-tmpl').html());
    this.$el.html(template(this.initData));
  },
  getData: function() {
    return;
  },
});

var RfpReciepentListview = BaseView.extend({
  events: {
    'click .unselect': 'onUnSelect',
  },
  onUnSelect: function(evt) {
    evt.preventDefault();
    console.log(evt.target);
    var recp = rfpObj[$(evt.target).attr('data-type')];
    recp.splice($(evt.target).attr('data-unselect'), 1);
    this.render();
    /* - if (recp.length <= 0) {
      app.navigate('next/2',
                {trigger: true, });
    } */
  },
  render: function() {
    var tat = this;
    var renderObj = {companies: [], products: [], };
    var tmpl = _.template($('#reciepent-list-tmpl').html());
    this.model.set({reciepents: renderObj});
    this.$el.html(tmpl(this.model.toJSON()));
    if (rfpObj.inquireCompanies &&
      rfpObj.inquireCompanies.length > 0) {
      getData('/rfp/companies',
        rfpObj.inquireCompanies, callback);
    }
    if (rfpObj.inquireProducts &&
      rfpObj.inquireProducts.length > 0) {
      getData('/rfp/products',
        rfpObj.inquireProducts, callback2);
    }
    function callback(err, companyList) {
      renderObj.companies = companyList;
      var template = _.template($('#reciepent-list-tmpl').html());
      tat.model.set({reciepents: renderObj});
      tat.$el.html(template(tat.model.toJSON()));
    }
    function callback2(err, companyList) {
      renderObj.products = companyList;
      var template = _.template($('#reciepent-list-tmpl').html());
      tat.model.set({reciepents: renderObj});
      tat.$el.html(template(tat.model.toJSON()));
    }
  },
  getData: function() {
    return;
  },
});

var RfpEditQueModalview = BaseView.extend({
  events: {
    'click #save-edited': 'onSaveEditedQue',
    'change select[name="change-que-type"]': 'onQueTypeChanged',
  },
  onQueTypeChanged: function(evt) {
    var tmpl = _.template($('#default-answers-tmpl').html());
    var queToEdit = this.model.get('questionGroups');
    if ($(evt.target).val() !== '0') {
      $('.answers-container').html(tmpl(queToEdit[parseInt(this.queType)].
    questions[parseInt(this.queIndx)]));
    }else {
      $('.answers-container').empty();
    }
    $('.answers-container select').select2({
      tags: true,
    });
  },
  onSaveEditedQue: function(evt) {
    console.log(this.queType);
    var editedQueText = $(evt.target).closest('.modal-content').
    find('input[name="edited-question"]').val();
    var multiAnswers = $(evt.target).closest('.modal-content').
    find('select[name="multi-answers"]').val();
    var type = $(evt.target).closest('.modal-content').
    find('select[name="change-que-type"]').val();
    var subGrp = $(evt.target).closest('.modal-content').
    find('input[name="edit-subgroup"]').val();
    var queToEdit = this.model.get('questionGroups');
    queToEdit[parseInt(this.queType)].
    questions[parseInt(this.queIndx)].title = editedQueText;
    queToEdit[parseInt(this.queType)].
    questions[parseInt(this.queIndx)].type = type;
    queToEdit[parseInt(this.queType)].
    questions[parseInt(this.queIndx)].subGroup = subGrp;

    if (type !== '0') {
      queToEdit[parseInt(this.queType)].
      questions[parseInt(this.queIndx)].answerEnum = multiAnswers;
    }else {
      queToEdit[parseInt(this.queType)].
      questions[parseInt(this.queIndx)].scored = true;
      queToEdit[parseInt(this.queType)].
      questions[parseInt(this.queIndx)].critical = false;
    }
    this.parent.render(this.subView, this.queType);
    $('#edit-question-modal').modal('hide');

  },
  className: 'modal-content',
  render: function() {
    var template = _.template($('#edit-que-popup-tmpl').html());
    var queToEdit = this.model.get('questionGroups');
    var renderObj = {
      que: queToEdit[parseInt(this.queType)].questions[parseInt(this.queIndx)],
      queTypes: this.model.get('questionTypes'),
    };
    this.$el.html(template(renderObj));
    console.log(this.model);
  },
  getData: function() {
    return;
  },
});


var RfpQuestionsview = BaseView.extend({

  events: {
    'click input.add-std-que': 'onAddRemStdQue',
    'click .add-que': 'onAddNewQue',
    'click .saveQue': 'onBeforeSaveNewQue',
    'click .edit-que': 'onEditQue',
    'change .weight': 'onChangeWeight',
    'change .score-select': 'onChangeCriticalScored',
    'change .critical-select': 'onChangeCritical',
    'click .delete-que': 'ondeleteQue',
  },
  ondeleteQue: function(evt) {
    var target = $(evt.target);
    var queIndx = target.closest('.std-que').attr('data-index');
    var queType = target.closest('.tab-pane').attr('data-index');
    var ques = this.model.get('questionGroups');
    ques[parseInt(queType)].questions.splice(queIndx, 1);
    this.model.set(ques);
    var subView = $(evt.target).closest('.tab-pane').attr('id');
    this.render(subView, queType);
  },
  onChangeCritical: function(evt) {
    $(evt.target).val();
    var target = $(evt.target);
    var setScoredCritical = target.val()?false:true;
    var queIndx = target.closest('.std-que').attr('data-index');
    var queType = target.closest('.tab-pane').attr('data-index');
    var ques = this.model.get('questionGroups');
    ques[parseInt(queType)].questions[queIndx].critical = !setScoredCritical;
    ques[parseInt(queType)].questions[queIndx].scored = setScoredCritical;
    ques[parseInt(queType)].questions[queIndx].criticalValue =
    [target.val()] || [];
    this.model.set(ques);
    var subView = $(evt.target).closest('.tab-pane').attr('id');
    this.render(subView, queType);
  },
  onChangeCriticalScored: function(evt) {
    (function() {
      if (!evt.target.checked) {
        evt.preventDefault();
        evt.target.checked = true;
        return false;
      }
    })();

    var target = $(evt.target);
    var setScoredCritical = evt.target.checked?false:true;
    var queIndx = target.closest('.std-que').attr('data-index');
    var queType = target.closest('.tab-pane').attr('data-index');
    var ques = this.model.get('questionGroups');
    if (target.hasClass('critical-select')) {
      ques[parseInt(queType)].questions[queIndx].critical = evt.target.checked;
      ques[parseInt(queType)].questions[queIndx].scored = setScoredCritical;
    }else {
      ques[parseInt(queType)].questions[queIndx].scored = evt.target.checked;
      ques[parseInt(queType)].questions[queIndx].critical = setScoredCritical;
    }
    this.model.set(ques);
    var subView = $(evt.target).closest('.tab-pane').attr('id');
    this.render(subView, queType);
  },
  onChangeWeight: function(evt) {
    var target = $(evt.target);
    var weight = $(evt.target).val();
    var queIndx = target.closest('.std-que').attr('data-index');
    var queType = target.closest('.tab-pane').attr('data-index');
    var ques = this.model.get('questionGroups');
    ques[parseInt(queType)].questions[queIndx].weight = weight;
    this.model.set(ques);
  },
  onEditQue: function(evt) {
    evt.preventDefault();
    var queToEdit = this.model.get('questionGroups');
    var queType = $(evt.target).closest('.tab-pane').attr('data-index');
    var queIndx = $(evt.target).attr('data-index');
    var subView = $(evt.target).closest('.tab-pane').attr('id');
    this.editView = new RfpEditQueModalview({
      model: this.model,
      queType: queType,
      queIndx: queIndx,
      parent: this,
      subView: subView,
    });
    var popup = $('#edit-question-modal .modal-dialog');
    this.editView.render();
    popup.html(this.editView.$el);
    $('#edit-question-modal').modal('show');
    var type = queToEdit[parseInt(queType)].
    questions[parseInt(queIndx)].type || '0';
    $('#edit-question-modal').
    find('select[name="change-que-type"]').val(type).change();
  },
  onBeforeSaveNewQue: function(evt) {
    evt.preventDefault();
    this.clearErrors($(evt.target).
        closest('.addNewQueContainer').
    find('input[name="newQuestion"]').parent());
    this.onSaveNewQue(evt);
  },
  onSaveNewQue: function(evt) {
    var ques = [];
    var allQue = [];
    var indx = $(evt.target).closest('.tab-pane').attr('data-index');
    ques = this.model.get('questionGroups');
    allQue = ques[parseInt(indx)].questions;
    var newQue = $(evt.target).closest('.addNewQueContainer').
    find('input[name="newQuestion"]').val();
    if (newQue.length <= 0 || ($.trim(newQue)).length === 0) {
      this.addErrorMsg($(evt.target).
        closest('.addNewQueContainer').
    find('input[name="newQuestion"]').parent(),
        'Please enter a question');
      return;
    }
    var wt = $(evt.target).closest('.addNewQueContainer').
    find('input.add-weight').val();
    allQue.push({
      title: newQue,
      critical: false,
      scored: true,
      weight: wt,
      isStandard: false,
      answerEnum: ['Yes', 'No'],
      type: '0',
    });
    this.model.set(ques);
    $(evt.target).closest('.addNewQueContainer').
    find('input[name="newQuestion"]').val('');
    var subView = $(evt.target).closest('.tab-pane').attr('id');
    this.render(subView, indx);
  },
  onAddNewQue: function(evt) {
    evt.preventDefault();
    $(evt.target).closest('.tab-pane').find('.addNewQueContainer').
    html($('#add-new-que-tmpl ').html());
    $('.add-weight').rating({
  filled: 'fa fa-circle',
  filledSelected: 'fa fa-circle',
  empty: 'fa fa-circle-o',
});
  },
  onAddRemStdQue: function(evt) {
    var val =
    $('input[name="' +
      $(evt.target).attr('name') + '"]:checked').val();
    var ques = [];
    var allQue = [];
    var showStd = val !== 'No';
    ques = this.model.get('questionGroups');
    ques[parseInt($(evt.target).attr('data-index'))].isStdQuestion = showStd;
    this.model.set(ques);
    var subView = $(evt.target).closest('.tab-pane').attr('id');
    this.render(subView, $(evt.target).attr('data-index'));
  },
  render: function(subView, ind) {

    this.model.set({
      questionGroups: rfpObj.questionGroups,
    });
    var template = null;
    var ques = [];
    if (subView) {
      template = _.template($('#question-list-tmpl').html());
      ques = this.model.get('questionGroups');
      ques[parseInt(ind)].questionTypes = this.model.get('questionTypes');
      var renderObj = {
        ques: ques,
        ind: parseInt(ind),
      };
      (function() {
        var count = 0;
        _.each(ques[parseInt(ind)].questions, function(question , i) {
          if ((ques[parseInt(ind)].isStdQuestion &&
            question.isStandard) ||
            (!question.isStandard)) {
            count++;
          }
        });
        $('#' + subView).find('.question-list').
        closest('.signupForm').find('li.active[role="presentation"]').
        find('[href="#question-' + ind + '"]').
        html(ques[parseInt(ind)].title + '(' + count + ')');
      })();
      $('#' + subView).find('.question-list').
      html(template(renderObj));
    }else {
      template = _.template($('#add-questions-tmpl').html());
      this.$el.html(template(this.model.toJSON()));
    }
    $('.critical-select').select2({});
    $('.weight').rating({
  filled: 'fa fa-circle',
  filledSelected: 'fa fa-circle',
  empty: 'fa fa-circle-o',
});
  },
  getData: function() {
    return {questionGroups: this.model.get('questionGroups')};
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
      rfpObj.cover = rfpObj.cover || {};
      rfpObj.cover.image = companyId[0].logo;
    }
  },
  getData: function() {
    return;
  },
});


var RfpProfileView = BaseView.extend({
  render: function() {
    var tat = this;
    var template = _.template($('#profile-tmpl').html());
    (function() {
      if (rfpObj.companyId) {
        getData('/rfp/companies', rfpObj.companyId, callback);
      }else {
        tat.$el.html(template({rfpProfile: rfpProfile}));
      }
      if (rfpObj.solutionsInPlaceIds && rfpObj.solutionsInPlaceIds.length > 0) {
        getData('/rfp/products', rfpObj.solutionsInPlaceIds, callback2);
      }else {
        tat.$el.html(template({rfpProfile: rfpProfile}));
      }
      if (rfpObj.inquireProducts &&
        rfpObj.inquireProducts.length > 0) {
        getData('/rfp/products',
          rfpObj.inquireProducts, callback4);
      }else {
        rfpProfile.productList = [];
        tat.$el.html(template({rfpProfile: rfpProfile}));
      }
      if (rfpObj.inquireCompanies &&
        rfpObj.inquireCompanies.length > 0) {
        getData('/rfp/companies',
          rfpObj.inquireCompanies, callback3);
      }else {
        rfpProfile.companyList = [];
        tat.$el.html(template({rfpProfile: rfpProfile}));
      }
    })();

    function callback3(err, companyList) {
      rfpProfile.companyList = companyList;
      tat.$el.html(template({rfpProfile: rfpProfile}));
    }
    function callback4(err, productList) {
      rfpProfile.productList = productList;
      tat.$el.html(template({rfpProfile: rfpProfile}));
    }
    function callback(err, companyId) {
      companyId = companyId || [];
      rfpProfile.companyId = companyId[0];
      tat.$el.html(template({rfpProfile: rfpProfile}));
    }
    function callback2(err, solutionsInPlaceIds) {
      solutionsInPlaceIds = solutionsInPlaceIds || [];
      rfpProfile.solutionsInPlaceIds = solutionsInPlaceIds;
      tat.$el.html(template({rfpProfile: rfpProfile}));
    }
  },
  getData: function() {
    return;
  },
});

var RfpCoverView = BaseView.extend({
  events: {
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
  render: function() {
    this.changed = false;
    var template = _.template($('#cover-letter-tmpl').html());
    rfpObj.cover = rfpObj.cover || {};
    rfpObj.milestones =
    rfpObj.milestones &&
    rfpObj.milestones.length > 0 ? rfpObj.milestones : [{title: '',
    date: null, }, ];
    rfpObj.responseDeadLine =
    rfpObj.responseDeadLine?  new Date(rfpObj.responseDeadLine): null;
    rfpObj.willAcceptLateResponse = rfpObj.willAcceptLateResponse || false;
    this.$el.html(template(rfpObj));
    this.$el.
    find('[name="correspondDate"]').datepicker({
      format: 'dd/mm/yyyy',
      startDate: new Date(),
    });
    this.$el.
    find('[name="responseDate"]').datepicker({
      format: 'dd/mm/yyyy',
      startDate: new Date(),
    });
    var tat = this;
    (function() {
      if (rfpObj.milestones[0].date) {
        tat.$el.
        find('[name="correspondDate"]').
        datepicker('setUTCDate', new Date(rfpObj.milestones[0].date));
      }else {
        tat.$el.
        find('[name="correspondDate"]').
        datepicker('setUTCDate', new Date());
      }
      if (rfpObj.responseDeadLine) {
        tat.$el.
        find('[name="responseDate"]').
        datepicker('setUTCDate', new Date(rfpObj.responseDeadLine));
      }else {
        tat.$el.
      find('[name="responseDate"]').
      datepicker('setUTCDate', new Date());
      }
    })();


    var elem = this.$el.
    find('[name="lateResponses"][value="' +
      rfpObj.willAcceptLateResponse + '"]');
    elem.trigger('click');
  },
  validateFields: function(ele, plchldr) {
    if (ele.val().length <= 0) {
      this.addErrorMsg(ele.parent(),
        plchldr + ' field is required');
      return null;
    }
    return '200';
  },
  getData: function() {
    this.clearErrors(this.$el);
    var returnObj = {};
    /* = if (this.validateFields(this.$el.find('[name="desc"]')) === null) {
      return null;
    } */
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
      returnObj.image = getBase64Image($('img.rfpPic')[0]);
    }
    returnObj.cover = rfpObj.cover || {};
    returnObj.cover.description =
    this.$el.find('[name="desc"]').val();
    if (this.validateFields(this.$el.
      find('[name="milestoneTitle"]'), 'Milestone Title') === null) {
      return null;
    }
    /* = if (this.validateFields(this.$el.
      find('[name="milestoneComments"]')) === null) {
      return null;
    } */
    returnObj.milestones = [{
      title: this.$el.find('[name="milestoneTitle"]').val(),
      date: this.$el.find('[name="correspondDate"]').datepicker('getUTCDate'),
      comment: this.$el.find('[name="milestoneComments"]').val(),
    }, ];
    returnObj.responseDeadLine =
    this.$el.find('[name="responseDate"]').datepicker('getUTCDate');
    returnObj.willAcceptLateResponse =
    this.$el.find('[name="lateResponses"]:checked').val();
    return returnObj;
  },
});



var RfpSummaryView = BaseView.extend({
  events: {
    'hidden.bs.collapse #accordion': 'toggleChevron',
    'shown.bs.collapse #accordion': 'toggleChevron',
  },
  toggleChevron: function(e) {
    $(e.target)
    .prev('.panel-heading')
    .find('.fa.text-primary')
    .toggleClass('black');
  },
  render: function() {
    var tat = this;
    var list = [];
    if (rfpObj.inquireCompanies &&
      rfpObj.inquireCompanies.length > 0) {
      getData('/rfp/companies',
        rfpObj.inquireCompanies, callback);
    }
    callback(null, []);
    function callback(err, companyList) {
      list = list.concat(companyList);
      var template = _.template($('#summary-tmpl').html());
      tat.$el.html(template(
        {
          reciepents: list,
          questionGroups: rfpObj.questionGroups,
          questionTypes: questionTypes,
          rfpProfile: rfpProfile,
          RfpProductQ2Model: RfpProductQ2Model.get('options'),
          RfpProductQ4Model: RfpProductQ4Model.get('options'),
        }
        ));
      $('.weight').rating({
  filled: 'fa fa-circle',
  filledSelected: 'fa fa-circle',
  empty: 'fa fa-circle-o',
});
    }
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