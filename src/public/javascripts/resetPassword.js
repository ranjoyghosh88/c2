$(function() {
  $('#reset').click(validatePassword);
  function validatePassword(e) {
    e.preventDefault();
    var testPass = checkPwd();
    $('#password').parent().find('label.error').remove();
    $('#cpassword').parent().find('label.error').remove();
    if (testPass === 'ok') {
      var testCpass = checkCpass();
      if (testCpass === 'ok') {
        document.getElementById('form').submit();
      }else {
        $('#cpassword').parent().
       append('<label class="error alert alert-danger">' +
           'Password do not match</label>');
      }
    }else {
      $('#password').parent().
     append('<label class="error alert alert-danger">' +
         'Password should contain atleast 8 characters ' +
         'with atleast 1 lowercase,uppercase & numeric characters' +
         '</label>');
      if (testCpass === 'ok') {
      }else {
        $('#cpassword').parent().
       append('<label class="error alert alert-danger">' +
           'Password do not match</label>');
      }
    }
  }
  function checkCpass() {
    if ($('#password').val() === $('#cpassword').val()) {
      return 'ok';
    }else {
      return 'failed';
    }
  }
  checkPwd = function() {
    var str = $('#password').val();
    if (str.length <= 0) {
      return ('This field is required.');
    } else if (str.length < 8) {
      return ('Password should be minimum 8 characters in length');
    } else if (str.length > 100) {
      return ('Password should not exceed 100 characters');
    } else if (str.search(/\d/) === -1) {
      return ('Password should contain atleast 1 numeric character');
    } else if (str.search(/[a-z]/) === -1) {
      return ('Password should contain atleast 1 lowercase letter');
    }else if (str.search(/[A-Z]/) === -1) {
      return ('Password should contain atleast 1 uppercase letter');
    }
    return ('ok');
  };
});