$(document).ready(function() {
  $('table .date', '.rfp-dashboard').each(function() {
    $(this).text(
      moment($(this).text()).format('MMM DD, hh:mmA'));
  });
  var isAppended = false;
  /* -
   * $('.all-rfp-table').DataTable({
    serverSide: true,
    responsive: true,
    ordering: false,
    dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
    ajax: {
      url: '/rfp/rfp-dashboard/all',
    },
    initComplete: function(setting, json) {
      $('[href="#allrfps"] .count').text(json.recordsTotal);
    },
    headerCallback: function(thead, data, start, end, display) {
      if (!isAppended) {
        $('th', thead)
        .append('<i class="fa fa-chevron-down fa_Marginleft"></i>');
        isAppended = true;
      }
    },
    pageLength: 5,
    columns: [{
        title: 'Name',
        data: 'title',
      },
     {
        title: 'Company',
        className: 'text-capitalize',
        data: 'companyId.name',
      },
    {
        title: 'Owner',
        className: 'text-capitalize',
        data: function(item) {
          return item.userLog.createdBy.userId.name +
         ' ' + item.userLog.createdBy.userId.lastName;
        },
      },
    {
        title: 'Date',
        data: function(item) {
          return moment(item.userLog.createdBy.date).format('MMM DD, hh:mmA');
        },
      }, {
        title: 'Status',
        className: 'text-capitalize',
        createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
          $(cell).addClass(rowData.state);
        },
        data: function(item) {
          var stateText = item.state;
          if (stateText === 'completed') {
            stateText = 'Published';
          }
          if (parseInt(item.responseCount) > 0) {
            stateText = 'Response Received (' + item.responseCount + ')';
          }
          return stateText;
        },
      }, ],
  });
   * */
  $('.my-rfp-table,.all-rfp-table').DataTable({
    ordering: false,
    dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
    pageLength: 5,
  });
  var $manageRes = $('#manage-response');
  $manageRes.click(function(evt) {
    if ($(this).attr('disabled')) {
      return evt.preventDefault();
    }
    var $chkbox = $('#my-rfp .check-rfp:checked');
    if ($chkbox.length === 1 && $chkbox.closest('tr').data('response') > 0) {
      var rfpId = $chkbox.closest('tr').data('rfpid');
      if (rfpId) {
        window.location = '/rfp-analyze-summary/' + rfpId;
      }
    }
  });
  $('.rfp-dashboard').on('click', '.check-rfp', function() {
    var $chkbox = $('#my-rfp .check-rfp:checked');
    if ($chkbox.length === 1 && $chkbox.closest('tr').data('response') > 0) {
      $manageRes
      .removeAttr('disabled')
      .removeClass('disabled');
    } else {
      $manageRes
      .attr('disabled', 'disabled')
      .addClass('disabled');
    }
  });
});