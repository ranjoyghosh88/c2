(function($) {
  $('.home-container').addClass('full-bg');
  $('.carousel-inner').each(function(i, carousel) {
    $(carousel).find('.item').each(function(i, item) {
      var data = $(item).find('.carousel-data');
      switch (data.length){
        case 1: {
          data.removeClass('col-md-3 col-sm-6 col-lg-3');
          break;
        }
        case 2: {
          data.removeClass('col-md-3 col-sm-6 col-lg-3').addClass('col-sm-4');
          data.first().addClass('col-sm-offset-2');
          break;
        }
        case 3: {
          data.removeClass('col-md-3 col-lg-3').addClass('col-md-4');
          break;
        }
      }
    });
  });
})(jQuery);
