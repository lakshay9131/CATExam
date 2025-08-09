const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  details: {
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    age: { 
      type: Number 
    }
    // Add other fields as needed
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Student', studentSchema);