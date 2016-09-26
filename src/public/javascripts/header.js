$(function() {
  $('.navbar-right').hover(
    function() {
      $('.header-dropdown').css('display', 'block');
    },
    function() {
      $('.header-dropdown').css('display', 'none');
    }
  );
  $('.navbar-right').on('click', function() {
    $('.header-dropdown').css('display', 'block');
  });
});