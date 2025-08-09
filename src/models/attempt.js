const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true 
  },
  paper: [{
    questionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question', 
      required: true 
    },
    selectedChoice: { 
      type: Number, 
      required: true,
      min: 1,
      max: 4 
    },
    score: { 
      type: Number, 
      required: true
    },
    subject: { 
      type: String, 
      required: true,
      default: ""
    }
  }],
  scorePercentile: {
    rawScore: { 
      type: Number, 
      default: 0 
    },
    percentile: { 
      type: Number 
    },
    sectionBreakdown:  {
      type: Object,
      default: {}  
    },
    rank :{ 
      type: Number 
    },
    ranks:  {
      type: Object,
      default: {}  
    },

  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Attempt', attemptSchema);