const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const gcpMetadata = require('gcp-metadata');

const loggingWinston = new LoggingWinston({
  //projectId: 'automl-labeling-project-8d0a',
  //keyFilename: '../../../terraform.json'
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.json(),
    }),
  ]
});

const data = gcpMetadata.instance()
  .then(success => {
    console.log("GCP Metadata Server Available. Stackdriver logging enabled")
    logger.add(loggingWinston)
  })
  .catch(serverUnavailable => {
      console.log(
        "GCP Metadata Server Unavailable." +
        " Stackdriver logging is disabled as it does not appear you are" +
        " running the tool inside GCP")
      })

module.exports = logger;