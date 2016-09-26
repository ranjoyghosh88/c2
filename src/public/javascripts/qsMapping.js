$(document).ready(function() {
  triggerSelect();
  if ($('#editCompanyCheck').is(':checked')) {
    $('#company-span').css('display', 'block');
  }
  if ($('#editPersonalProfileCheck').is(':checked')) {
    $('#person-span').css('display', 'block');
  }
  if ($('#editDefaultService').is(':checked')) {
    $('#companyCheck').prop('disabled', true);
    $('#personalProfileCheck').prop('disabled', true);
  }
  $('#stripeProductId').change(function() {
    if ($(this).data('options') === undefined) {
      $(this).data('options', $('#stripeSkuId option').clone());
    }
    var id = $(this).val();
    var options = $(this).data('options').filter('[id=' + id + ']');
    $('#stripeSkuId').html(options);
    $('#stripeSkuId').select2().val('').trigger('change');
  });
  $('#defaultService').click(function(event) {
    if ($('#defaultService').is(':checked')) {
      $('.companyCheck').prop('disabled', true);
      $('.personalProfileCheck').prop('disabled', true);
      $('.companyCheck').prop('checked', false);
      $('.personalProfileCheck').prop('checked', false);
      $('#company-span').css('display', 'none');
      $('#person-span').css('display', 'none');
      $('#csquireCompanyProfiles').select2('val', '');
      $('#csquirePersonalProfiles').select2('val', '');
    }else {
      $('.companyCheck').prop('disabled', false);
      $('.personalProfileCheck').prop('disabled', false);
    }
  });
  $('#companyCheck').click(function(event) {
    if ($('#companyCheck').is(':checked')) {
      $('#company-span').css('display', 'block');
    }else {
      $('#company-span').css('display', 'none');
      $('#csquireCompanyProfiles').select2('val', '');
    }
  });
  $('#editCompanyCheck').click(function(event) {
    if ($('#editCompanyCheck').is(':checked')) {
      $('#company-span').css('display', 'block');
    }else {
      $('#company-span').css('display', 'none');
    }
  });
  $('#editPersonalProfileCheck').click(function(event) {
    if ($('#editPersonalProfileCheck').is(':checked')) {
      $('#person-span').css('display', 'block');
    }else {
      $('#person-span').css('display', 'none');
    }
  });
  $('#personalProfileCheck').click(function(event) {
    if ($('#personalProfileCheck').is(':checked')) {
      $('#person-span').css('display', 'block');
    }else {
      $('#person-span').css('display', 'none');
      $('#csquirePersonalProfiles').select2('val', '');
    }
  });
  $('#clearFilter').click(function(event) {
    $('#csquireServiceFilter').select2('val', '');
  });
});
$(document).ready(function() {
  $('#clearAllFilter').click(function(event) {
    getQueryStringParams();
  });
  $('#clearAllPlanFilter').click(function(event) {
    window.location.replace('/qsMapping/planMapping');
  });
});
function getQueryStringParams() {
  var flag = false;
  location.search.substr(1).split('&').forEach(function(pair) {
    if (pair === '') {
    return;}
    var parts = pair.split('=');
    if (parts[0] === 'csquireService') {
      flag = true;
    }
  });
  if (flag) {
    window.location.replace(window.location.href);
  }else {
    window.location.replace('/qsMapping');
  }
}
$(document).ready(function() {
  if ($('#editDefaultService').length !== 0) {
    if ($('#editDefaultService').is(':checked')) {
      $('#editDefaultService').prop('disabled', true);
      $('.company-person-div').css('display', 'none');
      $('#csquireService').prop('disabled', true);
    }else {
      $('.default-div').css('display', 'none');
      $('.add-mapping').prop('disabled', true);
    }
  }
  $('#editDefaultService').click(function(event) {
    if ($('#editDefaultService').is(':checked')) {
      $('.companyCheck').prop('disabled', true);
      $('.personalProfileCheck').prop('disabled', true);
      $('.companyCheck').prop('checked', false);
      $('.personalProfileCheck').prop('checked', false);
      $('#company-span').css('display', 'none');
      $('#person-span').css('display', 'none');
    }else {
      $('.companyCheck').prop('disabled', false);
      $('.personalProfileCheck').prop('disabled', false);
    }
  });
  $('.skuDetails').click(function(event) {
    var skuId = $(this).attr('id');
    getSkuDetails(skuId);
  });
  $('.skuCouponDetails').click(function(event) {
    var couponId = $(this).attr('couponId');
    var refSkuId = $(this).attr('refSkuId');
    getCouponSkuDetails(couponId, refSkuId);
  });
  $('.couponDetailsById').click(function(event) {
    var couponId = $(this).attr('couponId');
    getCouponuDetailsById(couponId);
  });
  $('select').change(function(event) {
    $(this).parent().find('.error').css('display', 'none');
  });
  $('.check').change(function(event) {
    $('.radioContainer').find('.error').css('display', 'none');
  });
  $('.checkPlan').change(function(event) {
    $('#all-select').next().css('display', 'none');
  });
});
if ($.fn.DataTable) {
  $.fn.DataTable.defaults = $.extend($.fn.DataTable.defaults, {
    drawCallback: function(tab) {
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
function getSkuDetails(skuId) {
  $.ajax({
    url: '/qsMapping/getSkuDetails/' + skuId,
    type: 'get',
  })
  .done(function(data) {
    $('#skuDetailsPopup .setHeaderMessage').text('SKU Details');
    $('#skuDetailsPopup .modal-body .skuName').text(data.id);
    $('#skuDetailsPopup .modal-body .product').text(data.product);
    var description = data.attributes.description;
    $('#skuDetailsPopup .modal-body .description').text(description);
    $('#skuDetailsPopup .modal-body .price').text(data.price);
    $('#skuDetailsPopup').modal('show');
  })
  .fail(function(data) {
    $('#skuDetailsPopup .setHeaderMessage').text('SKU Details');
    $('#skuDetailsPopup').modal('show');
  });
}
function getCouponuDetailsById(couponId) {
  $.ajax({
    url: '/qsMapping/getCouponuDetailsById/' + couponId + '/',
    type: 'get',
  })
  .done(function(data) {
    (function() {
      var maxRedemptionsKey = 'max_redemptions';
      if (data[maxRedemptionsKey] !== null) {
        var maxRedemptions = '<label class="widthadjust">Max Redemptions' +
      '</label>' + data[maxRedemptionsKey];
        $('#couponPopup .modal-body .maxRedemptions').html(maxRedemptions);
      }
      var timesRedeemedKey = 'times_redeemed';
      var timesRedeemed = '<label class="widthadjust">Times Redeemed' +
      '</label>' + data[timesRedeemedKey];
      var redeembyKey = 'redeem_by';
      if (data[redeembyKey] !== null) {
        var date = new Date(data[redeembyKey] * 1000);
        var expireDate = (date.getMonth() + 1) + '/' + date.getDate() +
        '/' +  date.getFullYear();
        var expiryDateText = '<label class="widthadjust">Expiry Date</label>' +
        expireDate;
        $('#couponPopup .modal-body .expiryDate').html(expiryDateText);
      }
      $('#couponPopup .modal-body .timesRedeemed')
        .html(timesRedeemed);
    })();
    var durationText = '<label class="widthadjust">Duration </label>' +
    data.duration;
    var validCoupon = '<label class="widthadjust">Valid </label>' +
    data.valid;
    $('#couponPopup .setHeaderMessage').text('Coupon Details');
    $('#couponPopup .modal-body .duration').html(durationText);
    $('#couponPopup .modal-body .valid').html(validCoupon);
    setupCouponPopupInformation(data);
  })
  .fail(function(data) {
    $('#couponPopupErr .setHeaderMessage').text('Coupon Details');
    $('#couponPopupErr .modal-body').html('Coupon deleted from Stripe');
    $('#couponPopupErr').modal('show');
  });
}
function dollarformat(num) {
  var conv = num / 100;
  return '$' + conv.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
function getCouponSkuDetails(couponId, refSkuId) {
  $.ajax({
    url: '/qsMapping/getCouponSkuDetails/' + couponId + '/' + refSkuId,
    type: 'get',
  })
  .done(function(data) {
    (function() {
      var maxRedemptionsKey = 'max_redemptions';
      if (data.getCouponDetails[maxRedemptionsKey] !== null) {
        var maxRedemptions = '<label class="widthadjust">Max Redemptions' +
        '</label>' + data.getCouponDetails[maxRedemptionsKey];
        $('#couponSkuPopup .modal-body .maxRedemptions').html(maxRedemptions);
      }
      var timesRedeemedKey = 'times_redeemed';
      var timesRedeemed = '<label class="widthadjust">Times Redeemed' +
      '</label>' + data.getCouponDetails[timesRedeemedKey];
      var redeembyKey = 'redeem_by';
      if (data.getCouponDetails[redeembyKey] !== null) {
        var date = new Date(data.getCouponDetails[redeembyKey] * 1000);
        var expireDate = (date.getMonth() + 1) + '/' + date.getDate() +
        '/' +  date.getFullYear();
        var expiryDateText = '<label class="widthadjust">Expiry Date</label>' +
        expireDate;
        $('#couponSkuPopup .modal-body .expiryDate').html(expiryDateText);
      }
      $('#couponSkuPopup .modal-body .timesRedeemed')
        .html(timesRedeemed);
    })();
    var durationText = '<label class="widthadjust">Duration </label>' +
    data.getCouponDetails.duration;
    var descriptionText = data.getSkuDetails.attributes.description;
    var validCoupon = '<label class="widthadjust">Valid </label>' +
    data.getCouponDetails.valid;
    $('#couponSkuPopup .setHeaderMessage').text('SKU Coupon Details');
    $('#couponSkuPopup .modal-body .duration').html(durationText);
    $('#couponSkuPopup .modal-body .valid').html(validCoupon);
    $('#couponSkuPopup .modal-body .skuName').text(data.getSkuDetails.id);
    $('#couponSkuPopup .modal-body .product').text(data.getSkuDetails.product);
    $('#couponSkuPopup .modal-body .description').text(descriptionText);
    $('#couponSkuPopup .modal-body .price').text(data.getSkuDetails.price);
    setupCouponPopupInfo(data);
  })
  .fail(function(data) {
    $('#skuDetailsPopup .setHeaderMessage').text('SKU Details');
    $('#skuDetailsPopup').modal('show');
  });
}
function setupCouponPopupInformation(data) {
  var couponId = '<label class="widthadjust">Id</label>' +
  data.id;
  $('#couponPopup .modal-body .couponId')
  .html(couponId);
  var amountOff = 'amount_off';
  if (data[amountOff]) {
    var amountOffText = '<label class="widthadjust">amount_off</label>' +
    dollarformat(data[amountOff]);
    $('#couponPopup .modal-body .couponPrice').html(amountOffText);
  }else {
    var percentOff = 'percent_off';
    var percentOffText = '<label class="widthadjust">percent_off</label>' +
    data[percentOff] + '%';
    $('#couponPopup .modal-body .couponPrice').html(percentOffText);
  }
  $('#couponPopup').modal('show');
}
function setupCouponPopupInfo(data) {
  var couponId = '<label class="widthadjust">Id</label>' +
  data.getCouponDetails.id;
  $('#couponSkuPopup .modal-body .couponId')
  .html(couponId);
  var amountOff = 'amount_off';
  if (data.getCouponDetails[amountOff]) {
    var amountOffText = '<label class="widthadjust">amount_off</label>' +
    dollarformat(data.getCouponDetails[amountOff]);
    $('#couponSkuPopup .modal-body .couponPrice').html(amountOffText);
  }else {
    var percentOff = 'percent_off';
    var percentOffText = '<label class="widthadjust">percent_off</label>' +
    data.getCouponDetails[percentOff] + '%';
    $('#couponSkuPopup .modal-body .couponPrice').html(percentOffText);
  }
  $('#couponSkuPopup').modal('show');
}
$(document).ready(function() {
  var emptyRecord = 'There is no mapping';
  $('.productMappingTable , .couponMappingTable,' +
    '.referralMappingTable').DataTable({
      dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
      ordering: false,
      pageLength: 10,
      language: {
        emptyTable: emptyRecord,
      },
    });
});
$('a[data-confirm]').click(function(ev) {
  var href = $(this).attr('href');
  if (!$('#dataConfirmModal').length) {
    var pop = '<div id="dataConfirmModal" class="modal" role="dialog"' +
    'aria-labelledby="dataConfirmLabel" aria-hidden="true">' +
    '<div class="modal-dialog modal-small">' +
    '<div class="modal-content">' +
    '<div class="modal-header"><button type="button"' +
    'class="close text-inverse"data-dismiss="modal"' +
    'aria-hidden="true">×</button><h4 id="dataConfirmLabel" ' +
    'class="modal-title text-uppercase text-inverse">Please Confirm</h3>' +
    '</div><div class="modal-body"></div><div class="modal-footer">' +
    '<button class="btn btn-default btn-heading-small"' +
    'data-dismiss="modal" aria-hidden="true">Cancel</button>' +
    '<a class="btn btn-primary btn-default btn-heading-small"' +
    'id="dataConfirmOK">OK</a></div></div></div></div>';
    $('body').append(pop);
  }
  var dataConfirm = $(this).attr('data-confirm');
  $('#dataConfirmModal').find('.modal-body').text(dataConfirm);
  $('#dataConfirmOK').attr('href', href);
  $('#dataConfirmModal').modal({show: true , backdrop: 'static',
    keyboard: false, });
  return false;
});
var productMappingFieldValidation = function() {
  var valid = true;
  if ($('#stripeProductId').val() === '') {
    $('#stripeProductId').next().next().show();valid = false;
  }
  if ($('#csquireService').val() === '') {
    $('#csquireService').next().next().show();valid = false;
  }
  if ($('#stripeSkuId').val() === '' ||
    $('#stripeSkuId').val() === null ||
    $('#stripeSkuId').val() === 'No SKU found') {
    $('#stripeSkuId').next().next().show();valid = false;
  }
  (function() {
    if (!$('#defaultService').is(':checked')) {
      if (!$('#companyCheck').is(':checked') &&
        !$('#personalProfileCheck').is(':checked')) {
        $('.company-person-div').next().next().show();valid = false;
        valid = false;
      }
      if ($('#companyCheck').is(':checked') &&
        $('#csquireCompanyProfiles').val() === null) {
        $('#csquireCompanyProfiles').next().next().show();valid = false;
        valid = false;
      }
      if ($('#personalProfileCheck').is(':checked') &&
        $('#csquirePersonalProfiles').val() === null) {
        $('#csquirePersonalProfiles').next().next().show();valid = false;
        valid = false;
      }
    }
  })();
  return valid;
};
var editProductMappingFieldValidation = function() {
  var valid = true;
  if ($('#stripeProductId').val() === '') {
    $('#stripeProductId').next().next().show();valid = false;
  }
  if ($('#csquireService').val() === '') {
    $('#csquireService').next().next().show();valid = false;
  }
  (function() {
    if ($('#stripeSkuId').val() === '' ||
      $('#stripeSkuId').val() === null ||
      $('#stripeSkuId').val() === 'No SKU found') {
      $('#stripeSkuId').next().next().show();valid = false;
    }
    if (!$('#editDefaultService').is(':checked')) {
      if (!$('.companyCheck').is(':checked') &&
       !$('.personalProfileCheck').is(':checked')) {
        $('.company-person-div').next().next().show();valid = false;
        valid = false;
      }
      if ($('.companyCheck').is(':checked') &&
        $('#csquireCompanyProfiles').val() === null) {
        $('#csquireCompanyProfiles').next().next().show();valid = false;
        valid = false;
      }
      (function() {
        if ($('.personalProfileCheck').is(':checked') &&
          $('#csquirePersonalProfiles').val() === null) {
          $('#csquirePersonalProfiles').next().next().show();valid = false;
          valid = false;
        }
      })();
    }
  })();
  return valid;
};
function triggerSelect() {
  $('select').
    not('.notSelect2').each(function(index, ele) {
      var attr = $(ele).attr('data-master');
      if (typeof attr !== typeof undefined && attr !== false) {
        $(ele).select2({
          ajax: {
            url: '/qsMapping/' + attr,
            dataType: 'json',
            data: function(params) {
              return {
                q: params.term,
              };
            },
            delay: 250,
            processResults: function(data, page) {
              if (attr === 'personalProfile') {
                resultArray = data.map(function(elm) {
                  var name = elm.name + ' ' +
                  elm.lastName + ' (' + elm.email + ' )';
                  return { id: elm._id, text: name };
                });
              }else {
                resultArray = data.map(function(elm) {
                  return { id: elm._id, text: elm.name };
                });
              }
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
        }).on('select2:select', function(e) {
        });
      } else {
        $(ele).select2({});
      }
    });
}
var $btn = $('#addStripeProductMapping');
$btn.on('click', function(e) {
  $('#product-mapping-form label.error').hide();
  var validationCheck = productMappingFieldValidation();
  if (validationCheck) {
    submitProductMapping();
  }
});
var $btn = $('#editStripeProductMapping');
$btn.on('click', function(e) {
  $('#product-mapping-form label.error').hide();
  var validationCheck = editProductMappingFieldValidation();
  if (validationCheck) {
    if (!$('.companyCheck').is(':checked')) {
      $('#csquireCompanyProfiles').select2('val', '');
    }
    if (!$('.personalProfileCheck').is(':checked')) {
      $('#csquirePersonalProfiles').select2('val', '');
    }
    editProductMapping();
  }
});

function editProductMapping() {
  $('#editStripeProductMapping').prop('disabled', true);
  $.ajax({
    url: '/qsMapping/editProductMapping',
    type: 'post',
    data: $('#product-mapping-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#editStripeProductMapping').prop('disabled', false);
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      $('#mappingPopup .setHeaderMessage').text('Success');
      $('#mappingPopup .messageGeneric').text('Mapping successfully ' +
        'saved.');
      $('#mappingPopup').modal('show');
      setTimeout(function() {
        window.location.replace('/qsMapping');}, 2000);
    }
  })
  .fail(function(data) {
    $('#editStripeProductMapping').prop('disabled', false);
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text('Error in saving mapping.');
    $('#mappingPopup').modal('show');
  });
}
function submitProductMapping() {
  $('#addStripeProductMapping').prop('disabled', true);
  $.ajax({
    url: '/qsMapping/submitProductMapping',
    type: 'post',
    data: $('#product-mapping-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#addStripeProductMapping').prop('disabled', false);
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      $('#mappingPopup .setHeaderMessage').text('Success');
      $('#mappingPopup .messageGeneric').text('Mapping successfully ' +
        'saved.');
      $('#mappingPopup').modal('show');
      setTimeout(function() {
        window.location.replace('/qsMapping');}, 2000);
    }
  })
  .fail(function(data) {
    $('#addStripeProductMapping').prop('disabled', false);
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text('Error in saving mapping.');
    $('#mappingPopup').modal('show');
  });
}
var $btn = $('#addQsReferralMapping');
$btn.on('click', function(e) {
  $('#referral-mapping-form label.error').hide();
  var validationCheck = referralMappingFieldValidation();
  if (validationCheck) {
    submitReferralMapping();
  }
});
function submitReferralMapping() {
  $('#addQsReferralMapping').prop('disabled', true);
  $.ajax({
    url: '/qsMapping/submitReferralMapping',
    type: 'post',
    data: $('#referral-mapping-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#addQsReferralMapping').prop('disabled', false);
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      $('#mappingPopup .setHeaderMessage').text('Success');
      $('#mappingPopup .messageGeneric').text('Mapping successfully ' +
        'saved.');
      $('#mappingPopup').modal('show');
      setTimeout(function() {
        window.location.replace('/qsMapping/referralMapping');}, 2000);
    }
  })
  .fail(function(data) {
    $('#addQsReferralMapping').prop('disabled', false);
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text('Error in saving mapping.');
    $('#mappingPopup').modal('show');
  });
}
var $btn = $('#editQsReferralMapping');
$btn.on('click', function(e) {
  $('#referral-mapping-form label.error').hide();
  var validationCheck = editReferralMappingFieldValidation();
  if (validationCheck) {
    editReferralMapping();
  }
});
function editReferralMapping() {
  $('#editQsReferralMapping').prop('disabled', true);
  $.ajax({
    url: '/qsMapping/editReferralMapping',
    type: 'post',
    data: $('#referral-mapping-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#editQsReferralMapping').prop('disabled', false);
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      $('#mappingPopup .setHeaderMessage').text('Success');
      $('#mappingPopup .messageGeneric').text('Mapping successfully ' +
        'saved.');
      $('#mappingPopup').modal('show');
      setTimeout(function() {
        window.location.replace('/qsMapping/referralMapping');}, 2000);
    }
  })
  .fail(function(data) {
    $('#editQsReferralMapping').prop('disabled', false);
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text('Error in saving mapping.');
    $('#mappingPopup').modal('show');
  });
}
var referralMappingFieldValidation = function() {
  var valid = true;
  if ($('#stripeCouponId').val() === '') {
    $('#stripeCouponId').next().next().show();valid = false;
  }
  if ($('#stripeProductRefId').val() === '') {
    $('#stripeProductRefId').next().next().show();valid = false;
  }
  (function() {
    if ($('#stripeSkuId').val() === '' ||
      $('#stripeSkuId').val() === null ||
      $('#stripeSkuId').val() === 'No SKU found') {
      $('#stripeSkuId').next().next().show();valid = false;
    }
    if (!$('#defaultService').is(':checked')) {
      if (!$('#personalProfileCheck').is(':checked')) {
        $('.company-person-div').next().show();valid = false;
        valid = false;
      }
      if ($('#personalProfileCheck').is(':checked') &&
        $('#csquirePersonalProfiles').val() === null) {
        $('#csquirePersonalProfiles').next().next().show();valid = false;
        valid = false;
      }
    }
  })();
  return valid;
};
var editReferralMappingFieldValidation = function() {
  var valid = true;
  if ($('#stripeCouponId').val() === '') {
    $('#stripeCouponId').next().next().show();valid = false;
  }
  if ($('#stripeProductRefId').val() === '') {
    $('#stripeProductRefId').next().next().show();valid = false;
  }
  if ($('#stripeSkuId').val() === '' ||
    $('#stripeSkuId').val() === null ||
    $('#stripeSkuId').val() === 'No SKU found') {
    $('#stripeSkuId').next().next().show();valid = false;
  }
  (function() {
    if (!$('#editDefaultService').is(':checked')) {
      if (($('#personalProfileCheck').length !== 0 &&
        !$('#personalProfileCheck').is(':checked')) ||
        ($('#editPersonalProfileCheck').length !== 0 &&
        !$('#editPersonalProfileCheck').is(':checked'))) {
        $('.company-person-div').next().show();valid = false;
        valid = false;
      }
      if ($('#personalProfileCheck').length !== 0 &&
        $('#personalProfileCheck').is(':checked') &&
        $('#csquirePersonalProfiles').val() === null) {
        $('#csquirePersonalProfiles').next().next().show();valid = false;
        valid = false;
      }
      if ($('#editPersonalProfileCheck').length !== 0 &&
        $('#editPersonalProfileCheck').is(':checked') &&
        $('#csquirePersonalProfiles').val() === null) {
        $('#csquirePersonalProfiles').next().next().show();valid = false;
        valid = false;
      }
    }
  })();
  return valid;
};
// Coupon Mapping Section
var couponMappingFieldValidation = function() {
  var valid = true;
  if ($('#stripeCouponId').val() === '') {
    $('#stripeCouponId').next().next().show();valid = false;
  }
  if ($('#csquireService').val() === '') {
    $('#csquireService').next().next().show();valid = false;
  }
  return valid;
};
var $btn = $('#addStripeCouponMapping');
$btn.on('click', function(e) {
  $('#coupon-mapping-form label.error').hide();
  var validationCheck = couponMappingFieldValidation();
  if (validationCheck) {
    submitCouponMapping();
  }
});
function submitCouponMapping() {
  $.ajax({
    url: '/qsMapping/submitCouponMapping',
    type: 'post',
    data: $('#coupon-mapping-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      $('#mappingPopup .setHeaderMessage').text('Success');
      $('#mappingPopup .messageGeneric').text('Mapping successfully ' +
        'saved.');
      $('#mappingPopup').modal('show');
      setTimeout(function() {
        window.location.replace('/qsMapping/couponMapping');}, 2000);
    }
  })
  .fail(function(data) {
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text('Error in saving mapping.');
    $('#mappingPopup').modal('show');
  });
}

function getSKUSOfProductId(val) {
  document.getElementById('stripeSkuId').disabled = true;
  var clickedProductId = val.value;
  $.ajax({
    url: '/qsMapping/getSKUSListOfProductIdApi/' + clickedProductId,
    type: 'get',
  })
  .success(function(data) {
    var counter = data.skusListOfProductId.length;
    $('#stripeSkuId').select2('val', '');
    $('#stripeSkuId option').remove();
    $('#stripeSkuId').append(
      '<option value="">&nbsp;</option>'
    );
    if (counter > 0) {
      for (var i = 0; i < counter; i++) {
        var skuName = data.skusListOfProductId[i].id;
        var skuNamePrice = data.skusListOfProductId[i].price / 100;
        var skuId = skuName + ' ($' + skuNamePrice + ')';
        $('#stripeSkuId').append(
          '<option value="' + skuName + '">' + skuId + '</option>'
        );
      }
    } else {
      $('#stripeSkuId').append(
          '<option value="No SKU found">No SKU found</option>'
        );
    }
    document.getElementById('stripeSkuId').disabled = false;
  });
}
var $btn = $('#addPlanMapping');
$btn.on('click', function(e) {
  $('#plan-mapping-form label.error').hide();
  var validationCheck = planMappingFieldValidation();
  if (validationCheck) {
    submitPlanMapping();
  }
});
function submitPlanMapping() {
  $('#addPlanMapping').prop('disabled', true);
  $.ajax({
    url: '/qsMapping/submitPlanMapping',
    type: 'post',
    data: $('#plan-mapping-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#addPlanMapping').prop('disabled', false);
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      $('#mappingPopup .setHeaderMessage').text('Success');
      $('#mappingPopup .messageGeneric').text('Mapping successfully ' +
        'saved.');
      $('#mappingPopup').modal('show');
      setTimeout(function() {
        window.location.replace('/qsMapping/planMapping');}, 2000);
    }
  })
  .fail(function(data) {
    $('#addPlanMapping').prop('disabled', false);
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text('Error in saving mapping.');
    $('#mappingPopup').modal('show');
  });
}
var planMappingFieldValidation = function() {
  var valid = true;
  if ($('#PlanService').val() === '') {
    $('#PlanService').next().next().show();valid = false;
  }
  if ($('#planId').val() === '') {
    $('#planId').next().next().show();valid = false;
  }
  var validSelect = $('.checkSelect').filter(function() {
    return $.trim($(this).val()).length > 0;
  }).length === 0;
  var defaultValidation = true;
  if (!$('#companyPlan').is(':checked') && !$('#personPlan').is(':checked') &&
    !$('#productPlan').is(':checked')) {
    defaultValidation = false;
  }
  if (validSelect && !defaultValidation) {
    $('#all-select').next().show();valid = false;
  }
  return valid;
};

$('#companyPlan[data-toggle="modal-confirm"]').click(function(event) {
  if ($('#companyPlan').is(':checked')) {
    if ($('#csquireCompanyProfiles').val()) {
      event.preventDefault();
      var self = $(this);
      (function() {
        var message = self.data('message');
        var title = self.data('title');
        var target = $(self.data('target'));
        var condition = self.data('condition');
        target.find('.modal-title').html(title);
        target.find('.modal-body').html(message);
        var showModal = true;
        var fn = window[condition];
        if (typeof fn === 'function') {
          showModal = fn(condition);
        }
        if (showModal) {
          target.on('shown.bs.modal', function(e) {
            target.find('button[data-confirm="modal"]').click(function(e) {
              e.preventDefault();
              $('#csquireCompanyProfiles').prop('disabled', true);
              $('#csquireCompanyProfiles').select2('val', '');
              $('#submit-confirm').modal('hide');
              $('#companyPlan').prop('checked', true);
            });
          });
          target.modal({ show: true });
        }
      })();
    } else {
      $('#csquireCompanyProfiles').prop('disabled', true);
      $('#csquireCompanyProfiles').select2('val', '');
    }
  }else {
    $('#csquireCompanyProfiles').prop('disabled', false);
    $('#csquireCompanyProfiles').select2('val', '');
  }
});
$('#personPlan[data-toggle="modal-confirm"]').click(function(event) {
  if ($('#personPlan').is(':checked')) {
    if ($('#csquirePersonalProfiles').val()) {
      event.preventDefault();
      var self = $(this);
      (function() {
        var message = self.data('message');
        var title = self.data('title');
        var target = $(self.data('target'));
        var condition = self.data('condition');
        target.find('.modal-title').html(title);
        target.find('.modal-body').html(message);
        var showModal = true;
        var fn = window[condition];
        if (typeof fn === 'function') {
          showModal = fn(condition);
        }
        if (showModal) {
          target.on('shown.bs.modal', function(e) {
            target.find('button[data-confirm="modal"]').click(function(e) {
              e.preventDefault();
              $('#csquirePersonalProfiles').prop('disabled', true);
              $('#csquirePersonalProfiles').select2('val', '');
              $('#submit-confirm').modal('hide');
              $('#personPlan').prop('checked', true);
            });
          });
          target.modal({ show: true });
        }
      })();
    } else {
      $('#csquirePersonalProfiles').prop('disabled', true);
      $('#csquirePersonalProfiles').select2('val', '');
    }
  }else {
    $('#csquirePersonalProfiles').prop('disabled', false);
    $('#csquirePersonalProfiles').select2('val', '');
  }
});
$('#productPlan[data-toggle="modal-confirm"]').click(function(event) {
  if ($('#productPlan').is(':checked')) {
    if ($('#csquireProductProfiles').val()) {
      event.preventDefault();
      var self = $(this);
      (function() {
        var message = self.data('message');
        var title = self.data('title');
        var target = $(self.data('target'));
        var condition = self.data('condition');
        target.find('.modal-title').html(title);
        target.find('.modal-body').html(message);
        var showModal = true;
        var fn = window[condition];
        if (typeof fn === 'function') {
          showModal = fn(condition);
        }
        if (showModal) {
          target.on('shown.bs.modal', function(e) {
            target.find('button[data-confirm="modal"]').click(function(e) {
              e.preventDefault();
              $('#csquireProductProfiles').prop('disabled', true);
              $('#csquireProductProfiles').select2('val', '');
              $('#submit-confirm').modal('hide');
              $('#productPlan').prop('checked', true);
            });
          });
          target.modal({ show: true });
        }
      })();
    } else {
      $('#csquireProductProfiles').prop('disabled', true);
      $('#csquireProductProfiles').select2('val', '');
    }
  }else {
    $('#csquireProductProfiles').prop('disabled', false);
    $('#csquireProductProfiles').select2('val', '');
  }
});
$('.planDetails').click(function(event) {
  var planId = $(this).attr('planId');
  getPlanDetails(planId);
});
function getPlanDetails(planId) {
  $.ajax({
    url: '/qsMapping/getPlanDetailsById/' + planId,
    type: 'get',
  })
  .done(function(data) {
    $('#planPopup .setHeaderMessage').text('Subscription Plan Details');
    $('#planPopup .modal-body .planId').text(data.id);
    $('#planPopup .modal-body .planPrice').text(dollarformat(data.amount));
    var intervalCount = 'interval_count';
    var duration = data[intervalCount] + ' ' + data.interval;
    $('#planPopup .modal-body .duration').text(duration);
    var statementDescriptor = 'statement_descriptor';
    if (data[statementDescriptor]) {
      $('#planPopup .modal-body .description').text(data[statementDescriptor]);
    }else {
      $('#planPopup .modal-body .description-block').hide();
    }
    var trialPeriod = 'trial_period_days';
    if (data[trialPeriod]) {
      $('#planPopup .modal-body .trialPeriod').text(data[trialPeriod] +
        ' days');
    }else {
      $('#planPopup .modal-body .trial-period').hide();
    }
    $('#planPopup').modal('show');
  })
  .fail(function(data) {
    $('#skuDetailsPopup .setHeaderMessage').text('SKU Details');
    $('#skuDetailsPopup').modal('show');
  });
}
$(document).ready(function() {
  if ($('#personPlan').is(':checked')) {
    $('#csquirePersonalProfiles').prop('disabled', true);
  }
  if ($('#companyPlan').is(':checked')) {
    $('#csquireCompanyProfiles').prop('disabled', true);
  }
  if ($('#productPlan').is(':checked')) {
    $('#csquireProductProfiles').prop('disabled', true);
  }
  (function() {
    if ($('#PlanService').val()) {
      $('#PlanService').prop('disabled', true);
    }
    if ($('#planId').val()) {
      $('#planId').prop('disabled', true);
    }
  })();
});