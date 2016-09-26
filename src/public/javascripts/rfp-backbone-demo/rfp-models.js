var rfpObj = {
  title: '',
  questionGroups: [{
      title: 'Functional',
      isStdQuestion: false,
      questions: [{
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, ],
    }, {
      title: 'Technical',
      isStdQuestion: false,
      questions: [{
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, ],
    }, {
      title: 'Business',
      isStdQuestion: true,
      questions: [{
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, ],
    }, {
      title: 'Legal & Contract',
      isStdQuestion: true,
      questions: [{
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, {
          title: 'functional-Do you support Subscription Billing?',
          critical: true,
          scored: false,
          weight: 3,
          isStandard: true,
          answerEnum: ['Yes', 'No'],
          type: '0',
        }, ],
    }, ],
};
var rfpProfile = {companyList: [], productList: [], };
var questionTypes = ['Free form text', 'Single Select', 'Multi Select'];
var BaseModel = Backbone.Model.extend({
  defaults: {
    title: 'No question specified',
    name: null,
    value: '',
    type: 'text',
    placeholder: 'Enter value',
    questionTypes: questionTypes,
  },
});
var RfpProductQ1Model = new BaseModel({
  title: '1. What is the desired timeframe to purchase?',
  name: 'timeFrame',
  errorMsg: 'TimeFrame is required',
  placeholder: 'Timeframe',
});
var RfpProductQ2Model = new BaseModel({
  title: '2. What is the current budget for this purchase?',
  name: 'budget',
  errorMsg: 'Budget is required',
  placeholder: 'Budget',
});
var RfpProductQ4Model = new BaseModel({
  title: '4. What brings you to the RFP process?',
  name: 'whyRFP',
  errorMsg: 'Please select an option for RFP process',
  placeholder: 'RFP process',
});
var RfpSelectProductTypeAheadModel = new BaseModel({
  title: '3. What solutions are currently in place?',
  name: 'solutionsInPlaceIds',
  dataMaster: 'products',
  dataPlaceholder: 'Select Product',
  multiple: true,
  errorMsg: 'Please select current solutions in place',
});
var RfpSelectTypeAheadModel = new BaseModel({
  title: 'What Company is this RFP for?',
  name: 'companyId',
  dataMaster: 'companies',
  dataPlaceholder: 'Select Company',
  multiple: false,
  errorMsg: 'Please provide the company name',
});
var RfpReciepentList = new BaseModel({
  reciepents: [{
      name: 'xyz',
      uid: 'lkj',
      logo: '/images/logo.png',
    },
  {
      name: 'xyz',
      uid: 'lkj',
      logo: '/images/logo.png',
    },
  {
      name: 'xyz',
      uid: 'lkj',
      logo: '/images/logo.png',
    },
  ],
});
var RfpAddQuestionsModel = new BaseModel({
  questions: {},
});
function initRfpModels(callback) {
  async.map([
    { url: '/master/rfpTimeFrames', model: RfpProductQ1Model },
    { url: '/master/rfpBudget', model: RfpProductQ2Model },
    { url: '/master/rfpWhy', model: RfpProductQ4Model},
  ],
    function(obj, cb) {
    $.getJSON(obj.url, function(data) {
      obj.model.set({
        options: data,
      });
      cb();
    })
    .fail(function(err) {
      cb(err);
    });
  }, callback);
}