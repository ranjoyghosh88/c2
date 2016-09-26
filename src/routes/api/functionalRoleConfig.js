exports.setPremiumGroup = function(environment) {
  var premGroupArray = {};
  if (environment === 'development') {
    premiumGroupArray = {
  group1: 'https://api.stormpath.com/' +
  'v1/groups/7jbRB1eLDIWljHYknPKmC1',
  group2: 'https://api.stormpath.com/' +
  'v1/groups/KmDMUgexqWjyCTOTOr3Xt',
  group3: 'https://api.stormpath.com/' +
  'v1/groups/n3eC87CDWmPvDu85gpSsD',
  group4: 'https://api.stormpath.com/v1/' +
  'groups/7KZSkqUpvzKjwzw3FmTJBB',
  group5: 'https://api.stormpath.com/' +
  'v1/groups/1BEHBfuc93ZKvT3YHPnmor',
  group6: 'https://api.stormpath.com/' +
  'v1/groups/70V7m5xd00LLFLzxGCt77T',
};
    return premiumGroupArray;
  }
  if (environment === 'qa') {
    premiumGroupArray = {
  group1: 'https://api.stormpath.com/' +
  'v1/groups/lBLH80Ir1H5cY1WpRcFTI',
  group2: 'https://api.stormpath.com/' +
  'v1/groups/19G76DAL62UQcrlbu94V1A',
  group3: 'https://api.stormpath.com/' +
  'v1/groups/1QqfKui8vQIZ2w6yXALD7s',
  group4: 'https://api.stormpath.com/v1/' +
  'groups/1iBO9YgNX3ABsIlh5E9Z0m',
  group5: 'https://api.stormpath.com/' +
  'v1/groups/1yTGAnuJTbtArLOrAES8Bg',
  group6: 'https://api.stormpath.com/' +
  'v1/groups/3wA9n7PowAtWdhh3Xu0D5b',
};
    return premiumGroupArray;
  }
  if (environment === 'production') {
    console.log('going into production' +
      ' functional role');
    premiumGroupArray = {
  group1: 'https://api.stormpath.com/' +
  'v1/groups/55JejRrJ7MWgJYx9hZ0Zim',
  group2: 'https://api.stormpath.com/' +
  'v1/groups/5REbsbDwBVfO2Nm9zF12QO',
  group3: 'https://api.stormpath.com/' +
  'v1/groups/5kGd5S2gQTv2tMwjpoX044',
  group4: 'https://api.stormpath.com/v1/' +
  'groups/63vq49gLHKwKMF1BqTllo4',
  group5: 'https://api.stormpath.com/' +
  'v1/groups/6MIiRfT30vEVGhU79x3ZDA',
  group6: 'https://api.stormpath.com/' +
  'v1/groups/4oYxye13gLN8MSntmO0ML1',
};
    return premiumGroupArray;
  }
};