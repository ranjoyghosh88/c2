var winston = require('winston');
var winstonMongoDB = require('winston-mongodb');
var logDbConnection = process.env.CSQUIRE_LOG_DB;
if (logDbConnection && logDbConnection !== '') {
  // This code is expected to run ONLY in PROD/QA
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.MongoDB, {
    level: 'info', // Do we need debug??
    db: logDbConnection,
    storeHost: true,
  });
} else {
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    level: 'debug',
    colorize: true,
  });
}
module.exports = winston;