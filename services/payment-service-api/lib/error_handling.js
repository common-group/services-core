'use strict';

const Sentry = require('@sentry/node');

if(process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
};

const handleError = (exception, context = {}) => {
  if(process.env.SENTRY_DSN) {
      Sentry.captureException(exception, { extra: { ...Object(context) } });
  };
};

module.exports = {
  handleError
};
