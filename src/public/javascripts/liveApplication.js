var showChar = 135;
var ellipsestext = '...';
var moretext = 'more';
var lesstext = 'less';
var newProduct;
function WebStoreDetect(iconUrl) {
  if (window.chrome) {
    var img = new Image();
    img.src = 'chrome-extension://' + iconUrl;
    img.onload = function() {
      $('.notqsextension').removeClass('hide');
    };
    img.onerror = function() {
      $('.QSextension').removeClass('hide');
    };
  } else {
    alert('Quick support feature only supported on chrome browser.');
  }
}
if ($('.QSextension').length !== 0) {
  new WebStoreDetect('lbhinppfgjemckangjaiofhpoajjbfim/icon.png');
}
$('.QSextension').click(function(e) {
  chrome.webstore.install('https://chrome.google.com/webstore/detail/' +
   chromeID,
  function() {
    window.location.assign('/quickSupport/videocall/' +
       $(e.target).attr('lockQuestionId') +
       '/' + $(e.target).attr('responderHistoryId') +
       '/' + $(e.target).attr('createdBy'));
  },
  function(detail) {
  });
});
function moreLessData() {
  $('.more').each(function() {
      var content = $(this).html();
      if (!$(this).hasClass('moreConnnected')) {
        if (content.length > showChar) {
          $(this).addClass('moreConnnected');
          var c = content.substr(0, showChar);
          var h = content.substr(showChar - 1, content.length - showChar);
          var html = c + '<span class="moreellipses">' +
         ellipsestext + '&nbsp;</span><span class="morecontent">' +
         '<span style="display:none">' + h +
          '</span>&nbsp;&nbsp;<a href="" class="morelink">' +
           moretext + '</a></span>';
          $(this).html(html);
        }
      }
    });
  $('.morelink').click(function() {
      if ($(this).hasClass('less')) {
        $(this).removeClass('less');
        $(this).html(moretext);
      } else {
        $(this).addClass('less');
        $(this).html(lesstext);
      }
      $(this).parent().prev().toggle();
      $(this).prev().toggle();
      return false;
    });
}
if ($.fn.DataTable) {
  $.fn.DataTable.defaults = $.extend($.fn.DataTable.defaults, {
    drawCallback: function(tab) {
      if (!$('.more').hasClass('moreConnnected')) {
        moreLessData();
      }
      if ($('.dataTables_empty').length !== 0) {
        $('.dataTables_paginate').hide();
      }
      $('.pagination', tab.nTableWrapper).wrap('<nav class="row pull-right">');
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
      'Company, people and product');
    }
    $('#search-form-right').attr('action', '/search/' + selectVal);
  });
});
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();
  if ($('#allQues').parent().hasClass('active')) {
    if (location.search !== '') {
      var questionFilters = getQueryStringParams();
      if (questionFilters.andorFlag === 'and') {
        $('#and').prop('checked', true).change();
        $('#and').parent('label').addClass('active');
        $('#or').parent('label').removeClass('active');
      }else if (questionFilters.andorFlag === 'or') {
        $('#or').prop('checked', true).change();
        $('#or').parent('label').addClass('active');
        $('#and').parent('label').removeClass('active');
      }
    }
  }
  disableMySkills();
  $('.MySkills').on('click', disableMySkills);
});

function disableMySkills() {
  if ($('.MySkills').is(':checked')) {
    $('#productSelection,#tagtSelection,#businessProcessArea')
    .prop('disabled', true);
  }
}
function removetrueTags() {
  var businessProcessArea = $('#businessProcessArea');
  businessProcessArea.find('[value="true"]').remove();
  var tagSelection = $('#questionTag');
  tagSelection.find('[value="true"]').remove();
  var productSelection = $('#productSelection');
  productSelection.find('[value="true"]').remove();
}
$(document).ready(function() {
  $('#payment-form label.error').hide();
  $('#edit-question-form label.error').hide();
  $('.lasDate').each(function() {
      var getDate = $(this).text();
      var newDate = moment(getDate).format('MMM DD YYYY, hh:mmA');
      $(this).text(newDate);
    });
  triggerSelect();

  $('#payment-form label.error').hide();

  $('#showReview').click(function(event) {
    $('#payment-form label.error').hide();
    var check1 = checkSum();
    var check2 = checksumData();
    var check3 = checkValueData();
    var check4 = checkValidSumData();
    var check5 = toDataValid();
    var check6 = checkValidEmail();
    var valid = false;
    removetrueTags();
    if (check1 && check2 && check3 && check4 && check5 && check6) {
      $('.headpanel h3 label').text('Review your order');
      valid = true;
    }
    return validationData(valid);
  });


  $('#editQuestion').click(function(event) {
    removetrueTags();
    $('#edit-question-form label.error').hide();
    var check1 = checkSum();
    var check2 = checksumData();
    var check3 = checkValidEmail();
    var valid = false;
    if (check1 && check2 && check3) {
      valid = true;
    }
    return valid;
  });

  function validationData(data) {
    if (data) {
      $('.requesterName').text($('.getName').val());
      $('.phoneNum').text($('#phoneNum').val());
      $('.requesterEmail').text($('#emailForResponse').val());
      $('.requesterQuestion').text($('#questionText').val());
      $('.requesterCardName').text($('.holderName').val());
      var cardNum = $('#card-num').val().slice(-4);
      $('.requesterCardNumber').text('xxxx-xxxx-xxxx-' + cardNum);
      $('.requesterCardExpDate').text($('#card-exp').val());
      $('.requesterCvc').text($('#card-cvc').val());
      valueChanged();
      selectValue();
      $('#quickQuestionPost').hide();
      $('#las_review').show();
      moreLessData();
    }
  }

  function selectValue() {
    var mode = $('#communicationMode').select2('data')[0].text;
    var bpaData = [];
    var bpaProcess = $('#businessProcessArea').select2('data');
    $.each(bpaProcess, function(index, value) {
      bpaData.push(value.text);
    });
    var getPbpa = bpaData.toString().replace(/,/g, ', ');
    $('.requesterFunction').text(getPbpa);
    var industry = $('#industry').select2('data')[0].text;
    $('.requesterMode').text(mode);
    $('.requesterIndustry').text(industry);
    var productData = [];
    var dataProduct = $('#productSelection').select2('data');
    $.each(dataProduct, function(index, value) {
      productData.push(value.text);
    });
    var getProduct = productData.toString().replace(/,/g, ', ');
    $('.requesterProduct').text(getProduct);
    setReviewTag();
  }
  function setReviewTag() {
    $('#reviewTag').show();
    var dataTags = $('#questionTag').select2('data');
    if (dataTags.length > 0) {
      var tagData = [];
      $.each(dataTags, function(index, value) {
        tagData.push(value.text);});
      var getTag = tagData.toString().replace(/,/g, ', ');
      $('.requesterTags').text(getTag);
    }else {
      $('#reviewTag').hide();
    }
  }
  $('.backPostScreen').click(function(event) {
    $('#las_review').hide();
    $('#quickQuestionPost').show();
    $('.termsView').hide();
    $('.headpanel h3 label').text('POST A QUESTION');
  });

  var $btn = $('.submitLas');
  $btn.on('click', function() {
    if ($('.checkTeams').is(':checked')) {
      $btn.prop('disabled', true);
      $('.termsView').addClass('hide');

      /*      Var cardNum = $('#card-num').val();
            var cardExp = $('#card-exp').val();
            var cardCVC = $('#card-cvc').val();*/

      var cardNum = '4242424242424242';
      var cardExp = '07/22';
      var cardCVC = '070';

      // First submit the card information to Stripe to get back a token
      Stripe.card.createToken({
      number: cardNum,
      exp: cardExp,
      cvc: cardCVC,
      name: $('.holderName').val(),
    }, function(status, response) {
      if (response.error) {
        $('#stripePopup .setHeaderMessage').text('Error');
        $('#stripePopup .messageGeneric').text(response.error.message);
        $('#stripePopup').modal();
        $btn.prop('disabled', false);
      } else {
        var $form = $('#payment-form');
        var token = response.id;
        var stripeInput = $('<input type="hidden" name="stripeToken" />');
        $form.append(stripeInput.val(token));
        $form.get(0).submit();
        // $btn.addClass('btn-success').removeClass('btn-primary');
        // $btn.button('success');
      }

    });

    return false;}else {
      $('.termsView').removeClass('hide');
      return false;
    }
  });
});
function valueChanged() {
  if ($('.feedback_checkbox').is(':checked')) {
    $('.feedback').show();
    $('.requesterInvoiceEmail').text($('.emailForInvoice').val());
  }else {
    $('.feedback').hide();
    $('.emailForInvoice').next().hide();
    $('.requesterInvoiceEmail').text($('#emailForResponse').val());
  }
}
function isNumber(evt) {
  evt = (evt) ? evt : window.event;
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}

$('#idShowNum').click(function(event) {
  /* Act on the event */
  if ($('#idShowNum').is(':checked')) {
    $('#card-num').attr('type', 'text');
    // $('#hideNum').text('Hide Card Number');
  }else {
    $('#card-num').attr('type', 'password');
    // $('#hideNum').text('Show Card Number');
  }

});

var checkSum = function() {
    var valid = true;
    /* If ($('#industry').val() === '') {
    if ($('#industry').val() === '') {
    $('#industry').next().next().show();valid = false;}*/
    if ($('#businessProcessArea').val() === null) {
    $('#businessProcessArea').next().next().show();valid = false;}
    if ($('#communicationMode').val() === '') {
    $('#communicationMode').next().next().show();valid = false;}
    return valid;
  };

var checkValueData = function() {
    var valid = true;
    var year = $('#card-exp').val().trim().slice(-2);
    var month = $('#card-exp').val().trim().slice(0, -3);
    if ($('#card-exp').val().trim() === '') {
    $('#card-exp').next().show();valid = false;}
    if ($('#card-cvc').val().trim() === '') {
    $('#card-cvc').next().show();valid = false;}
    if (Stripe.card.validateExpiry(month, year)) {
    }else {$('#card-exp').next().show();valid = false;}
    return valid;
  };
var checksumData = function() {
    var valid = true;
    if ($('#phoneNum').val().trim() === '') {
    $('#phoneNum').next().show();valid = false;}
    if ($('#phoneNum').val().length !== 12) {
    $('#phoneNum').next().show();valid = false;}
    if ($('#productSelection').val() === null) {
    $('#productSelection').next().next().show();valid = false;}
    if ($('#questionText').val().trim() === '') {
    $('#questionText').next().show();valid = false;}
    return valid;
  };
var checkValidSumData = function() {
    var valid = true;
    var emailRegex = /^[A-Za-z0-9._]*\@[A-Za-z]*\.[A-Za-z]{2,5}$/;
    var validEmail = !emailRegex.test($('.emailForInvoice').val());
    var checkMark = $('.feedback_checkbox').is(':checked');
    var checkCVC = Stripe.card.validateCVC($('#card-cvc').val().trim());
    if ($('.feedback_checkbox').is(':checked') === true &&
     $('.emailForInvoice').val().trim() === '') {
      $('.emailForInvoice').next().text('Please enter email').show();
      valid = false;
    } else if (checkMark === true && validEmail) {
      $('.emailForInvoice').next().text('Please enter valid email').show();
      valid = false;
    }if (checkCVC) {} else {$('#card-cvc').next().show();valid = false;}
    return valid;
  };
var checkValidEmail = function() {
    var valid = true;
    var emailRegex = /^[A-Za-z0-9._]*\@[A-Za-z]*\.[A-Za-z]{2,5}$/;
    var validEmail = !emailRegex.test($('#emailForResponse').val());
    if ($('#emailForResponse').val().trim() === '') {
      $('#emailForResponse').next().text('Please enter email').show();
      valid = false;
    } else if (validEmail) {
      $('#emailForResponse').next().text('Please enter valid email').show();
      valid = false;
    }
    return valid;
  };
var toDataValid = function() {
    var valid = true;
    if ($('[placeholder="Name on card"]').val().trim() === '') {
    $('[placeholder="Name on card"]').next().show();valid = false;}
    if ($('#card-num').val().trim() === '') {
      $('#card-num').next()
    .text('Please enter credit card number').show();valid = false;} else
    if ($('#card-num').val().trim().length < 16) {
      $('#card-num').next()
    .text('Please enter valid credit card number').show();valid = false;}
    if ($('#card-num').val().trim() === '') {
      $('#card-num').next()
    .text('Please enter credit card number').show();valid = false;} else
       if ($('#card-num').val().trim().length < 16) {
         $('#card-num').next()
       .text('Please enter valid credit card number').show();valid = false;}
    return valid;
  };

$('.checkFeedback').click(function(event) {
  /* Act on the event */
  $('.feedbackDataCheck').addClass('hide');
  if ($(this).val() === 'true') {
    $('.feedBackComment').addClass('hide');
  }else {
    $('.feedBackComment').removeClass('hide');
  }
  $('.checkdayComment').removeClass('hide');
});

$(document).ready(function() {
  if ($('#allwaiting').parent().hasClass('active')) {
    moreLessData();
  }
  if ($('#subscribers').length !== 0) {
    moreLessData();
  }
  if ($('.callSummaryFeedback').length !== 0) {
    moreLessData();
  }

  $('input,textarea').
    bind('keydown', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 9) {
      $(this).parent().find('.error').css('display', 'none');
    }else {
      $(this).parent().find('.error').css('display', 'none');
    }
  });
  $('select').change(function(event) {
    $(this).parent().find('.error').css('display', 'none');
  });
});
$(document).ready(function() {
  if ($('#allQues').length !== 0) {
    if ($('#allQues').parent().hasClass('active')) {
      var queryString = getQueryStringParamsQuestion();
      var product = queryString.product;
      if (product !== undefined && !(product instanceof Array)) {
        product = [product];
      }
      if (product !== undefined) {
        var getParams = {
          products: product,
        };
        $.ajax({
          url: '/quickSupport/getAllProducts',
          type: 'POST',
          data: getParams,
        })
        .done(function(data) {
          var productSelection = $('#productSelection');
          for (var i = 0;i < data.length;i++) {
            if (product.indexOf(data[i]._id) !== -1) {
              productSelection.append(
                '<option value="' + data[i]._id +
                '"  selected>' + data[i].name + '</option>'
              );
            }
          }
          triggerSelect();
        });
      }
    }
  }
});
$(document).ready(function() {
  if ($('#allQues').length !== 0) {
    if ($('#allQues').parent().hasClass('active')) {
      var queryString = getQueryStringParamsQuestion();
      var tag = queryString.tags;
      if (tag !== undefined && !(tag instanceof Array)) {
        tag = [tag];
      }
      if (tag !== undefined) {
        var getParams = {
          tags: tag,
        };
        $.ajax({
          url: '/quickSupport/getTagList',
          type: 'POST',
          data: getParams,
        })
        .done(function(data) {
          var tempTags = [];
          if (tag instanceof Array) {
            for (tagCount = 0;tagCount < tag.length;tagCount++) {
              tempTags.push(parseInt(tag[tagCount]));
            }
          }else {
            tempTags = [parseInt(tag)];
          }
          var tagtSelection = $('#tagtSelection');
          for (var i = 0;i < data.length;i++) {
            if (tempTags.indexOf(data[i]._id) !== -1) {
              tagtSelection.append(
                '<option value="' + data[i]._id +
                '"  selected>' + data[i].name + '</option>'
              );
            }
          }
          triggerSelect();
        });
      }
    }
  }
});
function getQueryStringParamsQuestion() {
  location.queryString = {};
  location.search.substr(1).split('&').forEach(function(pair) {
    if (pair === '') {
    return;}
    var parts = pair.split('=');
    if ((parts[0] in location.queryString)) {
      if (location.queryString[parts[0]] instanceof Array) {
        location.queryString[parts[0]].push(parts[1]);
      }else {
        location.queryString[parts[0]] = [location.queryString[parts[0]]];
        location.queryString[parts[0]].push(parts[1]);
      }
    }else {
      location.queryString[parts[0]] = parts[1] &&
        decodeURIComponent(parts[1].replace(/\+/g, ''));
    }
  });
  return location.queryString;
}
function addProduct(val) {
  var inputValues = {
      name: val,
    };
  $.ajax({
      url: '/quickSupport/addProduct',
      type: 'POST',
      data: inputValues,
    })
    .done(function(data) {
      var productSelection = $('#productSelection');
      productSelection.append(
        '<option value="' + data._id +
        '"  selected>' + data.name + '</option>'
      );
      productSelection.find('[value="true"]').remove();
      triggerSelect();
    });
}
function addTag(val) {
  var inputValues = {
      name: val,
    };
  $.ajax({
      url: '/quickSupport/addTag',
      type: 'POST',
      data: inputValues,
    })
    .done(function(data) {
      var tagSelection = $('#questionTag');
      tagSelection.append(
        '<option value="' + data._id +
        '"  selected>' + data.name + '</option>'
      );
      tagSelection.find('[value="true"]').remove();
      triggerSelect();
    });
}
function addBusinessProcessArea(val) {
  var inputValues = {
      name: val,
    };
  $.ajax({
      url: '/quickSupport/addBusinessProcessArea',
      type: 'POST',
      data: inputValues,
    })
    .done(function(data) {
      var businessProcessArea = $('#businessProcessArea');
      businessProcessArea.append(
        '<option value="' + data._id +
        '"  selected>' + data.name + '</option>'
      );
      businessProcessArea.find('[value="true"]').remove();
      triggerSelect();
    });
}

$('select').
  not('.notSelect2').on('select2:close', function() {
    if ($(this).attr('data-tags') === 'true') {
      var businessProcessArea = $('#businessProcessArea');
      businessProcessArea.find('[value="true"]').remove();
      var tagSelection = $('#questionTag');
      tagSelection.find('[value="true"]').remove();
      var productSelection = $('#productSelection');
      productSelection.find('[value="true"]').remove();
    }

  });


$(document).ready(function() {
  if ($('#allQues').length !== 0) {
    $.ajax({
    url: '/quickSupport/industry',
    type: 'GET',
  })
  .done(function(data) {
    var finalData = [];
    for (var i = 0;i < data.length;i++) {
      var miniData = {
        id: data[i]._id,
        text: data[i].name,
      };
      finalData.push(miniData);
    }
    $('#industrySelect').select2({
      data: finalData,
    });
    if (industry !== '') {
      $('#industrySelect').select2().
      val([industry.toString()]).trigger('change');
    }else {
      $('#industrySelect').select2().val('').trigger('change');
    }
  });
  }
});
$(document).ready(function() {
  if ($('#allQues').length !== 0) {
    if ($('#allQues').parent().hasClass('active')) {
      var queryString = getQueryStringParamsQuestion();
      var businessProcessAreaList = queryString.businessProcessArea;
      if (queryString.businessProcessArea !== undefined) {
        $.ajax({
          url: '/quickSupport/businessProcessArea',
          type: 'GET',
        })
        .done(function(data) {
          if (!(businessProcessAreaList instanceof Array)) {
            businessProcessAreaList = [businessProcessAreaList];
          }
          var businessProcessArea = $('#businessProcessArea');
          for (var i = 0;i < data.length;i++) {
            if (businessProcessAreaList.indexOf((data[i]._id).toString()) !==
              -1) {
              businessProcessArea.append(
                '<option value="' + data[i]._id +
                '"  selected>' + data[i].name + '</option>'
              );
            }
          }
          triggerSelect();
        });
      }
    }
  }
});

function triggerSelect() {
  $('select').
    not('.notSelect2').each(function(index, ele) {
      var attr = $(ele).attr('data-master');
      var dataLimit = $(ele).attr('data-limit');
      var products = [];
      if (dataLimit === undefined) {
        dataLimit = 'Infinity';
      }
      if ($(ele).attr('data-tags') === 'true') {
        taging = true;
      }else {
        taging = false;
      }
      if (typeof attr !== typeof undefined && attr !== false) {
        $(ele).select2({
          ajax: {
            url: '/quickSupport/' + attr,
            dataType: 'json',
            data: function(params) {
              return {
                q: params.term,
              };
            },
            delay: 250,
            processResults: function(data, page) {
              var resultArray = data.map(function(elm) {
              return { id: elm._id, text: elm.name };
            });
              products = resultArray;
              return {
                results: resultArray,
              };
            },
            cache: true,
          },
          escapeMarkup: function(markup) {
            return markup;
          },
          minimumInputLength: 1,
          maximumSelectionLength: dataLimit,
          tags: taging,
          createTag: function(tag) {
            var tagFlag = true;
            if (attr === 'products') {
              $.each(products, function(i, product) {
                if (tag.term.toLowerCase() === product.text.toLowerCase()) {
                  tagFlag = false;
                }
              });
            }
            if (tagFlag) {
              return {
                id: true,
                text: tag.term,
                isNew: true,
              };
            }
          },

        }).on('select2:select', function(e) {
          if (e.params.data.isNew) {
            if (newProduct !== e.params.data.text) {
              newProduct = e.params.data.text;
              if (attr === 'products' && $(ele).attr('data-tags') === 'true') {
              addProduct(e.params.data.text);}
              if (attr === 'getTags' && $(ele).attr('data-tags') === 'true') {
              addTag(e.params.data.text);}
              if (attr === 'businessProcessArea' &&
                $(ele).attr('data-tags') === 'true') {
                addBusinessProcessArea(e.params.data.text);
              }
            }
          }
        });
      } else {
        $(ele).select2({});
      }
    });
}
function addProductLink(data, page) {
  var isNew = false;
  var link = $('<a id="add" data-toggle="modal"' +
  'data-target="#createProductForm"> Sorry ' +
   page.term + 'does not exists.Do you want to add this product?' +
  '</a>');
  if (data.length) {
    isNew = data.map(function(e) { return e.name.toLowerCase(); })
    .indexOf(page.term.toLowerCase()) === -1;
  $('#productName').val(page.term);}
  if (data.isNew || isNew) {
    (function() {
    $('#add').remove();
  })();
    $('.add-product').after(link);
    if (!isNew) {
      $('#productName').val(page.term);
    }
  } else {
    $('#add').hide();
    $('.add-product').after(link);
    $('#productName').val(page.term);
  }
  if (data.length !== 0) {
  $('#add').hide();}
}
$(document).ready(function() {
  if ($('#allQues').length !== 0) {
    if ($('#showProfileCheck').is(':checked')) {
      $('.filterSelectData').prop('disabled', true);
      $('label.filterSelectData').attr('disabled', true);
    }else {
      $('.filterSelectData').prop('disabled', false);
      $('label.filterSelectData').removeAttr('disabled');
    }
    $('#showProfileCheck').click(function(event) {
      if ($('#showProfileCheck').is(':checked')) {
        $('.filterSelectData').prop('disabled', true);
        $('label.filterSelectData').attr('disabled', true);
      }else {
        $('.filterSelectData').prop('disabled', false);
        $('label.filterSelectData').removeAttr('disabled');
      }
    });
  }

  var emptyRecord = '';
  if ($('#allanswered').length !== 0) {
    if ($('#allpending').parent().hasClass('active')) {
      emptyRecord = 'There is no feedback pending';
    }else if ($('#allQues').parent().hasClass('active')) {
      emptyRecord = 'Question List is empty';
    }else if ($('#allanswered').parent().hasClass('active')) {
      emptyRecord = 'There are no questions answered by you';
    }else if ($('#allasked').parent().hasClass('active')) {
      emptyRecord = 'There are no questions asked by you';
    }
    $('.questionTable,.answerTable,.feedbackTable').DataTable({
    dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
    ordering: false,
    pageLength: 5,
    language: {
      emptyTable: emptyRecord,
    },
  });
  }
});
function getQueryStringParams() {
  location.queryString = {};
  location.search.substr(1).split('&').forEach(function(pair) {
    if (pair === '') {
    return;}
    var parts = pair.split('=');
    location.queryString[parts[0]] = parts[1] &&
        decodeURIComponent(parts[1].replace(/\+/g, ''));
  });
  return location.queryString;
}
$(function() {
  if ($('#allanswered').parent().hasClass('active')) {
    if (location.search !== '') {
      var answeredFilters = getQueryStringParams();
      $('#statusFilter').select2().
      val(answeredFilters.status).trigger('change');
      $('#startDate').val(answeredFilters.startDate);
      $('#endDate').val(answeredFilters.endDate);
    }
    $('#rangeDatepicker').datepicker({
    });
  }
  $('.responderNote').focusout(function(event) {
    $.ajax({
      url: '/quickSupport/savenote',
      type: 'POST',
      data: {responderNote: $('.responderNote').val(),
      id: $('.responderNote').attr('data-id'), },
    })
    .done(function() {
      var time = moment(new Date()).format('MMM DD YYYY, hh:mmA');
      $('.noteTime').text('Auto save at ' + time);
    });
  });

  $('.requesterNote').focusout(function(event) {
    $.ajax({
      url: '/quickSupport/savenote',
      type: 'POST',
      data: {requesterNote: $('.requesterNote').val(),
      id: $('.requesterNote').attr('data-id'), },
    })
    .done(function() {
      var time = moment(new Date()).format('MMM DD YYYY, hh:mmA');
      $('.noteTime').text('Auto save at ' + time);
    });
  });

});

function formatTime(nbSeconds, hasHours) {
  var time = [];
  var s = 1;
  var calc = nbSeconds;
  if (hasHours) {
    s = 3600;
    calc = calc / s;
    time.push(format(Math.floor(calc)));
  }
  calc = ((calc - (time[time.length - 1] || 0)) * s) / 60;
  time.push(format(Math.floor(calc)));
  calc = (calc - (time[time.length - 1])) * 60;
  time.push(format(Math.round(calc)));
  function format(n) {
    return (('' + n) / 10).toFixed(1).replace('.', '');
  }
  return time.join(':');
}

$('#applyCode').click(function(event) {
  if ($('#promotionCode').val().trim() === '') {
    $('.promotionError').text('Please enter promotion code');
    $('.promotionError').show();
  }else {
    var emailRegex = /^[A-Za-z0-9._]*\@[A-Za-z]*\.[A-Za-z]{2,5}$/;
    var validEmail = !emailRegex.test($('#promotionCode').val());
    if (validEmail === false) {
      var data = {coupon: $('#promotionCode').val()};
      $.ajax({
      url: '/quickSupport/validReferalCoupon',
      type: 'POST',
      data: data,
    })
    .done(function(response) {
      var key2 = 'percent_off';
      var getOff = response[key2];
      $('.promotionSuccess').text('Percent off:' + '' +
        getOff + '%');
      $('#addCoupon').val(response.id);
      $('#referralBy').val($('#promotionCode').val());
      $('.promotionSuccess').show();
      $('#promotionalCode').text('Promotional Code:' + '' +
        $('#promotionCode').val());
    })
    .fail(function(data) {
      $('.promotionError').text('Invalid Promotion Code');
      $('.promotionError').show();
      $('#promotionalCode').text('No promotional code used');
    })
    .always(function(response) {
    });
    }else {
      var dataValue = {coupon: $('#promotionCode').val()};
      $.ajax({
      url: '/quickSupport/validCoupon',
      type: 'POST',
      data: dataValue,
    })
    .done(function(response) {
      var key1 = 'percent_off';
      var getOffValid = response.key1;
      $('.promotionSuccess').text('Percent off:' + '' +
        getOffValid + '%');
      $('.promotionSuccess').show();
      $('#addCoupon').val(response.id);
      $('#promotionalCode').text('Promotional Code:' + ' ' +
       response.id);
    })
    .fail(function(data) {
      $('.promotionError').text('Invalid Promotion Code');
      $('.promotionError').show();
      $('#promotionalCode').text('No promotional code used');
    })
    .always(function(response) {
    });
    }
  }

});
