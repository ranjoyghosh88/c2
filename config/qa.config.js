var config = {
  mongo: {
    connection: 'mongodb://',
    'csquireAdmin:csquireAdmin123',
    '@ds043262.mongolab.com:43262/',
    'csquire_qa',
    options: {
      db: {
        safe: true
      }
    }
  },
  seedDB: false,
  knowldgebase: {
    baseUrl: "http://testapp.answerbase.com/api/",
    apiKey: "d546d40614f44203a5b5cb02f48626ee"
  },
  sessionTimeoutSeconds: 1200,
  googleTagId: 'GTM-WSXV89',
};

module.exports = config;
