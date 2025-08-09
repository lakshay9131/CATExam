const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String 
  },
  applicants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],
  expiryDate: { 
    type: Date, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  resultsPublished:{
    type: Boolean,
    default: false

  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Exam', examSchema);