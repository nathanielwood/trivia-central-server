// api/controllers/question.js

import _ from 'lodash';
import Question from '../models/Question';
import User from '../models/User';
import { validateQuestionForm } from '../../trivia-central-lib/validations';

// cleans array of empty strings, null or undefined variables
const cleanArray = (array) => {
  if (array.constructor !== Array) return [array];
  return array.filter((v) => v === 0 || v);
};

const processQuestion = (values) => {
  const body = {
    text: values.text,
    correct: values.correct,
    incorrect: values.incorrect,
  };
  const errors = validateQuestionForm(body);
  if (!_.isEmpty(errors)) return { errors };
  body.correct = cleanArray(body.correct);
  body.incorrect = cleanArray(body.incorrect);
  return body;
};

export const getQuestions = (req, res) => {
  const limit = req.query.limit || 20;
  const page = req.query.page || 1;
  const query = {};
  const options = {
    select: {
      updatedAt: 1,
      creator: 1,
      text: 1,
    },
    sort: {},
    populate: {
      path: 'creator',
      select: 'username',
    },
    lean: true,
    page,
    limit,
  };
  if (req.query.answers) {
    options.select.correct = 1;
    options.select.incorrect = 1;
  }
  if (req.query.terms) {
    query.$text = { $search: req.query.terms };
    options.select.score = { $meta: 'textScore' };
    options.sort.score = { $meta: 'textScore' };
  }
  options.sort.updatedAt = -1;
  new Promise((resolve, reject) => {
    const username = req.query.username;
    if (username) {
      User.findOne({ username }).exec((err, user) => {
        if (err) reject(err);
        if (user) {
          query.creator = user._id;
        } else {
          reject(null);
        }
        resolve();
      });
    } else {
      resolve();
    }
  })
  .then(() => (
    Question.paginate(query, options, (err, questions) => {
      if (err) return res.send(err);
      return res.json(questions);
    })
  ), (err) => {
    if (err) return res.send(err);
    // username not found, send back blank paginate info
    return res.json({
      docs: [],
      total: 0,
      limit,
      page: 1,
      pages: 1,
    });
  });
};

export const getQuestionById = (req, res) => (
  Question.findById(req.params.question_id)
  .populate({
    path: 'creator',
    select: 'username',
  })
  .exec((err, question) => {
    if (err) return res.send(err);
    if (!question) return res.json({ message: 'Question not found' });
    return res.json(question);
  })
);


export const addQuestion = (req, res) => {
  const body = processQuestion(req.body);
  if (body.errors) return res.json({ errors: body.errors });
  const question = new Question(body);
  question.creator = req.user._id;
  return question.save((err, question2) => {
    if (err) return res.send(err);
    return res.json(question2);
  });
};

export const authorizeQuestionChange = (req, res, next) => {
  // user must be the creator of the question
  const user = req.user;
  Question.findById(req.params.question_id)
  .populate({
    path: 'creator',
    select: 'username',
  })
  .exec((err, question) => {
    if (err) return res.send(err);
    if (!question) {
      return res.json({
        success: false,
        message: 'Question not found',
      });
    }
    if (!question.creator._id.equals(user._id)) {
      return res.json({
        success: false,
        message: 'You may only edit your own questions',
      });
    }
    req.question = question; // eslint-disable-line
    return next();
  });
};

export const editQuestion = (req, res) => {
  const question = req.question;
  const body = processQuestion(req.body);
  if (body.errors) return res.json({ errors: body.errors });
  question.text = body.text;
  question.correct = body.correct;
  question.incorrect = body.incorrect;
  return question.save((err, question2) => {
    if (err) return res.send(err);
    return res.json(question2);
  });
};

export const removeQuestion = (req, res) => {
  const question = req.question;
  question.remove((err) => {
    if (err) res.send(err);
    res.json({
      success: true,
      message: 'Question removed',
    });
  });
};
