$(function() {
  if (localStorage.data === 'data') {
    $('#username').val(localStorage.usrname);
    $('#pass').val(localStorage.pass);
    $('#remember_me').attr('checked', 'checked');
  }
  function rememberMe() {
    if (localStorage) {
      try {
        if ($('#remember_me').is(':checked')) {
          // Save username and password
          localStorage.usrname = $('#username').val();
          localStorage.pass = $('#pass').val();
          localStorage.chkbx = $('#remember_me').val();
          localStorage.data = 'data';
        } else {
          localStorage.usrname = '';
          localStorage.pass = '';
          localStorage.chkbx = '';
          localStorage.data = 'null';
        }
      } catch (ex) {
      }
    }
    document.getElementById('form').submit();
  }
  function validateEmail(email) {
    var re =
    new RegExp (['^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)',
                        '*\\w[\\w-]{0,66})\\.([a-z]{2,6}',
                        '(?:\\.[a-z]{2})?)$', ].join(''));
    return re.test(email);
  }
  $('button.signin').click(function(e) {
    e.preventDefault();
    $('#username').parent().find('label.error').remove();
    $('#pass').parent().find('label.error').remove();
    var testEmail = validateEmail($('#username').val());
    if (!testEmail) {
      $('#username').parent().
append('<label class="error alert alert-danger">' +
  'A valid email is required. </label>');
      if ($('#pass').val().length <= 0)      {
        $('#pass').parent().
append('<label class="error alert alert-danger">' +
   'Password is required. </label>');
      }
    }else {
      if ($('#pass').val().length <= 0)    {
        $('#pass').parent().
        append('<label class="error alert alert-danger">' +
   'Password is required. </label>');
      }else {
        rememberMe();
      }
    }
  });
});
