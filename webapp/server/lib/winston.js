const winston = require('winston');

// Imports the Google Cloud client library for Winston
const {LoggingWinston} = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston({
    projectId: 'auto-ml-admin',
    keyFilename: '../../../terraform.json',
});

var options = {
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger =  winston.createLogger({
  transports: [
    new winston.transports.Console(options.console),
    // Add Stackdriver Logging
    loggingWinston,
  ],
  exitOnError: false
});

module.exports.logger = logger;