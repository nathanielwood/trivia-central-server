// api/router.js

import express from 'express';
import passport from 'passport';
import {
  getQuestions,
  getQuestionById,
  addQuestion,
  editQuestion,
  removeQuestion,
  authorizeQuestionChange,
} from './controllers/question';
import {
  // getGames,
  getSingleGameQuestion,
  addGame,
  getGameById,
  getGameQuestionById,
  answerGameQuestion,
  nextGameQuestion,
} from './controllers/game';
import {
  addLocal,
  loginLocal,
  loginFacebook,
  loginGoogle,
  getUser,
  forgotPassword,
  resetPassword,
  registerUsername,
  requireUsername,
} from './controllers/user';
// import Question from '../data/models/Question';

// Routes for the API
const router = new express.Router();

const authorize = () => (
  passport.authenticate('authorization', { session: false })
);

// middleware to use for all requests
router.use((req, res, next) => {
  // TODO logging
  next();
});

router.route('/accounts/register')
.post(addLocal);

router.route('/accounts/login')
.post(loginLocal);

router.route('/accounts/register-username')
.post(authorize(), registerUsername);

router.route('/accounts/facebook')
.get(passport.authenticate('facebook-token', { session: false }), loginFacebook);

router.route('/accounts/google')
.post(passport.authenticate('google-id-token', { session: false }), loginGoogle);

router.route('/accounts/profile')
.get(authorize(), getUser);

router.route('/forgot-password')
.post(forgotPassword);

router.route('/forgot-password/validate')
.get(passport.authenticate('forgot-password', { session: false }), (req, res) => {
  res.json({
    success: true,
    message: 'Token validated',
  });
});

router.route('/reset-password')
.post(passport.authenticate('forgot-password', { session: false }), resetPassword);

router.route('/questions')
.get(getQuestions)
.post(authorize(), requireUsername, addQuestion);

router.route('/questions/:question_id')
.get(getQuestionById)
.post(authorize(), requireUsername, authorizeQuestionChange, editQuestion)
.delete(authorize(), requireUsername, authorizeQuestionChange, removeQuestion);

router.route('/games')
// disabled because it would give out game id's which people could
// then mess with
// .get(getGames)
// use get to get single random game question instead
.get(getSingleGameQuestion)
.post(addGame);

router.route('/games/:game_id')
.get(getGameById);

router.route('/games/:game_id/next')
.get(nextGameQuestion);

router.route('/games/:game_id/:question_id')
.get(getGameQuestionById)
.post(answerGameQuestion);

// test route to make sure everything is working
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Trivia API' });
});

export default router;
