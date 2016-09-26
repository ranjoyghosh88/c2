var config = {
  mongo: {
    connection: 'mongodb://localhost/csquire_lab',
    options: {
      db: {
        safe: true
      }
    }
  },
  redis: {
    host: 'localhost',
	port:'6379',
	pass:'Admin1234'
  },
  seedDB: true,
  csquireApi: {
    url: 'http://localhost:3002/',
    clientId: "4I899RU965C2NL9LG38HTTH0N",
    clientSecret: "nOWzc7c0TL3DairnxdF+xbFHt0954HvLtDnOufJjGfg"
  },
  knowldgebase: {
    baseUrl: "https://kb.csquire.com/api/",
    apiKey: "d1e1270e2da54f0d8fe1d038a64ddbc8"
  },
  sessionTimeoutSeconds: 1200,
  googleTagId: 'GTM-WSXV89',
  tutorializePubId:'56a148d4c132a68d5701286f'
};

module.exports = config;
