const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/submitanswers');
const { connectDB } = require('./config/db');
const Question = require('./models/questions')
const Attempt = require('./models/attempt')
const {calculateExamScores, calculateRanksAndPercentiles, calculateAllRanks} =require('./services/score')

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/', authRoutes);

// Create a question
// const question = new Question({
//     description: "What is the capital of France?",
//     choices: {
//       1: "Berlin",
//       2: "Madrid",
//       3: "Paris",
//       4: "Rome"
//     },
//     correctChoice: 3,
//     subject: "Geography",
//     examId: "1234567890abcdef12345678"
//   });


function scoreRandom(i)
{
    i=i+Math.floor(Math.random() * 4) + 1 //adding 1 to 4
      if (i%2 ==  0)
      {
            return 5

      }
      else{
            return -1;
      }
}

function subjectRandom(i)
{
    var list= ["Verbal", "Quant", "Reasoning", "Any"]
    var index=Math.floor(Math.random() * 4) //adding 0 to 3
    return list[index];
    
}

// function 

function addSampleAttempt()
{
    const sampleAttempt = 
{
      studentId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), // Valid Student ID
      examId: new mongoose.Types.ObjectId("5f8d0d55b54764421b7156da"),    // Valid Exam ID
      paper: Array.from({ length: 50 }, (_, i) => ({  // 50 questions
        questionId: new mongoose.Types.ObjectId(),    // Random Question ID
        selectedChoice: Math.floor(Math.random() * 4) + 1,
        score: scoreRandom(i),
        subject: subjectRandom(i),
      })),
      scorePercentile: {
        rawScore: -1,                               // Total correct answers (scaled)
        percentile: 100,                            // Calculated percentile
        sectionBreakdown: {                          // Dynamic sections (e.g., CAT)
          VARC: 42,  // Verbal Ability (Max 50)
          DILR: 68,  // Logical Reasoning (Max 75)
          QA: 77     // Quantitative Aptitude (Max 80)
        }
      },
      // Auto-added by Mongoose:
      // createdAt: "2023-10-05T12:00:00.000Z",
      // updatedAt: "2023-10-05T12:00:00.000Z"
    };
 

    const attempt = new Attempt(sampleAttempt);
    
  (async ()=>
  {
     console.log("started")

     let r=await attempt.save();
     console.log(r, "here");
     
      console.log("started")
 })(); 

}


// calculateExamScores("5f8d0d55b54764421b7156da");
// calculateRanksAndPercentiles("5f8d0d55b54764421b7156da");
// calculateAllRanks("5f8d0d55b54764421b7156da");
connectDB();
// addSampleAttempt();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;