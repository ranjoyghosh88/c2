var config = {    
    mongo: {
    	connection: 'mongodb://csquireAdmin:csquireAdmin123@ds031952.mongolab.com:31952/csquire_lab',
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
};

module.exports = config;
