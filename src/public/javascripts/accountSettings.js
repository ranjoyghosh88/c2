$(function() {
  $('#emailnotify').hide();
  $('#errornotify').hide();
  $('.change').on('click', function(evt) {
    evt.preventDefault();
    $('.password').addClass('hide');
    $('.changePassword').removeClass('hide');
  });
  $('.remove').on('click', function() {
    $('.stripeId').hide();
  });
  $('#resetForm button').click(function(e) {
    e.preventDefault();
    $('#resetForm button').attr('disabled', true);
    var parameter = {
      email: $('#sptoken').attr('value'),
    };
    $.ajax({
      url: 'api/sendPasswordResetEmail',
      type: 'post',
      data: parameter,
    })
  .done(function(data) {
      $('#emailnotify').show();
      $('#resetForm button').attr('disabled', false);
    })
.fail(function(err) {
      if (err && ((err.status === 403) ||
(err.responseText && JSON.parse(err.responseText).code === 403))) {
        window.location.href = '/error/403';
      }
      $('#errornotify').show();
      $('#resetForm button').attr('disabled', false);
    });
  });
  $('.removeResponderButton').on('click', function(e) {
    var companyIdVal = $('#companyId').val();
    var inputValues = {
      responderId: $(e.target).attr('id'),
      companyId: companyIdVal,
    };
    removeResponder(inputValues);
    $(this).closest('tr').remove();
  });
  function removeResponder(inputValues) {
    $.ajax({
      url: '/quickSupport/removeResponder',
      type: 'POST',
      data: inputValues,
    })
    .done(function(data) {
      location.reload();
    });
  }
});