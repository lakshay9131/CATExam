const express = require('express');
const { leaderboard } = require('../services/score');


const router = express.Router();



router.post('/submitanswers', async (req, res) => {
      // considering   jwt  and joi  validation 
      const userName = "user1"
      const user= "1291"
      

      // LOGIC TO SCORE USING CACHE AND SEND WHAT IS SAVED IN RESPONSE 

});


router.post('/leaderboard', async (req, res) => {
      // based on exam id , if attempt is expired and result is published, else
      const published =true; // use resultsPublished parameter to see if published
      const {examId} = req.body
      if(published){
            let result=await leaderboard(examId)
            res.send(result );

      }
      else{
            res.send({message: 'Will be updated in some time'})
      }

    
})



module.exports = router;