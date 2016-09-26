$(document).ready(function() {
  if (!rfpId) {
    window.location = '/404';
    return;
  }
  function getSelectedIds() {
    var ids = [];
    $('.response-item').each(function() {
      ids.push($(this).data('resid'));
    });
    return ids;
  }
  $('.sortable').sortable({
    connectWith: '.sortable',
    stop: function(event, ui) {
      $('.sortable .index').each(function(index) {
        $(this).text(index + 1);
      });
    },
  });
  $('#review-submission').click(function(evt) {
    evt.preventDefault();
    var selected = getSelectedIds();
    window.location = '/rfp-analyze-compare/' +
    rfpId + '?' + $.param({ ids: selected });
  });
});
