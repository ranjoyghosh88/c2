var $btn = $('#addStripeCouponCreate');
$btn.on('click', function(e) {
  $('#coupon-mapping-form label.error').hide();
  var validationCheck = couponCreateFieldValidation(function(err, value) {
    if (value && valided && validedit && valideding) {
      submitCouponCreate();
    }
  });
});
var $btn = $('#addStripeDiscountCreate');
$btn.on('click', function(e) {
  $('#coupon-mapping-form label.error').hide();
  var validationCheck = couponCreateFieldValidation(function(err, value) {
    if (value && valided && validedit && valideding) {
      submitDiscountCreate();
    }
  });
});
var couponCreateFieldValidation = function(callback) {
  var valid = false;
  var couponCode = document.getElementById('createCouponId').value;
  durationValidation();
  couponFieldValidation(couponCode, function(err, value) {
    return callback(null, value);
  });
};
var couponFieldValidation = function(couponCode, callback) {
  if ($('#createCouponId').val() === '') {
    $('#createCouponId').next().show();validedit = false;
  } else {
    $('#createCouponId').next().hide();validedit = true;
    if (/[^a-zA-Z0-9_]/.test(couponCode)) {
      $('#createCouponId').next().next().show();validedit = false;
    } else {
      valid = false;
      checkCouponValue(couponCode, function(err, value) {
        return callback(null, value);
      });
    }
  }
  return validedit;
};
var checkCouponValue = function(couponCode, callback) {
  $.ajax({
    url: '/qsCreate/getCouponuDetailsById/' + couponCode,
    type: 'get',
  })
  .done(function(data) {
    if (data.id === couponCode) {
      $('#createCouponId').next().next().hide();
      $('#createCouponId').next().next().next().show();valid = false;
    }else {
      $('#createCouponId').next().next().hide();
      $('#createCouponId').next().next().next().hide();valid = true;
    }
    return callback(null, valid);
  })
  .fail(function(data) {
    $('#createCouponId').next().next().hide();
    $('#createCouponId').next().next().next().hide();valid = true;
    return callback(null, valid);
  });
};
var durationValidation = function() {
  if ($('#value').val() === '') {
    $('#value').next().show();valided = false;
  } else {
    if ($('#offMode').val() === '%') {
      minmax($('#value').val(), 1, 100);
    } else {
      returnValue();
    }
    $('#value').next().hide();valided = true;
  }
  return valided;
};
var returnValue = function() {
  valideding = true;
  return valideding;
};
function minmax(value, min, max) {
  if (parseInt(value) < min || isNaN(value)) {
    $('#value').next().next().next().show();valideding = false;
  } else if (parseInt(value) > max) {
    $('#value').next().next().next().show();valideding = false;
  } else {
    $('#value').next().next().next().hide();valideding = true;
  }
  return valideding;
}
function submitCouponCreate() {
  $.ajax({
    url: '/qsCreate/submitCouponCreate',
    type: 'post',
    data: $('#coupon-create-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createCoupon');}, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createCoupon');}, 2000);
  });
}
function submitDiscountCreate() {
  $.ajax({
    url: '/qsCreate/submitCouponCreate',
    type: 'post',
    data: $('#discount-create-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createDiscount');}, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createDiscount');}, 2000);
  });
}
var showMsgBox = function() {
  $('#value').val('');
  if ($('#offMode').val() === '%') {
    $('#value').removeAttr('onkeyup', 'removeAlert(this)');
    $('#value').attr('onkeyup', 'ValidateFieldNum(this)');
    $('#value').next().next().show();
    $('#value').attr('maxlength', '4');
    $('#value').attr('min', '1');
    $('#value').attr('max', '100');
  } else {
    $('#value').removeAttr('onkeyup', 'ValidateFieldNum(this)');
    $('#value').attr('onkeyup', 'removeAlert(this)');
    $('#value').next().next().hide();
    $('#value').next().next().next().hide();
    $('#value').attr('maxlength', '100');
    $('#value').attr('min', '');
    $('#value').attr('max', '');
  }
};
$(document).ready(function() {
  var emptyRecordCoup = 'No Coupon present';
  $('.couponCreateTable').DataTable({
      dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
      ordering: false,
      pageLength: 10,
      language: {
        emptyTable: emptyRecordCoup,
      },
    });
  var emptyRecordProd = 'No Product present';
  $('.productCreateTable').DataTable({
      dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
      ordering: false,
      pageLength: 10,
      language: {
        emptyTable: emptyRecordProd,
      },
    });
  var emptyRecordSku = 'No SKU present';
  $('.skuCreateTable').DataTable({
      dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
      ordering: false,
      pageLength: 10,
      language: {
        emptyTable: emptyRecordSku,
      },
    });
  var emptyRecordplan = 'No Plan present';
  $('.planCreateTable').DataTable({
      dom: '<"row"<"col-sm-12"tr>><"row"<"col-sm-5"><"col-sm-7"p>>',
      ordering: false,
      pageLength: 10,
      language: {
        emptyTable: emptyRecordplan,
      },
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
function dollarformat(num) {
  var conv = num / 100;
  return '$' + conv.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function ValidateField(txt) {
  var TCode = document.getElementById('createCouponId').value;
  if (/[^a-zA-Z0-9_]/.test(TCode)) {
    $('#createCouponId').next().next().show();
    return false;
  } else {
    $('#createCouponId').next().next().hide();
  }
  $('#createCouponId').next().hide();
  return true;
}
function ValidateFieldNum(txt) {
  txt.value = txt.value.replace(/[^0-9\n\r]+/g, '');
  $('#' + txt.id).next().hide();
}
$('#redeemBy').datepicker({
  startDate: 'today',
  format: 'mm/dd/yyyy',
  autoclose: true,
  todayHighlight: true,
  toggleActive: true,
  minDate: 0,
});

function populateAttr(selected) {
  var selectedService = selected.value;
  if (selectedService) {
    $('#csquireService').next().hide();
    $.ajax({
      url: '/qsCreate/getCsquireAttr/' + selectedService,
      type: 'get',
      data: $('#coupon-create-form').serialize(),
    })
    .done(function(data) {
      if (data.csquireServices[0].attributes.length > 0) {
        var counter = data.csquireServices[0].attributes.length;
        var attr = '';
        for (var a = 0; a < counter;a++) {
          attr += data.csquireServices[0].attributes[a].name + ',';
        }
        var attrValues = attr.slice(0, -1);
        $('#attrValue').val(attrValues);
      } else {
        $('#attrValue').val('');
      }
    })
    .fail(function(data) {
      setTimeout(function() {
          window.location.replace('/qsCreate/createProduct');}, 2000);
    });
  }
}

var $btn = $('#addStripeProductCreate');
$btn.on('click', function(e) {
  $('#coupon-mapping-form label.error').hide();
  var validationCheckPros = productCreateFieldValidation(function(err, value) {
    if (value && valided && validedit && validedCS) {
      submitProductCreate();
    }
  });
});
var productCreateFieldValidation = function(callback) {
  var valid = false;
  var productVals = document.getElementById('productName').value;
  othersProductFields();
  csquireServiceValided();
  productFieldValidation(productVals, function(err, value) {
    return callback(null, value);
  });
};
var csquireServiceValided = function() {
  if ($('#csquireService').val() === '') {
    $('#csquireService').next().show();validedCS = false;
  } else {
    $('#csquireService').next().hide();validedCS = true;
  }
  return validedCS;
};
var othersProductFields = function() {
  if ($('#productDesc').val().trim() === '') {
    $('#productDesc').next().show();valided = false;
  } else {
    $('#productDesc').next().hide();valided = true;
  }
  return valided;
};
var productFieldValidation = function(productVals, callback) {
  if ($('#productName').val() === '') {
    $('#productName').next().show();validedit = false;
  } else {
    $('#productName').next().hide();validedit = true;
    if (/[^a-zA-Z0-9_]/.test(productVals)) {
      $('#productName').next().next().show();validedit = false;
    } else {
      valid = false;
      checkProductValue(productVals, function(err, value) {
        return callback(null, value);
      });
    }
  }
  return validedit;
};
var checkProductValue = function(productVals, callback) {
  $.ajax({
    url: '/qsCreate/getProductDetailsById/' + productVals,
    type: 'get',
  })
  .done(function(data) {
    if (data.id === productVals) {
      $('#productName').next().next().hide();
      $('#productName').next().next().next().show();valid = false;
    }else {
      $('#productName').next().next().hide();
      $('#productName').next().next().next().hide();valid = true;
    }
    return callback(null, valid);
  })
  .fail(function(data) {
    $('#productName').next().next().hide();
    $('#productName').next().next().next().hide();valid = true;
    return callback(null, valid);
  });
};
function ValidateProductField(txt) {
  $('#productName').next().hide();
  var PCode = document.getElementById('productName').value;
  if (/[^a-zA-Z0-9_]/.test(PCode)) {
    $('#productName').next().next().show();
    return false;
  } else {
    $('#productName').next().next().hide();
  }
  return true;
}
function submitProductCreate() {
  $.ajax({
    url: '/qsCreate/submitProductCreate',
    type: 'post',
    data: $('#product-create-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createProduct');}, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createProduct');}, 2000);
  });
}
// Edit product
$('.productEdit').click(function(event) {
  var productId = $(this).attr('id');
  getProductDetailsById(productId);
});
function getProductDetailsById(productId) {
  $.ajax({
    url: '/qsCreate/getProductDetailsById/' + productId + '/',
    type: 'get',
  })
  .done(function(data) {
    (function() {
      var productNameText = '<input name="productName" id="productName"' +
      'placeholder="Enter product name" readonly="readonly"' +
      'value="' + data.name + '" type="text" class="form-control">';
      var productAttrText = '<input id="attrValue" type="text"' +
      'value="' + data.attributes + '" name="attrValue" readonly="readonly"' +
      'placeholder="To, From" class="form-control">';
      var productDescText = '';
      if (data.description !== null) {
        productDescText = '<textarea name="productDescEdit"' +
        'id="productDescEdit" placeholder="Enter description of product"' +
        'class="form-control" onkeyup="removeAlert(this)">' +
        data.description + ' </textarea>' +
        '<input type="hidden" value="' + data.id + '" name="prosEditId"' +
        'id="prosEditId">' +
        '<label style="display:none;" class="error alert alert-danger' +
        ' marginLabel">Please enter description</label>';
      } else {
        productDescText = '<textarea name="productDescEdit"' +
        'id="productDescEdit" placeholder="Enter description of product"' +
        'class="form-control" onkeyup="removeAlert(this)">' +
        '</textarea>' +
        '<input type="hidden" value="' + data.id + '" name="prosEditId"' +
        'id="prosEditId">' +
        '<label style="display:none;" class="error alert alert-danger' +
        ' marginLabel">Please enter description</label>';
      }
      $('#productUpdatePopup .modal-body #productNameLabel')
        .html('Product Name');
      $('#productUpdatePopup .modal-body #productAttrLabel')
        .html('Attributes');
      $('#productUpdatePopup .modal-body #productDescLabel')
        .html('Description');
      $('#productUpdatePopup .modal-body #productNameInput')
        .html(productNameText);
      $('#productUpdatePopup .modal-body #productAttrInput')
        .html(productAttrText);
      $('#productUpdatePopup .modal-body #productDescInput')
        .html(productDescText);
    })();
    $('#productUpdatePopup').modal('show');
  })
  .fail(function(data) {
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text(data.message);
    $('#mappingPopup').modal('show');
  });
}
var $btns = $('#editStripeProductUpdate');
$btns.on('click', function(e) {
  if ($('#productDescEdit').val().trim() === '') {
    $('#productDescEdit').next().next().show();valided = false;
  } else {
    $('#productDescEdit').next().next().hide();valided = true;
  }
  if (valided) {
    updateProductCreate();
  }
});
function updateProductCreate() {
  $.ajax({
    url: '/qsCreate/updateProductCreate',
    type: 'post',
    data: $('#product-update-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 'already_exists') {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.message);
      $('#mappingPopup').modal('show');
    }else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createProduct');}, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createProduct');}, 2000);
  });
}
$('#createCouponPopup').on('hidden.bs.modal', function() {
  $('#createCouponPopup').find('input,textarea,select,text').val('').end();
  $('#offMode').val('$');
  $('.error').hide().end();
});
$('#createDiscountPopup').on('hidden.bs.modal', function() {
  $('#createDiscountPopup').find('input,textarea,select,text').val('').end();
  $('#offMode').val('$');
  $('.error').hide().end();
});
$('#createProductPopup').on('hidden.bs.modal', function() {
  $('#createProductPopup').find('input,textarea,select,text').val('').end();
  $('.error').hide().end();
});
var $btns = $('#addStripeCouponReset');
$btns.on('click', function(e) {
  $('#createCouponPopup').find('input,textarea,select,text').val('').end();
  $('#offMode').val('$');
  $('.error').hide().end();
});
var $btns = $('#addStripeDiscountReset');
$btns.on('click', function(e) {
  $('#createDiscountPopup').find('input,textarea,select,text').val('').end();
  $('#offMode').val('$');
  $('.error').hide().end();
});
var $btns = $('#addStripeProductReset');
$btns.on('click', function(e) {
  $('#createProductPopup').find('input,textarea,select,text').val('').end();
  $('.error').hide().end();
});
var $btns = $('#editStripeProductReset');
$btns.on('click', function(e) {
  $('#productUpdatePopup').find('textarea').val('').end();
  $('.error').hide().end();
});
function removeAlert(txt) {
  if (txt.id === 'productDescEdit' || txt.id === 'descriptionEdit') {
    $('#' + txt.id).next().next().hide();
  } else {
    $('#' + txt.id).next().hide();
  }
}
$('#value').keypress(function(event) {
  if ($('#offMode').val() === '$') {
    if (event.which === 8 || event.which === 0) {
      return true;
    }
    if (event.which < 46 || event.which > 59) {
      return false;
    }
    if (event.which === 46 && $(this).val().indexOf('.') !== -1) {
      return false;
    }
  }
});


// SKU Section
$('.addSKUBtn').click(function(event) {
  var productId = $(this).attr('id');
  getProductDetailsByProductId(productId);
});
$(document).ready(function() {
  var openPop = $('#openPop').val();
  if (openPop === 'true') {
    var productId = $('#prodId').val();
    getProductDetailsByProductId(productId);
  }
});
function getProductDetailsByProductId(productId) {
  $.ajax({
    url: '/qsCreate/getProductDetailsByProductId/' + productId + '/',
    type: 'get',
  })
  .done(function(data) {
    (function() {
      var randNo = Math.floor(Math.random() * 1111111);
      var productCounter = data.stripeProductList.length;
      var attrCounter = data.getProductDetails.attributes.length;
      var productNameSelect = '<select name="productId" id="productId"' +
      'data-placeholder="Select Product" data-errorholder=""' +
      'class="form-control pull-right" onchange="validAttr();">';
      for (var a = 0;a < productCounter;a++) {
        var prosId = data.stripeProductList[a].id;
        if (prosId === data.getProductDetails.id) {
          productNameSelect += '<option selected value="' + prosId + '">' +
          data.stripeProductList[a].name + '</option>';
        } else {
          productNameSelect += '<option value="' + prosId + '">' +
          data.stripeProductList[a].name + '</option>';
        }
      }
      productNameSelect += '</select>' +
      '<label style="display:none" class="error alert ' +
      'alert-danger marginLabel">Please select Product</label>' +
      '<input type="hidden" name="versionVal" value="' + randNo + '">';
      var SKUPriceInput = '<input placeholder="Enter Price"' +
      'name="skuPrice" id="skuPrice" onkeypress="return numbersonly(event)"' +
      'class="form-control" onkeyup="removeAlert(this)"/>' +
      '<label style="display:none" class="error alert ' +
      'alert-danger marginLabel">Please enter Price</label>';
      var SKUNameInput = '<input placeholder="Enter SKU ID"' +
      'type="text" name="skuName" id="skuName"' +
      'class="form-control" onkeyup="ValidateSkuField(this)"/>' +
      '<label style="display:none" class="error alert ' +
      'alert-danger marginLabel">Please enter SKU ID</label>' +
      '<label style="display:none" class="error alert ' +
      'alert-danger marginLabel">Special character not allowed</label>' +
      '<label style="display:none" class="error alert ' +
      'alert-danger marginLabel">SKU Already exists</label>' +
      '<input type="hidden" name="hasAttr" id="hasAttr"' +
      'value="' + attrCounter + '">';
      $('#createSKUPopup .modal-body #productNameSelect')
        .html(productNameSelect);
      $('#createSKUPopup .modal-body #SKUPriceInput')
        .html(SKUPriceInput);
      $('#createSKUPopup .modal-body #SKUNameInput')
        .html(SKUNameInput);
    })();
    $('#createSKUPopup .modal-body #productNameLabel').html('Product Name');
    $('#createSKUPopup .modal-body #SKUNameLabel').html('SKU ID');
    $('#createSKUPopup .modal-body #SKUPriceLabel').html('Price');
    $('#createSKUPopup .modal-body #attributesLabel').html('Attributes');
    setupSKUPopupCreate(data);
  })
  .fail(function(data) {
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text(data.message);
    $('#mappingPopup').modal('show');
  });
}
function setupSKUPopupCreate(data) {
  if (data.getProductDetails.attributes.length > 1) {
    $('#createSKUPopup .modal-body #attributesLabelOne')
      .html(stringToUpper(data.getProductDetails.attributes[0]));
    $('#createSKUPopup .modal-body #attributesLabelTwo')
      .html(stringToUpper(data.getProductDetails.attributes[1]));
    $('#createSKUPopup .modal-body #attributesLabelThree')
      .html(stringToUpper(data.getProductDetails.attributes[2]));
    $('#createSKUPopup .modal-body #attributesLabelFour')
    .html(stringToUpper(data.getProductDetails.attributes[3]));
    var attributesInputOne = '<select name="attrOne" id="attrOne"' +
    'data-placeholder="" data-errorholder="" onchange="removeAlert(this)"' +
    'class="form-control pull-right">' +
    '<option value="">Select ' + data.getProductDetails.attributes[0] +
    '</option><option value="csquire">csquire</option>' +
    '<option value="actor">actor</option>' +
    '</select>' +
    '<label style="display:none" class="error alert marginLabel ' +
    'alert-danger">Please enter ' + data.getProductDetails.attributes[0] +
    '</label>';
    var attributesInputTwo = '<select name="attrTwo" id="attrTwo"' +
    'data-placeholder="" data-errorholder="" onchange="removeAlert(this)"' +
    'class="form-control pull-right">' +
    '<option value="">Select ' + data.getProductDetails.attributes[1] +
    '</option><option value="csquire">csquire</option>' +
    '<option value="actor">actor</option>' +
    '</select>' +
    '<label style="display:none" class="error alert marginLabel ' +
    'alert-danger">Please enter ' + data.getProductDetails.attributes[1] +
    '</label>';
    var attributesInputThree = '<select name="attrFour" id="attrFour"' +
    'data-placeholder="" data-errorholder="" onchange="removeAlert(this)"' +
    'class="form-control pull-right">' +
    '<option value="">Select ' + data.getProductDetails.attributes[2] +
    '</option><option value="credit">credit</option>' +
    '<option value="debit">debit</option>' +
    '</select>' +
    '<label style="display:none" class="error alert marginLabel ' +
    'alert-danger">Please enter ' + data.getProductDetails.attributes[2] +
    '</label>';
    var attributesInputFour = '<textarea id="attrThree" name="attrThree"' +
    'placeholder="Enter description"' +
    'class="form-control" onkeyup="removeAlert(this)"></textarea>' +
    '<label style="display:none" class="error alert marginLabel ' +
    'alert-danger">Please enter ' + data.getProductDetails.attributes[3] +
    '</label>';
    $('#createSKUPopup .modal-body #attributesInputOne')
    .html(attributesInputOne);
    $('#createSKUPopup .modal-body #attributesInputTwo')
    .html(attributesInputTwo);
    $('#createSKUPopup .modal-body #attributesInputThree')
    .html(attributesInputThree);
    $('#createSKUPopup .modal-body #attributesInputFour')
    .html(attributesInputFour);
  } else {
    $('#attrOfProduct').hide();
  }
  $('#createSKUPopup').modal('show');
}
var $btns = $('#addStripeSKUReset');
$btns.on('click', function(e) {
  var productId = $('#productId').val();
  var hasAttr = $('#hasAttr').val();
  $('#createSKUPopup').find('input,textarea,select,text').val('').end();
  $('#productId').val(productId);
  $('#hasAttr').val(hasAttr);
  $('.error').hide().end();
});
$('#createSKUPopup').on('hidden.bs.modal', function() {
  $('#attrOfProduct').show();
  var productId = $('#productId').val();
  var hasAttr = $('#hasAttr').val();
  $('#createSKUPopup').find('input,textarea,select,text').val('').end();
  $('#productId').val(productId);
  $('#hasAttr').val(hasAttr);
  $('.error').hide().end();
});
var $btn = $('#addStripeSKUCreate');
$btn.on('click', function(e) {
  var validationCheckSku = skuCreateFieldValidation(function(err, value) {
    if (value && valided &&
      validedit && valideding &&
      attrTwo && attrThree && attrFour) {
      submitSKUCreate();
    }
  });
});
var skuCreateFieldValidation = function(callback) {
  var valid = false;
  var skuName = $('#skuName').val();
  var hasAttr = $('#hasAttr').val();
  attrValidation(hasAttr);
  priceValidation();
  skuFieldValidation(skuName, function(err, value) {
    return callback(null, value);
  });
};
var attrValidation = function(hasAttr) {
  if (hasAttr > 1) {
    if ($('#attrOne').val() === '') {
      $('#attrOne').next().show();valided = false;
    } else {
      $('#attrOne').next().hide();valided = true;
    }
    attrTwoFn();
  } else {
    valided = true;
    attrTwo = true;
    attrThree = true;
    attrFour = true;
  }
  return valided;
};
var attrTwoFn = function() {
  if ($('#attrTwo').val() === '') {
    $('#attrTwo').next().show();attrTwo = false;
  } else {
    $('#attrTwo').next().hide();attrTwo = true;
  }
  attrThreeFn();
  return attrTwo;
};
var attrThreeFn = function() {
  if ($('#attrThree').val().trim() === '') {
    $('#attrThree').next().show();attrThree = false;
  } else {
    $('#attrThree').next().hide();attrThree = true;
  }
  attrFourFn();
  return attrThree;
};
var attrFourFn = function() {
  if ($('#attrFour').val() === '') {
    $('#attrFour').next().show();attrFour = false;
  } else {
    $('#attrFour').next().hide();attrFour = true;
  }
  return attrFour;
};
var skuFieldValidation = function(skuName, callback) {
  if ($('#skuName').val() === '') {
    $('#skuName').next().show();validedit = false;
  } else {
    $('#skuName').next().hide();validedit = true;
    if (/[^a-zA-Z0-9_]/.test(skuName)) {
      $('#skuName').next().next().show();validedit = false;
    } else {
      valid = false;
      checkSKUValue(skuName, function(err, value) {
        return callback(null, value);
      });
    }
  }
  return validedit;
};
var priceValidation = function() {
  if ($('#skuPrice').val() === '') {
    $('#skuPrice').next().show();valideding = false;
  } else {
    $('#skuPrice').next().hide();valideding = true;
  }
  return valideding;
};
var checkSKUValue = function(skuName, callback) {
  $.ajax({
    url: '/qsCreate/getSkuDetailsById/' + skuName,
    type: 'get',
  })
  .done(function(data) {
    if (data.id === skuName) {
      $('#skuName').next().next().hide();
      $('#skuName').next().next().next().show();valid = false;
    }else {
      $('#skuName').next().next().hide();
      $('#skuName').next().next().next().hide();valid = true;
    }
    return callback(null, valid);
  })
  .fail(function(data) {
    $('#skuName').next().next().hide();
    $('#skuName').next().next().next().hide();valid = true;
    return callback(null, valid);
  });
};
function submitSKUCreate() {
  $.ajax({
    url: '/qsCreate/submitSKUCreate',
    type: 'post',
    data: $('#sku-create-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 400) {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.header);
      $('#createSKUPopup').modal('hide');
      $('#mappingPopup').modal('show');
    } else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createSKU?productId=' + data);
      }, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createProduct');}, 2000);
  });
}
function ValidateSkuField(txt) {
  $('#skuName').next().hide();
  var PCode = document.getElementById('skuName').value;
  if (/[^a-zA-Z0-9_]/.test(PCode)) {
    $('#skuName').next().next().show();
    return false;
  } else {
    $('#skuName').next().next().hide();
  }
  return true;
}
function numbersonly(e) {
  var unicode = e.charCode? e.charCode : e.keyCode;
  if (unicode === 8 || unicode === 0) {
    return true;
  }
  if (unicode < 46 || unicode > 59) {
    return false;
  }
  if (unicode === 46 && $(this).val().indexOf('.') !== -1) {
    return false;
  }
  var number = $('#skuPrice').val().split('.');
  if (number.length === 2 && number[1].length > 1) {
    return false;
  }
}
// Edit Sku
$('.skuEdit').click(function(event) {
  var skuId = $(this).attr('id');
  getSkuDetailsById(skuId);
});
function getSkuDetailsById(skuId) {
  $.ajax({
    url: '/qsCreate/getSkuDetailsById/' + skuId + '/',
    type: 'get',
  })
  .done(function(data) {
    (function() {
      var SKUNameInput = '<input readonly="readonly"' +
      'type="text" name="skuName" id="skuName"' +
      'class="form-control" value="' + data.id + '"/>' +
      '<input type="hidden" value="' + data.id + '"' +
      'name="skuEditId" id="skuEditId">' +
      '<input type="hidden" value="' + data.product + '"' +
      'name="prodId" id="prodId">';
      var SKUPriceInput = '<input value="' + data.price / 100 + '"' +
      'name="skuPriceEdit" placeholder="Enter Price" id="skuPriceEdit"' +
      'onkeypress="return numbersonlyEdit(event)"' +
      'class="form-control" onkeyup="removeAlert(this)"/>' +
      '<label style="display:none" class="error alert ' +
      'alert-danger marginLabel">Please enter Price</label>';
      var productDescText = '';
      $('#skuUpdatePopup .modal-body #SKUNameLabel')
        .html('SKU ID');
      $('#skuUpdatePopup .modal-body #SKUPriceLabel')
        .html('Price');
      $('#skuUpdatePopup .modal-body #SKUNameInput')
        .html(SKUNameInput);
      $('#skuUpdatePopup .modal-body #SKUPriceInput')
        .html(SKUPriceInput);
    })();
    $('#skuUpdatePopup').modal('show');
  })
  .fail(function(data) {
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text(data.message);
    $('#mappingPopup').modal('show');
  });
}
function numbersonlyEdit(e) {
  var unicode = e.charCode? e.charCode : e.keyCode;
  if (unicode === 8 || unicode === 0) {
    return true;
  }
  if (unicode < 46 || unicode > 59) {
    return false;
  }
  if (unicode === 46 && $(this).val().indexOf('.') !== -1) {
    return false;
  }
  var number = $('#skuPriceEdit').val().split('.');
  if (number.length === 2 && number[1].length > 1) {
    return false;
  }
}
var $btns = $('#editStripeSkuReset');
$btns.on('click', function(e) {
  $('#skuPriceEdit').val('').end();
  $('.error').hide().end();
});
var $btns = $('#editStripeSkuUpdate');
$btns.on('click', function(e) {
  if ($('#skuPriceEdit').val() === '') {
    $('#skuPriceEdit').next().show();valided = false;
  } else {
    $('#skuPriceEdit').next().hide();valided = true;
  }
  if (valided) {
    updateSkuCreate();
  }
});
function updateSkuCreate() {
  $.ajax({
    url: '/qsCreate/updateSkuCreate',
    type: 'post',
    data: $('#sku-update-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 400) {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.header);
      $('#skuUpdatePopup').modal('hide');
      $('#mappingPopup').modal('show');
    }else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createSKU?productId=' + data);
      }, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createProduct');
      }, 2000);
  });
}
function validAttr() {
  $('.error').hide().end();
  var prodId = $('#productId').val();
  $.ajax({
    url: '/qsCreate/getProductDetailsById/' + prodId + '/',
    type: 'get',
  })
  .done(function(data) {
    if (data.attributes.length > 1) {
      $('#attrOfProduct').show();
      $('#hasAttr').val(data.attributes.length);
      attrTrueHandler(data);
    } else {
      attrFalseHandler(data.attributes.length);
    }
  })
  .fail(function(data) {
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text(data.message);
    $('#mappingPopup').modal('show');
  });
}
function attrTrueHandler(data) {
  $('#createSKUPopup .modal-body #attributesLabelOne')
    .html(stringToUpper(data.attributes[0]));
  $('#createSKUPopup .modal-body #attributesLabelTwo')
    .html(stringToUpper(data.attributes[1]));
  $('#createSKUPopup .modal-body #attributesLabelThree')
    .html(stringToUpper(data.attributes[2]));
  $('#createSKUPopup .modal-body #attributesLabelFour')
  .html(stringToUpper(data.attributes[3]));
  var attributesInputOne = '<select name="attrOne" id="attrOne"' +
  'data-placeholder="" data-errorholder="" onchange="removeAlert(this)"' +
  'class="form-control pull-right">' +
  '<option value="">Select ' + data.attributes[0] +
  '</option><option value="csquire">csquire</option>' +
  '<option value="actor">actor</option>' +
  '</select>' +
  '<label style="display:none" class="error alert marginLabel ' +
  'alert-danger">Please enter ' + data.attributes[0] +
  '</label>';
  var attributesInputTwo = '<select name="attrTwo" id="attrTwo"' +
  'data-placeholder="" data-errorholder="" onchange="removeAlert(this)"' +
  'class="form-control pull-right">' +
  '<option value="">Select ' + data.attributes[1] +
  '</option><option value="csquire">csquire</option>' +
  '<option value="actor">actor</option>' +
  '</select>' +
  '<label style="display:none" class="error alert marginLabel ' +
  'alert-danger">Please enter ' + data.attributes[1] +
  '</label>';
  var attributesInputThree = '<select name="attrFour" id="attrFour"' +
  'data-placeholder="" data-errorholder="" onchange="removeAlert(this)"' +
  'class="form-control pull-right">' +
  '<option value="">Select ' + data.attributes[2] +
  '</option><option value="credit">credit</option>' +
  '<option value="debit">debit</option>' +
  '</select>' +
  '<label style="display:none" class="error alert marginLabel ' +
  'alert-danger">Please enter ' + data.attributes[2] +
  '</label>';
  var attributesInputFour = '<textarea id="attrThree" name="attrThree"' +
  'placeholder="Enter description"' +
  'class="form-control" onkeyup="removeAlert(this)"></textarea>' +
  '<label style="display:none" class="error alert marginLabel ' +
  'alert-danger">Please enter ' + data.attributes[3] +
  '</label>';
  $('#createSKUPopup .modal-body #attributesInputOne')
  .html(attributesInputOne);
  $('#createSKUPopup .modal-body #attributesInputTwo')
  .html(attributesInputTwo);
  $('#createSKUPopup .modal-body #attributesInputThree')
  .html(attributesInputThree);
  $('#createSKUPopup .modal-body #attributesInputFour')
  .html(attributesInputFour);
}
function attrFalseHandler(val) {
  $('#hasAttr').val(val);
  $('#createSKUPopup .modal-body #attributesLabelOne')
    .html('');
  $('#createSKUPopup .modal-body #attributesLabelTwo')
    .html('');
  $('#createSKUPopup .modal-body #attributesLabelThree')
    .html('');
  $('#createSKUPopup .modal-body #attributesLabelFour')
  .html('');
  $('#createSKUPopup .modal-body #attributesInputOne')
  .html('');
  $('#createSKUPopup .modal-body #attributesInputTwo')
  .html('');
  $('#createSKUPopup .modal-body #attributesInputThree')
  .html('');
  $('#createSKUPopup .modal-body #attributesInputFour')
  .html('');
  $('#attrOfProduct').hide();
}
function stringToUpper(val) {
  var str = val;
  str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
    return letter.toUpperCase();
  });
  return str;
}


// Plan Section Start
var $btn = $('#addStripePlanCreate');
$btn.on('click', function(e) {
  $('#coupon-mapping-form label.error').hide();
  var validationCheck = planCreateFieldValidation(function(err, value) {
    if (value && valided &&
      validedit && valideding &&
      validedVal && trialvalided) {
      submitPlanCreate();
    }
  });
});

var planCreateFieldValidation = function(callback) {
  var valid = false;
  var planCode = document.getElementById('createPlanName').value;
  valueValidation();
  customIntervalValidation();
  customIntervalValueValidation();
  trialValidation();
  planFieldValidation(planCode, function(err, value) {
    return callback(null, value);
  });
};
var planFieldValidation = function(planCode, callback) {
  if ($('#createPlanName').val() === '') {
    $('#createPlanName').next().show();validedit = false;
  } else {
    $('#createPlanName').next().hide();validedit = true;
    if (/[^a-zA-Z0-9_]/.test(planCode)) {
      $('#createPlanName').next().next().show();validedit = false;
    } else {
      valid = false;
      checkPlanValue(planCode, function(err, value) {
        return callback(null, value);
      });
    }
  }
  return validedit;
};
var valueValidation = function() {
  if ($('#valuePrice').val() === '') {
    $('#valuePrice').next().show();valided = false;
  } else {
    $('#value').next().hide();valided = true;
  }
  return valided;
};
var trialValidation = function() {
  if ($('#trialPeriod').val() !== '') {
    if ($('#trialPeriod').val() > 730) {
      $('#trialPeriod').next().show();trialvalided = false;
    } else {
      $('#trialPeriod').next().hide();trialvalided = true;
    }
  } else {
    trialvalided = true;
  }
  return trialvalided;
};
var customIntervalValidation = function() {
  var interval = $('#interval').val();
  if (interval === 'custom') {
    if ($('#intervalVal').val() === '') {
      $('#intervalVal').next().show();valideding = false;
    } else {
      $('#intervalVal').next().hide();valideding = true;
    }
  } else {
    valideding = true;
  }
  return valideding;
};
var customIntervalValueValidation = function() {
  var interval = $('#interval').val();
  if (interval === 'custom') {
    customIntervalValueDayValidation();
    customIntervalValueWeekValidation();
    customIntervalValueMonthValidation();
  } else {
    validedVal = true;
  }
  return validedVal;
};
var customIntervalValueDayValidation = function() {
  if ($('#intervalDuration').val() === 'day') {
    if ($('#intervalVal').val() > 365) {
      $('#intervalVal').next().next().next().next().show();validedVal = false;
    } else {
      $('#intervalVal').next().next().next().next().hide();validedVal = true;
    }
  }
};
var customIntervalValueWeekValidation = function() {
  if ($('#intervalDuration').val() === 'week') {
    if ($('#intervalVal').val() > 52) {
      $('#intervalVal').next().next().next().show();validedVal = false;
    } else {
      $('#intervalVal').next().next().next().hide();validedVal = true;
    }
  }
};
var customIntervalValueMonthValidation = function() {
  if ($('#intervalDuration').val() === 'month') {
    if ($('#intervalVal').val() > 12) {
      $('#intervalVal').next().next().show();validedVal = false;
    } else {
      $('#intervalVal').next().next().hide();validedVal = true;
    }
  }
};
var checkPlanValue = function(planCode, callback) {
  $.ajax({
    url: '/qsCreate/getPlanDetailsById/' + planCode,
    type: 'get',
  })
  .done(function(data) {
    if (data.id === planCode) {
      $('#createPlanName').next().next().hide();
      $('#createPlanName').next().next().next().show();valid = false;
    }else {
      $('#createPlanName').next().next().hide();
      $('#createPlanName').next().next().next().hide();valid = true;
    }
    return callback(null, valid);
  })
  .fail(function(data) {
    $('#createPlanName').next().next().hide();
    $('#createPlanName').next().next().next().hide();valid = true;
    return callback(null, valid);
  });
};

function submitPlanCreate() {
  $.ajax({
    url: '/qsCreate/submitPlanCreate',
    type: 'post',
    data: $('#plan-create-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 400) {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.header);
      $('#createPlanPopup').modal('hide');
      $('#mappingPopup').modal('show');
    } else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createPlan');
      }, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
      window.location.replace('/qsCreate/createPlan');
    }, 2000);
  });
}

function showCustomBox() {
  var interval = $('#interval').val();
  if (interval === 'custom') {
    $('#customInterval').removeClass('hide');
  } else {
    $('#customInterval').addClass('hide');
  }
}

function showCustomMsg() {
  $('#intervalVal').next().next().next().next().hide();
  $('#intervalVal').next().next().next().hide();
  $('#intervalVal').next().next().hide();
}
function ValidateFieldPlan(txt) {
  var TCode = document.getElementById('createPlanName').value;
  if (/[^a-zA-Z0-9_]/.test(TCode)) {
    $('#createPlanName').next().next().show();
    return false;
  } else {
    $('#createPlanName').next().next().hide();
  }
  $('#createPlanName').next().hide();
  return true;
}
$('#valuePrice').keypress(function(event) {
  if (event.which === 8 || event.which === 0) {
    return true;
  }
  if (event.which < 46 || event.which > 59) {
    return false;
  }
  if (event.which === 46 && $(this).val().indexOf('.') !== -1) {
    return false;
  }
  var number = $('#valuePrice').val().split('.');
  if (number.length === 2 && number[1].length > 1) {
    return false;
  }
});
$('#intervalVal').keypress(function(event) {
  if (event.which === 8 || event.which === 0) {
    return true;
  }
  if (event.which < 46 || event.which > 59) {
    return false;
  }
  if (event.which === 46) {
    return false;
  }
});
$('#trialPeriod').keypress(function(event) {
  if (event.which === 8 || event.which === 0) {
    return true;
  }
  if (event.which < 46 || event.which > 59) {
    return false;
  }
  if (event.which === 46) {
    return false;
  }
});
var $btns = $('#addStripePlanReset');
$btns.on('click', function(e) {
  $('#createPlanPopup').find('input,textarea,select,text').val('').end();
  $('#offMode').val('$');
  $('#interval').val('day');
  $('#intervalDuration').val('day');
  $('#customInterval').addClass('hide');
  $('.error').hide().end();
});
$('#createPlanPopup').on('hidden.bs.modal', function() {
  $('#createPlanPopup').find('input,textarea,select,text').val('').end();
  $('#offMode').val('$');
  $('#interval').val('day');
  $('#intervalDuration').val('day');
  $('#customInterval').addClass('hide');
  $('.error').hide().end();
});
function showDescMsg() {
  $('#description').next().show();
}

// Edit Plan
function showDescMsgEdit() {
  $('#descriptionEdit').next().show();
}
$('.planEdit').click(function(event) {
  var planId = $(this).attr('id');
  getPlanDetailsById(planId);
});
function getPlanDetailsById(planId) {
  $.ajax({
    url: '/qsCreate/getPlanDetailsById/' + planId + '/',
    type: 'get',
  })
  .done(function(data) {
    (function() {
      var desc = 'statement_descriptor';
      var PlanNameInput = '<input readonly="readonly"' +
      'type="text" name="planName" id="planName"' +
      'class="form-control" value="' + data.id + '"/>' +
      '<input type="hidden" value="' + data.id + '"' +
      'name="planEditId" id="planEditId">';
      var description = '';
      if (data[desc] === null) {
        description = '';
      } else {
        description = data[desc];
      }
      var planDescInput = '<input placeholder="Enter Description"' +
      'name="descriptionEdit" id="descriptionEdit" size="22"' +
      'maxlength="22" onkeypress="showDescMsgEdit()" class="form-control"' +
      'value="' + description + '" onkeyup="removeAlert(this)">' +
      '<label style="display:none" class="error alert alert-danger' +
      ' marginLabel">The statement descriptor is limited to 22 characters' +
      '</label>' +
      '<label style="display:none" class="error alert' +
      ' alert-danger marginLabel">Please enter Description</label>';
      var productDescText = '';
      $('#planUpdatePopup .modal-body #PlanNameLabel')
        .html('Name');
      $('#planUpdatePopup .modal-body #planDesclabel')
        .html('Description');
      $('#planUpdatePopup .modal-body #PlanNameInput')
        .html(PlanNameInput);
      $('#planUpdatePopup .modal-body #planDescInput')
        .html(planDescInput);
    })();
    $('#planUpdatePopup').modal('show');
  })
  .fail(function(data) {
    $('#mappingPopup .setHeaderMessage').text('Error');
    $('#mappingPopup .messageGeneric').text(data.message);
    $('#mappingPopup').modal('show');
  });
}

var $btns = $('#editStripePlanReset');
$btns.on('click', function(e) {
  $('#descriptionEdit').val('').end();
  $('.error').hide().end();
});
var $btns = $('#editStripePlanUpdate');
$btns.on('click', function(e) {
  if ($('#descriptionEdit').val() === '') {
    $('#descriptionEdit').next().next().show();valided = false;
  } else {
    $('#descriptionEdit').next().next().hide();valided = true;
  }
  if (valided) {
    updatePlanCreate();
  }
});
function updatePlanCreate() {
  $.ajax({
    url: '/qsCreate/updatePlanCreate',
    type: 'post',
    data: $('#plan-update-form').serialize(),
  })
  .done(function(data) {
    if (data.status === 400) {
      $('#mappingPopup .setHeaderMessage').text('Error');
      $('#mappingPopup .messageGeneric').text(data.header);
      $('#skuUpdatePopup').modal('hide');
      $('#mappingPopup').modal('show');
    }else {
      setTimeout(function() {
        window.location.replace('/qsCreate/createPlan');
      }, 2000);
    }
  })
  .fail(function(data) {
    setTimeout(function() {
        window.location.replace('/qsCreate/createPlan');
      }, 2000);
  });
}