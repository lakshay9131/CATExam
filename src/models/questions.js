const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  choices: {
    type: {
      1: { type: String, required: true },
      2: { type: String, required: true },
      3: { type: String, required: true },
      4: { type: String, required: true }
    },
    required: true
  },
  correctChoice: { type: Number, required: true, min: 1, max: 4 },
  subject: { type: String, required: true },
  questionScore: { type: Number, default: 1 },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);