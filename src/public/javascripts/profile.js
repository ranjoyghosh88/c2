$(document).ready(function() {
  $('form').each(function() {
    var $frm = $(this);
    var rules = {};
    var messages = {};
    $frm.find('*[data-jVal]').each(function() {
      var field = $(this);
      var val = field.attr('data-jVal');
      if (val && val.length) {
        var jValItem = JSON.parse(val);
        rules = $.extend(rules, jValItem.rule);
        messages = $.extend(messages, jValItem.message);
      }
    });
    $frm.validate({
      errorClass: 'error alert alert-danger',
      rules: rules,
      messages: messages,
      submitHandler: function(form) {
        form.submit();
      },
    });
  });
});
$(function() {
  $('.edit_plus').closest('ul').find('li')
  .on('click', function() {
    $(this).find('.edit_plus').show();
    $(this).siblings('li').find('.edit_plus').hide();
  });
  var data = {
    labels: ['Knowledge', 'Value (Cost)', 'Quality of Services',
      'Customer Focus', 'On time delivery',
      'Responsiveness', 'Professionalism', ],
    datasets: [
   {
     label: 'My Second dataset',
     fillColor: 'rgba(151,187,205,0.5)',
     strokeColor: 'rgba(151,187,205,0.8)',
     highlightFill: 'rgba(151,187,205,0.75)',
     highlightStroke: 'rgba(151,187,205,1)',
     data: [28, 48, 40, 19, 86, 27, 90],
   },
  ],
  };
  (function() {
    $('.addClients, .addProduct, .addPerson').css('display', 'none');
    var temp = document.getElementById('skillrating');
    if (temp) {
      var ctx = temp.getContext('2d');
      var myBarChart = new Chart(ctx).Bar(data, {});
    }
  })();
  var key = $('#profile-type').val();
  $('.followHim').on('click', function() {
    var parameter = {
      uId: $(this).attr('uid'),
      myuId: $(this).attr('myuid'),
      key: key,
      _id: $(this).attr('_id'),
    };
    $.ajax({
      url: '/api/' + key + '/follow/add',
      type: 'post',
      data: parameter,
    })
  .done(function(data) {
    $('.followHim').toggleClass('hidden');
    $('.unfollowHim').toggleClass('hidden');
  })
.fail(function(err) {
  if (err && ((err.status === 403) ||
(err.responseText && JSON.parse(err.responseText).code === 403))) {
    window.location.href = '/error/403';
  }
});
  });
  $('.unfollowHim').on('click', function() {
    var parameter = {
      uId: $(this).attr('uid'),
      myuId: $(this).attr('myuid'),
      key: key,
      _id: $(this).attr('_id'),
    };
    $.ajax({
      url: '/api/' + key + '/follow/remove',
      type: 'post',
      data: parameter,
    })
  .done(function(data) {
    $('.unfollowHim').toggleClass('hidden');
    $('.followHim').toggleClass('hidden');
  })
.fail(function(err) {
  if (err && ((err.status === 403) ||
(err.responseText && JSON.parse(err.responseText).code === 403))) {
    window.location.href = '/error/403';
  }
});
  });
  $('#companyname').bind('enterKey', function(e) {
    var companyName = $('#companyname').val();
    $.ajax({
      url: '/checkCompanyExist',
      type: 'post',
      dataType: 'json',
      data: {
        companyName: companyName,
      },
    })
    .done(function(data) {
      if (data) {
        var loc = data.companyLocations;
        var annualRevenue = data.annualRevenue;
        $('#companyname').parent().find('.error.alert').remove();
        $('#companyname').parent()
    .append('<label for="companyname" class="error alert custom ' +
    'alert-danger">Company already exist, please connect through ' +
    'company profile</label>');
        $('#annualRevenue').select2('val', data.annualRevenue);
        $('#annualRevenue').attr('disabled', 'disabled');
        $('#headCount').attr('disabled', 'disabled')
            .select2('val', data.headCount);
        $('#companyurl').val(data.companyWebsite).attr('disabled',
            'disabled');
        $('#location').val(loc).attr('disabled', 'disabled');
        $('#desc').val(data.description).attr('disabled', 'disabled');
        $('#addmoreCompany').attr('disabled', 'true');
        $('#addCompanyBtn').attr('disabled', 'true');
      }
    });
  })
.focusout(function(e) {
  $(this).trigger('enterKey');
}).focus(function() {
  $('#companyname').parent().find('.error.alert.custom').remove();
  $('#annualRevenue').removeAttr('disabled').select2('val', '');
  $('#headCount').removeAttr('disabled').select2('val', '');
  $('#companyurl').removeAttr('disabled').val('');
  $('#location').removeAttr('disabled').val('');
  $('#desc').removeAttr('disabled').val('');
  $('#addmoreCompany').removeAttr('disabled');
  $('#addCompanyBtn').removeAttr('disabled').val('');
});
  function onAddmoreSubmitHandler(e) {
    e.preventDefault();
    $.ajax({
      url: '/addPastCompany',
      type: 'post',
      dataType: 'json',
      data: {
        name: $('#companyname').val(),
        companyLocations: $('#location').val(),
        annualRevenue: $('#annualRevenue').val(),
        headCount: $('#headCount').val(),
        description: $('#desc').val(),
      },
    }).done(function() {
      $('#companyname').val('');
      $('#annualRevenue').select2('val', '');
      $('#headCount').select2('val', '');
      $('#location').val('');
      $('#desc').val('');
    })
.fail(function(err) {
  if (err && ((err.status === 403) ||
(err.responseText && JSON.parse(err.responseText).code === 403))) {
    window.location.href = '/error/403';
  }
});
  }
  function onSubmitHandler(e) {
    e.preventDefault();
    $.ajax({
      url: '/addPastCompany',
      type: 'post',
      dataType: 'json',
      data: {
        name: $('#companyname').val(),
        companyLocations: $('#location').val(),
        annualRevenue: $('#annualRevenue').val(),
        headCount: $('#headCount').val(),
        description: $('#desc').val(),
      },
    }).done(function() {
      window.location.href = '/profile';
    }).fail(function(err) {
      if (err && ((err.status === 403) ||
          (err.responseText && JSON.parse(err.responseText).code === 403))) {
        window.location.href = '/error/403';
      }
    });
  }
  $('#companyCancel').click(function() {
    $('#companyname').parent().find('.error.alert.custom').remove();
    $('#companyname').val('');
    $('#annualRevenue').removeAttr('disabled').select2('val', '');
    $('#headCount').removeAttr('disabled').select2('val', '');
    $('#companyurl').removeAttr('disabled').val('');
    $('#location').removeAttr('disabled').val('');
    $('#desc').removeAttr('disabled').val('');
    $('#addmoreCompany').removeAttr('disabled');
    $('#addCompanyBtn').removeAttr('disabled').val('');
  });
  function onEnter(e) {
    var productName = $('#productName').val();
    $.ajax({
      url: '/checkProductExist',
      type: 'post',
      dataType: 'json',
      data: {
        productName: productName,
      },
    })
    .done(function(data) {
      if (data) {
        $('#productName').parent().find('.error.alert').remove();
        $('#productName').parent()
        .append('<label for="productname" class=" error alert custom ' +
        'alert-danger">Product already exist, please connect through ' +
          'product profile</label>');
        $('#latestVersion').val(data.versionNumber).attr('disabled', 'true');
        $('#users').val(data.userCount).attr('disabled', 'disabled');
        $('#aboutProduct').val(data.description).attr('disabled', 'disabled');
        $('#addProductBtn').attr('disabled', 'true');
        $('#addmoreProduct').attr('disabled', 'true');
      } else {
        $('#pstpro').submit();
      }
    }).fail(function(err) {
      if (err && ((err.status === 403) ||
            (err.responseText && JSON.parse(err.responseText).code === 403))) {
        window.location.href = '/error/403';
      }
    });
  }
  $('#productName').keypress(function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code === 13) {
      e.preventDefault();
      e.stopPropagation();
      onEnter(e);
    }
  });
  $('#productName').focusout(function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code === 13) {
      e.preventDefault();
      e.stopPropagation();
      onEnter(e);
    }
  });
  $('#productName').bind('enterKey', onEnter)
.focusout(function(e) {
  $(this).trigger('enterKey');
})
.focus(function() {
  $('#productName').parent().find('.error.alert.custom').remove();
  $('#latestVersion').removeAttr('disabled').val('');
  $('#users').removeAttr('disabled').val('');
  $('#aboutProduct').removeAttr('disabled').val('');
  $('#addProductBtn').removeAttr('disabled');
  $('#addmoreProduct').removeAttr('disabled');
});
  $('#productCancel').click(function() {
    $('#productName').parent().find('.error.alert.custom').remove();
    $('#productName').val('');
    $('#latestVersion').removeAttr('disabled').val('');
    $('#users').removeAttr('disabled').val('');
    $('#aboutProduct').removeAttr('disabled').val('');
    $('#addProductBtn').removeAttr('disabled');
    $('#addmoreProduct').removeAttr('disabled');
  });

});
var tab = null;
$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
  var target = $(e.target).attr('href');
  tabswitch(target);
  $('.addProduct').hide();
  $('.addClients').hide();
  $('.addPerson').hide();
  $('#add').remove();
  $('.noClients').show();
});
function tabswitch(target) {
  switch (target) {
    case '#productsUsed': {
      tab = 'productsUsed';
      break;
    }
    case '#service': {
      tab = 'servicePartner';
      break;
    }
    case '#servicePartners': {
      tab = 'servicePartner';
      break;
    }
    case '#technologyPartners': {
      tab = 'technologyPartner';
      break;
    }
    case '#colleagues': {
      tab = 'colleague';
      break;
    }
    case '#clients': {
      tab = 'pastClient';
      break;
    }
    case '#expertise': {
      tab = 'expertise';
      break;
    }
  }
}
$('.plus2').on('click', function() {
  // Alert(this.parent);
  $('.addProduct').slideToggle('slow');
  $('.addProduct').closest('.panel-body').
   find('.noClients').toggle();
  $('.addTo').each(function(index, ele) {
    $(ele).select2('destroy');
    var resultArray = [];
    var attr = $('.addProduct').find('.addTo').attr('data-master');
    if (typeof attr !== typeof undefined && attr !== false) {
      $(ele).select2({
        ajax: {
          url: '/masterSearchAddTo/' + attr,
          dataType: 'json',
          data: function(params) {
            return {
              q: params.term,
            };
          },
          delay: 250,
          processResults: function(data, page) {
            var isNew = false;
            var link =
       $('<a id="add" style="display: block;float: right;' +
      ' margin-top: 0;"> Sorry ' + data.item +
      ' does not exist. If you want to add this as a new' +
      ' product please click here. </a>');
            if (data.length) {
              page.term = page.term.trim();
              isNew = data.map(function(e) { return e.name.toLowerCase(); })
                     .indexOf(page.term.toLowerCase()) === -1;
              link =
       $('<a id="add" style="display: block;float: right;' +
       ' margin-top: 0;"> Sorry ' + page.term +
       ' does not exist. If you want to add this as a' +
       ' new product please click here.  </a>');
              $('.add-company').next('.addTo').find('option')
       .text(page.term);
              $('#productName').val(page.term);
            }
            if (data.isNew || isNew) {
              (function() {
                $('#conForm').remove();
                $('#sCon,#add').remove();
                $('#pstpro').hide();
                $('.comment').hide();
                if ($(window).width() < 768) {
                  link = $('<a id="add" style="display: block;float: right;' +
           ' margin-top: 50px;"> Sorry ' + data.item +
           ' does not exist. If you want to add this as a' +
           ' new product please click here. </a>');
                }
                $('#pstpro').before(link);
                $('a:contains("You are not owner of")').css('display', 'none');
                link.click(function() {
                  $('#pstpro').show();
                });
                if (!isNew) {
                  $('.add-company').next('.addTo').find('option')
           .text(data.item);
                  $('#productName').val(data.item);
                }
                $('#addCon').hide();
              })();
            } else {
              $('#pstpro, #add').hide();
            }
            $('.add-company').next('.addTo').find('option').remove();
            if (data.length) {
              resultArray = data.map(function(elm) {
                return { id: elm._id, text: elm.name };
              });
            }
            return {
              results: resultArray,
            };
          },
          cache: true,
        },
        escapeMarkup: function(markup) { return markup; },
        minimumInputLength: 1,
      });
    } else {
      $(ele).select2({});
    }
    if ($(window).width() >= 767) {
      $('.addTo').next('span').css('width', '48%');
      $('.addTo').next('.select2').css('width', '48%');
    } else {
      $('.addTo').next('span').css('width', '100%');
    }
  });
});
$('.plus3').on('click', function() {
  $('.addClients').slideToggle('slow');
  $('.addClients').closest('.panel-body').
   find('.noClients').toggle();
  var tab = $(this).prev().attr('href');
  console.log(tab);
  $('.addTo').each(function(index, ele) {
    $(ele).select2('destroy');
    var attr = $('.addClients').find('.addTo').attr('data-master');
    if (typeof attr !== typeof undefined && attr !== false) {
      $(ele).select2({
        ajax: {
          url: '/masterSearchAddTo/' + attr,
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
            var isNew = false;
            console.log(data.item, data);
            var link =
       $('<a id="add" style="display: block;float: right;' +
      ' margin-top: 0;"> Sorry ' + data.item +
      ' does not exist. If you want to add this as a new' +
      ' company please click here. </a>');
            if (data.length) {
              page.term = page.term.trim();
              isNew = data.map(function(e) { return e.name.toLowerCase(); })
                     .indexOf(page.term.toLowerCase()) === -1;
              link =
       $('<a id="add" style="display: block;float: right;' +
       ' margin-top: 0;"> Sorry ' + page.term +
       ' does not exist. If you want to add this as a new' +
       ' company please click here. </a>');
              $(ele).find('option').text(page.term);
              $(tab).find('#companyname').val(page.term);
            }
            if (data.isNew || isNew) {
              (function() {
                $('#conForm').remove();
                $('#sCon,#add').remove();
                $('#pstcomform').hide();
                $('.comment').hide();
                if ($(window).width() < 768) {
                  link = $('<a id="add" style="display: block;float: right;' +
           ' margin-top: 50px;"> Sorry ' + data.item +
           ' does not exist. If you want to add this as a new' +
           ' company please click here. </a>');
                }
                $(tab).find('#pstcomform').before(link);
                link.click(function() {
                  $(tab).find('#pstcomform').show();
                });
                if (!isNew) {
                  $(ele).find('option').text(data.item);
                  $(tab).find('#companyname').val(data.item);
                }
                $('#addCon').hide();
              })();
            } else {
              $('#pstcomform, #add').hide();
            }
            $('.add-company').next('.addTo').find('option').remove();
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
        minimumInputLength: 1,
      });
      if ($(window).width() >= 767) {
        $('.addTo').next('span').css('width', '48%');
      } else {
        $('.addTo').next('span').css('width', '100%');
      }
    } else {
      $(ele).select2({});
    }
  });
});

$('.plus4').on('click', function() {
  $('.addPerson').slideToggle('slow');
  $('.addPerson').closest('.panel-body').
 find('.noClients').toggle();
  $('.addTo').each(function(index, ele) {
    $(ele).select2('destroy');
    var attr = $('.addPerson').find('.addTo').attr('data-master');
    if (typeof attr !== typeof undefined && attr !== false) {
      $(ele).select2({
        ajax: {
          url: '/masterSearchAddTo/' + attr,
          dataType: 'json',
          data: function(params) {
            return {
              q: params.term,
            };
          },
          delay: 250,
          processResults: function(data, page) {
            var link =
       $('<a id="add" style="display: block;float: right;' +
      ' margin-top: 0;"> Sorry ' + data.item +
      ' does not exist. If you want to add this as a new' +
      ' company please click here. </a>');
            $('.comment').hide();
            if (data.isNew) {
              $('#conForm').remove();
              $('#sCon,#add').remove();
              $('#pstcomform').hide();
              $('.comment').hide();
              if ($(window).width() < 768) {
                link = $('<a id="add" style="display: block;float: right;' +
        ' margin-top: 50px;"> Sorry ' + data.item +
        ' does not exist. If you want to add this as a new' +
        ' company please click here. </a>');
              }
              $('#pstcomform').before(link);
            } else {
              $('#add').hide();
              $('.add-company').next('.addTo').find('option').remove();
              var resultArray = data.map(function(elm) {
                return {
                  id: elm._id, text: elm.name + ' ' + elm.lastName +
         ' [' + elm.location + ']',
                };
              });
              return {
                results: resultArray,
              };
            }
          },
          cache: true,
        },
        escapeMarkup: function(markup) { return markup; },
        minimumInputLength: 1,
      });
      if ($(window).width() >= 767) {
        $('.addTo').next('span').css('width', '48%');
      } else {
        $('.addTo').next('span').css('width', '100%');
      }
    } else {
      $(ele).select2({});
    }
  });
});

$('.plus5').on('click', function() {
  $('.addDemo').slideToggle('slow');
  $('.addDemo').closest('.panel-body').
 find('.noClients').toggle();
});

// =-------------------------------------------
(function() {
  $('.comment').hide();
  $('.add-company').next('.addTo').change(function() {
    $('#addCon,#conForm,#sCon').remove(); $('.comment').hide();
    var id = $('.add-company').next('.addTo').find('option').attr('value');
    var elm = $(this).parent();
    var connectFrom;
    if ($('#connectFrom').val() !== 'null') {
      connectFrom = $('#connectFrom').val();
    } else {
      connectFrom = 'people';
    }
    var connectTo = getConnectTo(elm).connectTo;
    var queryId = getConnectTo(elm).queryId;
    var returnUrl = $('#returnUrl').val() || null;
    var con = $('<form id="conForm"' + ' action="" method="post"' +
           'class="panel" novalidate="novalidate"><a data-connectto="' +
            connectTo + '" ' +
           'data-con="1" title="Add to connection" data-id="' + id +
           '" class="text-uppercase block add-connection"></a><input ' +
    'type = "hidden" name = "returnUrl" value="' + returnUrl + '"/></form>');
    $.getJSON('/connection-check?' + queryId + '=' + id +
          '&type=' + connectTo + '&connectFrom=' + connectFrom +
     '&connectFromId=' + $('#companyId').val() + '&isNew=' +
     $('#isNew').val(), function(obj) {
       var $comm = $('.comment', elm); $comm.hide();
       if ($('#isNew').val() === 'true' && connectTo === 'product') {
         if (forProductConnection($comm, obj) === false) {
           return false;
         }
       }
       if (obj.conStatus) {
         $comm.show(); $comm.text('Pending Connection');
         return false;
       } else if (obj.mydata) {
         $comm.show(); $comm.text('Already Connected!!');
         return false;
       }
       $(function() {
         con.find('a').click(function(e) {
           e.preventDefault();
           var connectTo = $(this).data('connectto');
           var $tat = $(this); var uid = $tat.attr('data-id');
           var con = $tat.attr('data-con') || '';
           var conFormId = $('#companyId').val() || null;
           var conFromName = $('#conFromName').val() || null;
           if (uid && connectTo) {
             $('#conForm').attr('action', '/connectionInvitation/' +
                 connectFrom + '/' + connectTo + '/' + tab + '/' +
                 uid + '?redirct=' + con + '&conFromId=' + conFormId +
                 '&conFromName=' + conFromName);
             $('#conForm').submit();
           }
         });
         if ($(elm).attr('class') === 'addProduct') {
           $('#pstpro').before(con);
           con.find('a').trigger('click');
         } else if ($(elm).attr('class') === 'addClients') {
           $('#pstcomform').before(con);
           con.find('a').trigger('click');
         } else if ($(elm).attr('class') === 'addPerson') {
           $('#personProfile').before(con);
           con.find('a').trigger('click');
         }
       });
     });
  });
})();

function forProductConnection($comm, obj) {
  var conFormId = $('#companyId').val() || null;
  var contToId = $('.add-company').next('.addTo').find('option').attr('value');
  if (!obj.isAdmin && typeof obj.isAdmin !== 'undefined') {
    var url = '/product/' + obj.uid;
    $('#add').replaceWith('<a href="' + url +
         '"" style="margin-left: 4%;font-size: small;">You are not owner of ' +
                   obj.name + ' Please Claim to connect !!</a>');
    return false;
  } else if (obj.status === 'pending') {
    $comm.show(); $comm.text('Your Claim request is pending!!');
    return false;
  } else if (obj.isAdmin === true) {
    $.ajax({
      url: '/product/updateCompanyProduct/' + conFormId + '/' +
      contToId + '/$addToSet',
      type: 'post',
      dataType: 'json',
      data: {
        name: $('#productName').val(),
        versionNumber: $('#latestVersion').val(),
        userCount: $('#users').val(),
      },
    });
    window.location.reload(); return false;
  }
  return true;
}

function getConnectTo(elm) {
  if ($(elm).attr('class') === 'addProduct') {
    return { connectTo: 'product', queryId: 'prodId' };
  } else if ($(elm).attr('class') === 'addClients') {
    return { connectTo: 'company', queryId: 'compId' };
  } else if ($(elm).attr('class') === 'addPerson') {
    return { connectTo: 'people', queryId: 'peopleId' };
  }
}

function onProductSubmitHandler(e) {
  $.ajax({
    url: '/addProduct',
    type: 'post',
    dataType: 'json',
    data: {
      name: $('#productName').val(),
      versionNumber: $('#latestVersion').val(),
      userCount: $('#users').val(),
    },
  }).done(function(_data) {
    window.location.href = '/profile';
  }).fail(function(err) {
    if (err && ((err.status === 403) ||
       (err.responseText && JSON.parse(err.responseText).code === 403))) {
      window.location.href = '/error/403';
    }
  });
}
function onAddmoreProductSubmitHandler(e) {
  $.ajax({
    url: '/addProduct',
    type: 'post',
    dataType: 'json',
    data: {
      name: $('#productName').val(),
      versionNumber: $('#latestVersion').val(),
      userCount: $('#users').val(),
    },
  }).done(function(_data) {
    $('#productName').val('');
    $('#latestVersion').val('');
    $('#users').val('');
    $('#aboutProduct').val('');
  }).fail(function(err) {
    if (err && ((err.status === 403) ||
       (err.responseText && JSON.parse(err.responseText).code === 403))) {
      window.location.href = '/error/403';
    }
  });
}
$(function() {
  $('.remove').hide();
  function validateEmail(email) {
    var re =
   new RegExp(['^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)',
                        '*\\w[\\w-]{0,66})\\.([a-z]{2,6}',
                        '(?:\\.[a-z]{2})?)$', ].join(''));
    return re.test(email);
  }
  $('.btnAdd').on('click', function() {
    var div = $('<div />');
    div.html(createInviteUi(''));
    if ($('.createInvite .row').length >= 10) {
      var errorMsg = 'You cannot add more than 10 invites';
      $('#inviteUI .showError').text(errorMsg).show();
    } else {
      $('.createInvite').append(div);
      if ($('.createInvite .row').length === 1) {
        $('.remove').hide();
      } else {
        $('.remove').show();
      }
      $('.addValid').bind('change', function() {
        $(this).parent().removeClass('has-error');
        $('#inviteUI .showError').hide();
      });
      $('.addValid').
  bind('keydown', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 9) {
      $(this).parent().removeClass('has-error');
      $('#inviteUI .showError').hide();
    }
  });
    }
  });
  $('#btnGet').bind('click', function() {
    $('.nameValid,.emailValid').parent().removeClass('has-error');
    var allowSubmit = true;
    $.each($('.addValid'), function(index, formField) {
      if ($(formField).hasClass('nameValid')) {
        if ($(formField).val().trim().length === 0) {
          $(formField).parent().addClass('has-error');
          allowSubmit = false;
        }
      } else if ($(formField).hasClass('emailValid')) {
        var testEmail = validateEmail($(formField).val());
        if ($(formField).val().trim().length === 0 || !testEmail) {
          $(formField).parent().addClass('has-error');
          allowSubmit = false;
        }
      }
    });
    return allowSubmit;
  });
  $('body').on('click', '.remove', function() {
    $('#inviteUI .showError').hide();
    $(this).parent().parent().remove();
    if ($('.createInvite .row').length === 1) {
      $('.remove').hide();
    } else {
      $('.remove').show();
    }
    $('#inviteUI .showError').hide();
    $(this).parent().parent().remove();
  });
});
function createInviteUi(value) {
  return '<div class="row filterMargin" style="padding-bottom:10px">' +
     '<div class="col-sm-3 col-xs-12">' +
     '<input type="text" name="firstName" ' +
     'class="addValid form-control nameValid" placeholder="First Name">' +
     '<span class="absolute asterisk">*</span></div>' +
     '<div class="col-sm-3 col-xs-12">' +
     '<input type="text" name="lastName" ' +
     ' placeholder="Last Name" class="form-control">' +
     '</div>' +
     '<div class="col-sm-5 col-xs-12">' +
     '<input type="text" name="emailAddress" ' +
     'placeholder="Email" class="addValid emailValid form-control">' +
     '<span class="absolute asterisk">*</span></div>' +
     '<div class="col-sm-1 text-center">' +
     '<span style="cursor:pointer" ' +
     'class="glyphicon glyphicon-trash remove"' +
     'title="Delete" ></span></div>';
}
function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' :
   decodeURIComponent(results[1].replace(/\+/g, ' '));
}
$(function() {
  var tab = getParameterByName('tab');
  var addMore = getParameterByName('addmore');
  if (tab) {
    $('a[href=#' + tab + ']').trigger('click');
  }
  if (addMore) {
    $('a[href=#' + tab + ']').next('img').trigger('click');
  }
});

$(function() {
  $('#claim').on('click', function() {
    if ($('#claim').length !== 0) {
      var parameter = {
        claimType: $(this).attr('claimType'), status: $(this).attr('status'),
        claimId: $(this).attr('claimID'),
      };
      $.ajax({
        url: '/claim',
        type: 'post',
        data: parameter,
      })
  .done(function(data) {
    if (data === 'gotoPremium') {
      window.location.href = '/upgrade';
      return;
    }
    $('#claim').text('CLAIM PENDING').
addClass('disabled').attr('id', 'disablebtn');
  })
  .fail(function(err, status) {
    if (err.status === 401) {
      if (err.responseJSON && err.responseJSON.redirect) {
        window.location.href = err.responseJSON.redirect;
        return;
      }
    }
    window.location.href = '/claimErr/' + err.statusText +
'/' + parameter.claimType;
  });
    }
  });
});