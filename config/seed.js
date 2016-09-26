'use strict';

var EnterpriseSoftware = require('../routes/api/EnterpriseSoftware/EnterpriseSoftware.model');
var enterpriseSoftware = require('./MasterCollection/enterprisesoftwares');

var BusinessProcessArea = require('../routes/api/BusinessProcessArea/bpa.model');
var business_process_area = require('./MasterCollection/business_process_area');

var JobTitle = require('../routes/api/JobTitle/jobTitle.model');
var jobtitle = require('./MasterCollection/jobtitle');

var ProfessionalLevel = require('../routes/api/ProfessionalLevel/professionalLevel.model');
var professionallevel = require('./MasterCollection/professionallevel');

var Revenue = require('../routes/api/Revenue/revenue.model');
var annualRevenue = require('./MasterCollection/annualrevenue');

var SoftwareDev = require('../routes/api/SoftwareDev/softwareDev.model');
var developmentsoftware = require('./MasterCollection/developmentsoftware');

var VendorServicedata = require('../routes/api/VendorService/vendorService.model');
var vendorservice = require('./MasterCollection/vendorservice');

var FunctionalRoledata = require('../routes/api/FunctionalRoles/functionalRole.model');
var functionalrole = require('./MasterCollection/functionalrole');

var RegistrationStepdata = require('../routes/api/RegistrationSteps/registrationSteps.model');
var registrationstep = require('./MasterCollection/registration_step');

var headCountdata = require('../routes/api/HeadCount/headCount.model');
var headCountValue = require('./MasterCollection/headcount');


headCountdata.find({}).remove(function() {
  headCountdata.create(headCountValue,{capped: true},function(){
    console.log("headCountdata data has been populated")
  });
});

RegistrationStepdata.find({}).remove(function() {
  RegistrationStepdata.create(registrationstep,{capped: true},function(){
    console.log("RegistrationStepdata data has been populated")
  });
});


FunctionalRoledata.find({}).remove(function() {
  FunctionalRoledata.create(functionalrole,{capped: true},function(){
    console.log("Functionalrole data has been populated")
  });
});

VendorServicedata.find({}).remove(function() {
  VendorServicedata.create(vendorservice,function(){
    console.log("Vendor Service data has been populated")
  });
});

SoftwareDev.find({}).remove(function() {
  SoftwareDev.create(developmentsoftware,function(){
    console.log("SoftwareDev data has been populated")
  });
});


Revenue.find({}).remove(function() {
  Revenue.create(annualRevenue,function(){
    console.log("Revenue data has been populated")
  });
});

EnterpriseSoftware.find({}).remove(function() {
  EnterpriseSoftware.create(enterpriseSoftware,function(){
    console.log("EnterpriseSoftware data has been populated")
  });
});


BusinessProcessArea.find({}).remove(function() {
  BusinessProcessArea.create(business_process_area,function(){
    console.log("BusinessProcessArea data has been populated")
  });
});


JobTitle.find({}).remove(function() {
  JobTitle.create(jobtitle,function(){
    console.log("JobTitle data has been populated")
  });
});


ProfessionalLevel.find({}).remove(function() {
  ProfessionalLevel.create(professionallevel,{capped: true},function(){
    console.log("ProfessionalLevel data has been populated")
  });
});

