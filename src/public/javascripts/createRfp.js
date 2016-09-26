createRfp = {
  init: function() {
    alert('load RFP');
    var view = new BindingView({model: bindModel});
  },
  load: function() {
    createRfp.init();
  },
};

var bindModel = new Backbone.Model({
  rfpName: '',
  rfpDueDate: '',
  rfpType: '',
  dueDate: '',
  rfpStatus: '',
  selectedRecipient: [{}],
  question: [],
});

var BindingView = Backbone.Epoxy.View.extend({
  el: '#createRfpView',
  bindings: {
    'input.rfpName': 'value:rfpName,events:["keyup"]',
    'input.rfpDueDate': 'value:rfpDueDate,events:["keyup"]',
    'span.rfpName': 'text:rfpName',
    'span.rfpDueDate': 'text:rfpDueDate',
  },
});

