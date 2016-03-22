// seed.js
/* eslint no-console:0, dot-notation:0 */

import mongoose from 'mongoose';
import fetch from 'isomorphic-fetch';
import { XmlEntities } from 'html-entities';
import config from './config/custom';
import Question from './src/models/Question';
import User from './src/models/User';
import Game from './src/models/Game';

const NUM_QUESTIONS = 10000;

// The data fetched is all escaped, so it is passed through the following
// decode function
const entities = new XmlEntities();
const decode = entities.decode;

mongoose.connect(config.database.url);

let admin;

console.log('Emptying Games collection...');
Game.remove({}).exec((err) => {
  if (err) throw new Error(err);
  console.log('Games collection emptied');
})
.then(() => {
  console.log('Emptying User collection...');
  return User.remove({}).exec((err) => {
    if (err) throw new Error(err);
    console.log('User collection emptied');
  });
})
.then(() => {
  console.log('Creating admin user');
  admin = new User({ username: '[admin]' });
  return admin.save((err) => {
    if (err) throw new Error(err);
    console.log('[admin] user created');
  });
})
.then(() => {
  console.log('Emptying Question collection...');
  return Question.remove({}).exec((err) => {
    if (err) throw new Error(err);
    console.log('Question collection emptied');
  });
})
.then(() => {
  console.log('Fetching questions...');
  return fetch(`http://www.quizbang.co.uk/cgi-bin/fetch.pl?command=questions&num=${NUM_QUESTIONS}&format=json`);
})
.then(response => response.json())
.then(json => {
  if (!json.response) throw new Error('Problem retrieving data');
  console.log(json.response.text);
  if (json.response.status !== '0') throw new Error('Incorrect status');
  return json.questions.map((question) => ({
    text: decode(question.text),
    correct: [decode(question.answers.shift().text)],
    incorrect: question.answers.map(answer => decode(answer.text)),
    creator: admin._id,
  }));
})
.then(questions => {
  console.log('Adding questions to database...');
  return Question.create(questions, (err) => {
    if (err) throw new Error(err);
    console.log(`Seed data created, ${questions.length} questions added to database`);
  });
})
.then(() => {
  console.log('fin');
  process.exit();
});
