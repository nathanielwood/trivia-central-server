// api/models/Game.js

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const GameQuestionSchema = new Schema({
  text: {
    type: String,
  },
  answers: {
    type: [String],
  },
  correct: {
    type: Number,
    select: false,
  },
  answered: {
    type: Boolean,
  },
  answeredCorrect: {
    type: Boolean,
  },
  selected: {
    type: Number,
  },
});

const GameSchema = new Schema({
  points: {
    type: Number,
  },
  questionCursor: {
    type: Number,
  },
  finished: {
    type: Boolean,
  },
  questions: [GameQuestionSchema],
}, { timestamps: true });

const Game = mongoose.model('Game', GameSchema);

export default Game;
