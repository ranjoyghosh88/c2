
jQuery.extend(jQuery.validator.messages, {
  required: 'This field is required.',
  remote: 'Please fix this field.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  date: 'Please enter a valid date.',
  dateISO: 'Please enter a valid date (ISO).',
  number: 'Please enter a valid number.',
  digits: 'Please enter only digits.',
  creditcard: 'Please enter a valid credit card number.',
  equalTo: 'Please enter the same value again.',
  accept: 'Please enter a value with a valid extension.',
  maxlength: jQuery.validator.
 format('Please enter no more than {0} characters.'),
  minlength: jQuery.validator.
 format('Please enter at least {0} characters.'),
  rangelength:
  jQuery.validator.
   format('Please enter a value between {0} and {1} characters long.'),
  range: jQuery.validator.
 format('Please enter a value between {0} and {1}.'),
  max:
  jQuery.validator.
 format('Please enter a value less than or equal to {0}.'),
  min:
  jQuery.validator.
 format('Please enter a value greater than or equal to {0}.'),
});
$(document).ready(function() {
  var maxHeightTabs = -1;
  $('ul.nav.functional_profile li a,.rfp_company_details table tr td')
  .each(function() {
    maxHeightTabs = maxHeightTabs > $(this)
  .height() ? maxHeightTabs : $(this).height();
  });
  $('ul.nav.functional_profile li a,.rfp_company_details table tr td')
  .each(function() {
    $(this).height(maxHeightTabs);
  });
  $('#form input,#singupform input,.signupForm input').
    bind('keydown', function(e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 9) {
        $(this).parent().find('label.error').remove();
        $('p.error').hide();
      }
    });
  $('.xs-dropdown').on('click', function() {
    $(this).find('i').toggleClass('fa-chevron-up').
  toggleClass('fa-chevron-down');
  });
  $('.seemoreQtext').click(function(e) {
    e.preventDefault();
    if ($(this).parent('.quoted-text').attr('data-less') !== 'true') {
      $(this).parent('.quoted-text').removeClass('expand-collapse');
      $(this).parent('.quoted-text').attr('data-less', 'true');
      $(this).text('less');
    } else {
      $(this).parent('.quoted-text').addClass('expand-collapse');
      $(this).parent('.quoted-text').attr('data-less', 'false');
      $(this).text('more');
    }
  });
  $('.seemoreList').click(function(e) {
    e.preventDefault();
    if ($(this).parent().find('.hide').length === 0) {
      $(this).parent().find('.unhidden').
   removeClass('unhidden').
   addClass('hide').show();
      $(this).text('more');
    } else {
      $(this).parent().find('.hide')
   .removeClass('hide')
   .addClass('unhidden').show().removeAttr('style');
      $(this).text('less');
    }

  });
  $('.seemoreTags').click(function(e) {
    e.preventDefault();
    if ($(this).closest('.row').find('.expand-collapse').
  attr('data-less') !== 'true') {
      $(this).closest('.row').find('.expand-collapse').css({
        overflow: 'visible',
        'max-height': 'none',
      }).attr('data-less', 'true');
      $(this).text('less');
    } else {
      $(this).closest('.row').find('.expand-collapse').css({
        overflow: 'hidden',
        'max-height': '94px',
      }).attr('data-less', 'false');
      $(this).text('more');
    }
  });
  $('#addProductBtn').click(function() {
    $('#pstpro').submit();
  });
  $('#add-favourite,.add-favourite').click(function() {
    var setFav = !$(this).hasClass('fav');
    var $tat = $(this);
    var type = $tat.attr('data-fav');
    var uid = $tat.attr('data-id');
    if (uid.length) {
      if (type) {
        $.ajax({
          url: '/profile-fav/' + type + '/' + uid + '/' + setFav,
          dataType: 'json',
          success: function() {
            if (setFav) {
              $tat.addClass('fav');
              $('.add-favourite[data-id="' + uid + '"]').addClass('fav');
              $('span', $tat).text('Remove from Favorite');
              $tat.attr('title', 'Remove from Favorite');
              $('.add-favourite[data-id="' + uid + '"]')
       .find('label').addClass('glyphicon-star');
              $('.add-favourite[data-id="' + uid + '"]')
       .find('label').removeClass('glyphicon-star-empty');
              $('i', $tat).toggleClass('fa-minus fa-plus');
            } else {
              $tat.removeClass('fav');
              $('.add-favourite[data-id="' + uid + '"]').removeClass('fav');
              $('span', $tat).text('Add to Favorite');
              $tat.attr('title', 'Add to Favorite');
              $('.add-favourite[data-id="' + uid + '"]').find('label')
       .addClass('glyphicon-star-empty');
              $('.add-favourite[data-id="' + uid + '"]').find('label')
       .removeClass('glyphicon-star');
              $('i', $tat).toggleClass('fa-minus fa-plus');
            }
          },
          error: function(err) {
            if (err && ((err.status === 403) ||
      (err.responseText &&
      JSON.parse(err.responseText).code === 403))) {
              window.location.href = '/error/403';
            }
          },
        });
      }
    }
  });
  $('#add-connection,.add-connection').click(function(e) {
    e.preventDefault();
    var type = $('#profile-type').val();
    var connectTo = $(this).data('connectto');
    var $tat = $(this);
    var connectFrom = $tat.attr('data-connectFrom') || 'people';
    var connectFromId = $tat.attr('data-connectFromId') || '';
    var uid = $tat.attr('data-id');
    var con = $tat.attr('data-con') || '';
    if (uid && connectTo) {
      if (type) {
        $('#add-connection,.add-connection').closest('form')
    .attr('action', '/connectionInvitation/' +
     connectFrom + '/' + connectTo + '/' + 'null/' + uid + '?redirct=' +
      con + '&conFromId=' + connectFromId);
        $('#add-connection,.add-connection').closest('form').submit();
      }
    }
  });
  $('#remove-connection,.remove-connection').click(function(e) {
    e.preventDefault();
    $(this).closest('form').submit();
  });
});
var sortSelect = function(select) {
  $(select).html($(select).
    children('option').
        sort(function(x, y) {
          return $(x).text().
                        toUpperCase() < $(y).text().
                        toUpperCase() ? -1 : 1;
        }));
};
var sortSelectOnNumber = function(select) {
  $(select).html($(select).
    children('option').
        sort(function(x, y) {
          return $(x).val() < $(y).val() ? -1 : 1;
        }));
};
$(document).ready(function() {
  $('.searchText span.text').
 text($('.searchToggle a[data-value=' +
 $('#select-key').val() + ']').attr('data-text'));
  $('.searchToggle a').click(function(e) {
    e.preventDefault();
    var selectVal = $(this).attr('data-value');
    $('#select-key').
  val(selectVal);
    $('.searchText span.text').text($(this).attr('data-text'));
    $('[name="selectKey"]').val(selectVal);
    var placeholder = $('.searchText span.text').text();
    $('#select-key').next().attr('placeholder', placeholder);
    if (placeholder === 'All') {
      $('#select-key').next().attr('placeholder',
      'Product, people and company');
    }
    $('#search-form-right').attr('action', '/search/' + selectVal);
  });
  $('select').not('.notSelect2').not('.sortSelectOnNum').
  each(function(index, ele) {
    sortSelect(ele);
  });
  $('.sortSelectOnNum').not('.notSelect2').each(function(index, ele) {
    sortSelectOnNumber(ele);
  });
  $('select, .profileContainer select').
  not('.notSelect2').each(function(index, ele) {
    var attr = $(ele).attr('data-master');
    var select2Opts = {
      ajax: {
        url: '/masterSearch/' + attr,
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
    };
    if (typeof attr !== typeof undefined && attr !== false) {
      if ($(ele).attr('data-taggable')) {
        select2Opts.tags = true;
        $(ele).select2(select2Opts);
      } else {
        $(ele).select2(select2Opts);
      }
    } else {
      $(ele).select2({});
    }
  });
  $(function() { $('input, textarea').placeholder(); });
  $('#errorPage').closest('body').addClass('background-err').
 find('#footer').addClass('stickBottom');
  $('form').not('.custom-val').each(function(key, form) {
    var validobj = $(form).not('#novalidate').validate({
      onkeyup: false,
      errorClass: 'error',
      onfocusout: false,
      showErrors: function(errorMap, errorList) {
        for (var i = 0; errorList[i]; i++) {
          var element = this.errorList[i].element;
          // Solves the problem with brute force
          // Remove existing error label and thus force plugin to recreate it
          // Recreation == call to errorplacement function
          this.errorsFor(element).remove();
        }
        this.defaultShowErrors();
      },
      errorPlacement: function(error, element) {
        var elem = $(element);
        if (error.text() === 'This field is required.') {
          error.text(element.attr('data-errorholder') + ' is required');
        }
        error.addClass('alert').addClass('alert-danger');
        error.appendTo(element.parent());
      },
      highlight: function(element, errorClass, validClass) {
        var elem = $(element);
        if (elem.hasClass('select2-offscreen')) {
          $('#s2id_' + elem.attr('id') + ' ul').addClass(errorClass);
        } else {
          elem.addClass(errorClass);
        }
      },
      unhighlight: function(element, errorClass, validClass) {
        var elem = $(element);
        if (elem.hasClass('select2-offscreen')) {
          $('#s2id_' + elem.attr('id') + ' ul').removeClass(errorClass);
        } else {
          elem.removeClass(errorClass);
        }
      },
    });
  });
  $(document).on('change', '.select2-offscreen', function() {
    if (!$.isEmptyObject(validobj.submitted)) {
      validobj.form();
    }
  });
  $(document).on('select2-opening', function(arg) {
    var elem = $(arg.target);
    if ($('#s2id_' + elem.attr('id') + ' ul').hasClass('myErrorClass')) {
      $('.select2-drop ul').addClass('myErrorClass');
    } else {
      $('.select2-drop ul').removeClass('myErrorClass');
    }
  });
  $('#TrgrClk').click(function(e) {
    e.preventDefault();
    $('#file').trigger('click');
  });
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('.profilePic').attr('src', e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
  $('#file').change(function() {
    readURL(this);
  });
});
$(function() {
  var flg = 0;
  var $relationForm = $('#relation-form');
  var connect, connectedAs, connectionToType, connectionFromType,
      uid, conFromName;
  $('.removeDemo').on('click', function() {
    $(this).closest('form').submit();
  });
  var selectChangeHandler = function(e) {
    var selected = $(e.target).find(':selected');
    connect = selected.attr('data-connect');
    connectedAs = selected.attr('data-connectedas');
    connectionToType = selected.attr('data-connectiontotype');
    connectionFromType = selected.attr('data-connectionfromtype');
    uid = selected.attr('data-uid');
    _id = selected.attr('data-_id');
    conFromId = $('input[name=conFromId]').val();
    conFromName = $('input[name=conFromName]').val();
    var url = '/profile-con/' + connectionFromType + '/' + connectionToType +
  '/' + connect + '/' + connectedAs + '/' + uid + '/' + _id + '/true';
    if (conFromId) {
      url += '?conFromId=' + conFromId + '&conFromName=' + conFromName;
    }
    var updatedUrl = url.replace(/\/\/+/g, '/');
    $(this).closest('form').attr('action', url);
  };
  $('input[type=radio][name=connect]').change(function(e) {
    if ($(this).closest('.relation-data').find('select').length) {
      $('.relation-data').find('select')
   .off('change');
      $('.relation-data select,.relation-data div')
   .attr('disabled', 'disabled').addClass('hidden');
      $(this).closest('.relation-data').find('select')
   .removeAttr('disabled').removeClass('hidden');
      $(this).closest('.relation-data').find('div')
   .removeAttr('disabled').removeClass('hidden');
      var connect = $('.relation-data').find('select')
   .change(selectChangeHandler);
      $(this).closest('.relation-data').find('select').trigger('change');
    } else {
      $('.relation-data select,.relation-data div')
   .attr('disabled', 'disabled').addClass('hidden');
      $(this).closest('.relation-data').find('select')
   .removeAttr('disabled').removeClass('hidden');
      $(this).closest('.relation-data').find('div')
   .removeAttr('disabled').removeClass('hidden');
      var parent = $(this).closest('.relation-data');
      var updatedUrl = redioRelation(parent);
      $(this).closest('form').attr('action', updatedUrl);
    }
  });
  $('#setRelation').click(function(evt) {
    evt.preventDefault();
    var isConnectSet = false;
    var parent = $(this).closest('#relation-form');
    parent.find('.validateConnection').each(function(i, relation) {
      var connect = $(relation).find('input[data-input=connect]');
      if (connect.prop('checked') === true) {
        if (connect.hasClass('connectsingle')) {
          isConnectSet = true;
        } else {
          if ($(relation).find('select[name=connect]').val()) {
            isConnectSet = true;
          } else {
            isConnectSet = false;
            return false;
          }
        }
      }
    });
    if (isConnectSet) {
      parent.submit();
    } else {
      $('#comment').text('Please select connection!!').css('color', 'red');
    }
  });
  $('input[type=checkbox][class=connectsingle]').change(function(e) {
    $('#comment').text('');
    var parent = $(this).closest('.relation-data');
    var updatedUrl = redioRelation(parent);
    $(this).closest('form').attr('action', updatedUrl);
  });
  $('input[type=checkbox][name=connects]').change(function(e) {
    $('#comment').text('');
    if ($(this).closest('.relation-data_' + $(this).val().replace(/\s/g, ''))
        .find('select').length && $(this).is(':checked')) {
      $('.relation-data_' + $(this).val().replace(/\s/g, '')).find('select')
   .off('change', selectChangeHandler);
      $(this).closest('.relation-data_' + $(this).val().replace(/\s/g, ''))
         .find('select')
      .removeAttr('disabled').removeClass('hidden');
      $(this).closest('.relation-data_' + $(this).val().replace(/\s/g, ''))
         .find('div')
      .removeAttr('disabled').removeClass('hidden');
      var connect = $('.relation-data_' + $(this).val().replace(/\s/g, ''))
         .find('select')
      .change(selectChangeHandler);
      $(this).closest('.relation-data_' + $(this).val().replace(/\s/g, ''))
         .find('select').trigger('change');
    } else if ($(this).closest('.relation-data_' + $(this).val()
       .replace(/\s/g, '')).find('select').length &&
      !$(this).is(':checked')) {

      $(this).closest('.relation-data_' + $(this).val()
          .replace(/\s/g, '')).find('select').val([]);
      $('.relation-data_' + $(this).val().replace(/\s/g, '') +
              'select,' + '.relation-data_' + $(this).val()
                 .replace(/\s/g, '') + ' div')
            .attr('disabled', 'disabled').addClass('hidden');
      $(this).closest('.relation-data_' + $(this).val().replace(/\s/g, ''))
         .find('select')
      .removeAttr('disabled').removeClass('hidden');
      var parent = $(this)
         .closest('.relation-data_' + $(this).val().replace(/\s/g, ''));
      var updatedUrl = redioRelation(parent);
      $(this).closest('form').attr('action', updatedUrl);
    }
  });
  function redioRelation(parent) {
    setVariable(parent);
    var url = '/profile-con/' + connectionFromType + '/' + connectionToType +
  '/' + connect + '/' + connectedAs + '/' + uid + '/' + _id + '/true';
    if (flg === 0) {
      url += '?comp=' + $('#company').val();
    } else {
      url = '/profile-con/' + connectionFromType + '/' + connectionToType +
   '/' + connect + '/' + connectedAs + '/' + uid + '/' + _id + '/true';
    }
    if (conFromId) {
      url += '&conFromId=' + conFromId + '&conFromName=' + conFromName;
    }
    var updatedUrl = url.replace(/\/\/+/g, '/');
    return updatedUrl;
  }
  function setVariable(parent) {
    connect = parent.find('input[name=connect]').val();
    connectedAs = parent.find('input[name=connectedAs]').val();
    connectionToType = parent.find('input[name=connectionToType]').val();
    connectionFromType = parent.find('input[name=connectionFromType]').val();
    uid = parent.find('input[name=uid]').val();
    _id = parent.find('input[name=_id]').val();
    conFromId = parent.find('input[name=conFromId]').val();
    conFromName = parent.find('input[name=conFromName]').val();
  }
  $('input[type=checkbox][name=connect],input[type=checkbox][name=connects]')
   .trigger('change').prop('checked', false);
});
