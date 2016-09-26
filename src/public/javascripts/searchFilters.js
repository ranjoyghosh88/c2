function toggleChevron(e) {
  $(e.target)
      .prev('.panel-heading')
      .find('a.indicator')
      .toggleClass('fa-minus-square-o  fa-plus-square-o');
}
$('#filterAccordion').on('hidden.bs.collapse', toggleChevron);
$('#filterAccordion').on('shown.bs.collapse', toggleChevron);
$(function() {
  $('.searchText').each(function() {
    var textValue = $(this).val();
    if (textValue !== '') {
      $(this).parents('.panel-collapse')
      .siblings('.panel-heading').find('a').css('color', '#329ddc');
    }
  });
  $('#filterAccordion select').on('change', function() {
    var $elm = $(this).closest('.panel-default')
    .find('.panel-heading a.filterheader');
    if ($(this).val() && $(this).val().length) {
      $elm.css({color: 'rgb(50, 157, 220)'});
    }else {
      $elm.css({color: 'inherit'});
    }
  }).trigger('change');
});