// api/index.js

import express from 'express';
import { urlencoded, json } from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import router from './router';
import config from '../config';
import strategies from './strategies';

const API_PORT = config.api.port;
mongoose.connect(process.env.MONGO_URI || config.database.url);
strategies(passport);

const api = express();
api.use(urlencoded({ extended: true }));
api.use(json());
api.use(passport.initialize());

// enable CORS
api.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// Register the Routes
api.use('/api', router);


// Start API server
api.listen(API_PORT, () => {
  console.log(`API Server is now listening on port ${API_PORT}`); // eslint-disable-line
});
