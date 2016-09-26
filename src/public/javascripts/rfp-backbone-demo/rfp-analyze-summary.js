var rfpSummaryTmpl = _.template($('#rfp-summary-item').html());
var ResponseSummaryView = Backbone.View.extend({
  events: {
    'click .summary-check': 'onCheckClick',
  },
  onCheckClick: function(evt) {
    var data = $(evt.target).closest('tr').data('tr-data');
    $(evt.target).closest('.response-data')
    .toggleClass('gray-border blue-border');
    if (data.isChecked) {
      data.isChecked = false;
    } else {
      data.isChecked = true;
    }
  },
  getSelectedIds: function() {
    var toRet = [];
    _.filter(this.model, function(obj) {
      if (obj.isChecked) {
        toRet.push(obj._id);
      }
    });
    return toRet;
  },
  render: function() {
    var $table = this.$('#rfp-respond-table');
    $table.DataTable({
      data: this.model,
      dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>',
      pageLength: 3,
      columns: [{
          title: '',
          data: null,
          createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
            if (rowData.isChecked === undefined) {
              rowData.isChecked = false;
            }
            $(cell).closest('tr').data('tr-data', rowData);
            $(cell).html(rfpSummaryTmpl(rowData));
            if (rowData.cover.description && rowData.cover.description.length) {
              bindSeeeMore($('.seemoreQtext', cell));
              $('.seemoreQtext', cell).removeClass('hide');
            }
          },
        }, ],
    });
  },
});
$(document).ready(function() {
  if (!rfpId) {
    window.location = '/404';
    return;
  }
  var view = null;
  $.get('/rfp/analyze-summary/' + rfpId, function(responses) {
    view = new ResponseSummaryView({
      el: '#rfp-respond-summary',
      model: responses,
    });
    view.render();
  })
  .fail(function(err) {
    console.log(err);
    window.location = '/404';
    return;
  });
  $('#review-submission').click(function(evt) {
    evt.preventDefault();
    var selected = [];
    var url = '/rfp-analyze-reorder/';
    if (view) {
      selected = view.getSelectedIds();
      if (selected.length === 1 || view.model.length === 1) {
        url = '/rfp-analyze-compare/';
      }
    }
    window.location = url +
    rfpId + '?' + $.param({ ids: selected });
  });
});
