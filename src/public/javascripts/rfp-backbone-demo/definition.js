var rfpWizard = [
  { view: 'page-1', step: 0 }, {view: 'page-2', step: 0},
  {view: 'page-3', step: 1}, {view: 'page-4', step: 1},
  {view: 'page-5', step: 2}, {view: 'page-6', step: 3},
  {view: 'page-7', step: 4},
];
var stepTitles = ['Company Information', 'Recipient Selection',
'Questions', 'Cover Letter & Milestones', 'Review & Finalize', ];


function setSelect2TypeAhead(el, attr) {
  el.select2({
          ajax: {
            url: '/rfp/' + attr,
            dataType: 'json',
            data: function(params) {
              return {
                q: params.term,
              };
            },
            delay: 250,
            processResults: function(data, page) {
              // == parse the results into the format expected by Select2.
              // == since we are using custom formatting functions we
              // == do not need to
              // == alter the remote JSON data
              var resultArray = data.map(function(elm) {
                return { id: elm._id, text: elm.name };
              });
              return {
                results: resultArray,
              };
            },
            cache: true,
          },
          escapeMarkup: function(markup) { return markup; },
          // == let our custom formatter work
          minimumInputLength: 1,
          // == omitted for brevity, see the source of this page
          // == omitted for brevity, see the source of this page
        });
}