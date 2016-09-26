$(function() {
  $('.date').each(function() {
    $(this).text(
      moment($(this).text(), 'ddd, DD MMM YYYY hh:mm:ss').
      format('MMM DD YYYY, HH:mm'));
  });

  $('a#actButton').click(function() {
    $('#askKB').submit();
    return false;
  });
  if ($(window).width() >= 1200) {
    setHeight(3);
  } else if (($(window).width() < 1200) && ($(window).width() > 767)) {
    setHeight(2);
  }
  /* - if ($(window).width() <= 767) {
    var r = $('.dashboard');
    r.append($('#profileTabs'));
    $('#profileTabs').eq(0).remove();
  } else {
    if ($('.toRemove').has('#profileTabs')) {
      $('.toRemove').append($('#profileTabs'));
    }
  } */
});
$(window).resize(function() {
  if ($(window).width() >= 1200) {
    setHeight(3);
  } else if (($(window).width() < 1200) && ($(window).width() > 767)) {
    setHeight(2);
  }
  /* -  if ($(window).width() <= 767) {
    var r = $('.dashboard');
    r.append($('#profileTabs'));
    $('#profileTabs').eq(0).remove();
  } else {
    if ($('.toRemove').has('#profileTabs')) {
      $('.toRemove').append($('#profileTabs'));
    }
  } */
});
function setHeight(n) {
  var p = $('.contentBox');
  var a = 0;
  var len = p.length / n;
  for (var j = 0; j < len; j++) {
    var p1 = p.splice(a, n);
    var c = 'row' + j;
    getMaxHeight(p1, c);
  }
}
function getMaxHeight(arr, className) {
  var ht = [];
  for (var i = 0; i < arr.length; i++) {
    $(arr[i]).addClass(className);
    ht.push($(arr[i]).find('.panel').height());
  }
  var maxValueInArray = Math.max.apply(Math, ht);
  $('.' + className + ' .panel').height(maxValueInArray);
  var margin = maxValueInArray * 30 / 100;
  $('.contentBox .marginDynamic')
  .css({
    'margin-top': margin,
    display: 'inline-block',
  });
}
$(document).ready(function() {
  $('#blogs a').attr('target', '_blank');
});