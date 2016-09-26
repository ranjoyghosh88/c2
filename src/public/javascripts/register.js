
$(function() {
  $('[data-toggle="tooltip"]').tooltip();
  $('#password').hover(function() {
    $(this).tooltip();
  });
  function toggleProfessionalLvl() {
    var Val = $('select#functionalRole').val();
    if (Val === '4') {
      hidden();
    } else {
      visible();
    }
  }
  toggleProfessionalLvl();
  $('select#functionalRole').change(toggleProfessionalLvl);
  function visible() {
    $('select[name=professionalLevel]').closest('.form-group')
    .css('visibility', 'visible').css('position', 'relative');
    var $profLevl = $('select[name=professionalLevel]');
    if ($profLevl.length) {
      $profLevl.select2('val', '');
    }
  }
  function hidden() {
    $('select[name=professionalLevel]').closest('.form-group')
    .css('visibility', 'hidden').css('position', 'absolute');
    var $profLevl = $('select[name=professionalLevel]');
    if ($profLevl.length) {
      $profLevl.select2('val', '4');
    }
  }
  $('#groups').change(function() {
    $('#groupName').val($('#groups option:selected').text());
  });
  $('#step1').click(validatePassword);
  $(function() {
    $('#functionalRole').change(function() {
      $('.headpanel h2').
      text('Sign up as ' +
          $('#functionalRole option:selected').text());
    });
  });
  function validateEmail(email) {
    var re =
 new RegExp(['^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)',
                        '*\\w[\\w-]{0,66})\\.([a-z]{2,6}',
                        '(?:\\.[a-z]{2})?)$', ].join(''));
    return re.test(email.toLowerCase());
  }
  function validatePassword(e) {
    e.preventDefault();
    $('#password').removeAttr('data-original-title');
    var testPass = checkPwd();
    var testEmail = validateEmail($('#email').val());
    $('#password').parent().find('label.error').remove();
    $('#cpassword').parent().find('label.error').remove();
    $('#email').parent().find('label.error').remove();
    if (!testEmail) {
      $('#email').parent().
  append('<label class="error alert alert-danger">' +
      'A valid email is required. </label>');
      if (testPass === 'ok') {
        if ($('#password').val() === $('#cpassword').val()) {
        } else {
          $('#cpassword').parent().
     append('<label class="error alert alert-danger">' +
         'Password does not match' +
         '</label>');
        }
      } else {
        $('#password').parent().
     append('<label class="error alert alert-danger">' +
         'Password should contain at least 8 characters' +
         ' with at least one of each - lowercase, ' +
         'uppercase & numeric character.' +
         '</label>');
      }
    } else {
      (function() {
        if (testPass === 'ok') {
          if ($('#password').val() === $('#cpassword').val()) {
            document.getElementById('singupform').submit();
          } else {
            $('#cpassword').parent().
       append('<label class="error alert alert-danger">' +
           'Password does not match' +
           '</label>');
          }
        } else {
          $('#password').parent().
       append('<label class="error alert alert-danger">' +
           'Password should contain at least 8 characters' +
           ' with at least one of each - lowercase, ' +
           'uppercase & numeric character.' +
           '</label>');
        }
      })();
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
      return ('Password should contain at least 1 numeric character');
    } else if (str.search(/[a-z]/) === -1) {
      return ('Password should contain at least 1 lowercase letter');
    } else if (str.search(/[A-Z]/) === -1) {
      return ('Password should contain at least 1 uppercase letter');
    }
    return ('ok');
  };
  var checkboxCount = 0;
  $('input[type=checkbox]').click(function() {
    if ($(this).is(':checked')) {
      checkboxCount++;
    } else {
      checkboxCount--;
    }
    if (checkboxCount === 0) {
      $('.signup').attr('disabled', 'disabled');
    } else {
      $('.signup').prop('disabled', false);
    }
  });
});

$(function() {
  $('select[name="companySelect"]').change(function(e) {
    $('input[name="currentCompany"]').val($(e.target).val());
  });
});