if ($.fn.DataTable) {
  $.fn.DataTable.defaults = $.extend($.fn.DataTable.defaults, {
    drawCallback: function(tab) {
      $('.pagination', tab.nTableWrapper).wrap('<nav class="row">');
    },
    pagingType: 'full_numbers',
    language: {
      paginate: {
        first: '&#171;',
        last: '&#187;',
        previous: '&#8249;',
        next: '&#8250;',
      },
    },
  });
}
function bindSeeeMore(elm, $table) {
  $(elm).off('click');
  $(elm).click(function(e) {
    e.preventDefault();
    var $td = $(this).closest('td');
    var $tr = $(this).closest('tr');
    if ($(this).parent('.quoted-text').attr('data-less') !== 'true') {
      if (!$tr.data('prevHeight')) {
        $tr.data('prevHeight', $td.outerHeight());
      }
      $tr.find('.quoted-text').each(function(i, qt) {
        $(qt).removeClass('expand-collapse');
        $(qt).attr('data-less', 'true');
        $(qt).find('.seemoreQtext').text('less');
      });
    } else {
      var height = $tr.data('prevHeight');
      if (height && $table) {
        $tr.find('td').css({height: height});
      }
      $(this).closest('tr').find('.quoted-text').each(function(i, qt) {
        $(qt).addClass('expand-collapse');
        $(qt).attr('data-less', 'false');
        $(qt).find('.seemoreQtext').text('more');
      });
    }
    responsiveTable();
  });
  responsiveTable();
  function responsiveTable() {
    if ($table) {
      $table.find('tr').each(function(i, tr) {
        var maxHeightTabs = -1;
        $(tr).find('.td_height1')
    .each(function() {
          maxHeightTabs = maxHeightTabs > $(this)
        .outerHeight() ? maxHeightTabs : $(this).outerHeight();
        });
        $(tr).find('.td_height1')
    .each(function() {
          $(this).height(maxHeightTabs);
        });
      });
    }
  }
  if ($table) {
    $('.quoted-text').each(function(i, qt) {
      var ht = $(qt).height();
      if (parseInt(ht) < 94) {
        $(qt).closest('td').find('.seemoreQtext').remove();
      }
    });
  }
}
