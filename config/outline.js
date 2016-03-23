// config/outline.js

// copy file to custom.js and fill out with new values
// DO NOT leave default values, especially for JWT secrets

export default {
  api: {
    port: 8080, // port to listen to
    address: '127.0.0.1', // IP address
  },
  database: {
    url: 'mongodb://localhost/mydatabase', // mongo db url
  },
  jwt: {
    authorization: {
      secret: 'abcdefghijklmnopqrstuvwxyz', // secret for authorization
      options: {
        expiresIn: 86400, // expressed in seconds -- one day
      },
    },
    forgotPassword: {
      // secret for forgot password, should be different than authorization
      secret: 'zyxwvutsrqponmlkjihgfedcba',
      options: {
        expiresIn: 3600, // expressed in seconds -- one hour
      },
    },
  },
  mail_api: {
    url: 'https://api.mailserver.com', // url to transaction mail api
    key: '1234567890', // key provided by mail api
    from: 'support@mydomain.com', // from address supplied to emails
  },
  facebook: {
    clientID: '1234567890', // Facebook client ID for Facebook logins
    secret: 'abcdefghijklmnopqrstuvwxyz', // secret provided by Facebook
  },
  google: {
    clientID: '1234567890', // Google client ID for Google logins
    secret: 'abcdefghijklmnopqrstuvwxyz',
  },
};
