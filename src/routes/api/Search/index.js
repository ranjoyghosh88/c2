var express = require('express');
var controller = require('./controller');
var router = express.Router();
router.get('/company', controller.searchCompany);
router.get('/product', controller.searchProduct);
router.get('/people', controller.searchProfile);
module.exports = router;