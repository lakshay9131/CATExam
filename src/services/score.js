const Attempt = require('../models/attempt');
const Question = require('../models/questions');

async function calculateExamScores(examId) {
  try {
    // 1. Fetch all attempts for the given examId
    const attempts = await Attempt.find({ examId })
      .populate('paper.questionId') // Populate question details if needed
      .exec();

    if (!attempts.length) {
      throw new Error('No attempts found for this exam.');
    }

    // 2. Calculate scores for each attempt
    const analyzedAttempts = await Promise.all(
      attempts.map(async (attempt) => {
        let correctAnswers = 0;
        const sectionScores = {}; // Dynamic section breakdown (e.g., VARC, QA)

        // Loop through each question in the attempt
        for (const item of attempt.paper) {
      //     const question = await Question.findById(item.questionId);
      //     if (!question) continue; // Skip if question not found
          
            correctAnswers+=item.score;
            // Increment section score (e.g., "VARC", "QA")
            const section = item.subject; // Assume subject maps to section
            sectionScores[section] = (sectionScores[section] || 0) + item.score;
          }
        

        // 3. Calculate percentile (placeholder logic - replace with actual percentile calculation)
        const totalQuestions = attempt.paper.length;
        const rawScore = correctAnswers; // Or use weighted scoring if needed
        const percentile =  -1; // Simplified example

        // 4. Update the attempt with calculated scores
        attempt.scorePercentile = {
          rawScore,
          percentile: parseFloat(percentile.toFixed(2)),
          sectionBreakdown: sectionScores,
        };
        console.log("Attemp saving",attempt.scorePercentile)

        await attempt.save(); // Save the updated attempt
        return attempt;
      })
    );

    return {
      success: true,
      count: analyzedAttempts.length,
      attempts: analyzedAttempts,
    };
  } catch (error) {
    console.error('Error calculating scores:', error.message);
    return { success: false, error: error.message };
  }
}


async function calculateRanksAndPercentiles(examId) {
  try {
    // 1. Fetch all attempts sorted by rawScore (descending)
    const attempts = await Attempt.find({ examId })
      .sort({ 'scorePercentile.rawScore': -1 })
      .exec();

    if (attempts.length === 0) {
      throw new Error('No attempts found for this exam.');
    }

    // 2. Calculate ranks with tie handling
    const totalAttempts = attempts.length;
    const updatedAttempts = [];
    let currentRank = 1;

    for (let i = 0; i < attempts.length; i++) {
      // Handle ties - same score gets same rank
      if (i > 0 && attempts[i].scorePercentile.rawScore !== 
          attempts[i-1].scorePercentile.rawScore) {
        currentRank = i + 1;
      }

      // Calculate percentile (100th percentile is top score)
      const percentile = ((totalAttempts - currentRank) / totalAttempts) * 100;

      // Update the attempt
      attempts[i].scorePercentile.rank = currentRank;
      attempts[i].scorePercentile.percentile = parseFloat(percentile.toFixed(2));

      console.log("Ranked",attempts[i]);
      
      updatedAttempts.push(attempts[i].save());
    }

    // 3. Save all updated attempts
    await Promise.all(updatedAttempts);
    // todo resultsPublished parameter update  in exam table 

    return {
      success: true,
      message: `Processed ${totalAttempts} attempts with tie handling.`,
      topRank: attempts[0].scorePercentile,
      tiedRanks: attempts.filter(a => 
        a.scorePercentile.rank !== 1 && 
        a.scorePercentile.rawScore === attempts[0].scorePercentile.rawScore
      ).length
    };

  } catch (error) {
    console.error('Error:', error.message);
    return { 
      success: false,
      error: error.message
    };
  }
}


async function calculateAllRanks(examId) {
  try {
    // 1. Fetch all attempts
    const attempts = await Attempt.find({ examId }).lean();
    if (attempts.length === 0) throw new Error('No attempts found');

    // 2. Identify all sections dynamically
    const sections = new Set();
    attempts.forEach(attempt => {
      if (attempt.scorePercentile?.sectionBreakdown) {
        Object.keys(attempt.scorePercentile.sectionBreakdown).forEach(section => {
          sections.add(section);
        });
      }
    });

    // 3. Calculate overall ranks
    const overallSorted = [...attempts].sort((a, b) => 
      b.scorePercentile.rawScore - a.scorePercentile.rawScore
    );
    assignRanks(overallSorted, 'overall');

    // 4. Calculate section ranks
    for (const section of sections) {
      const sectionSorted = [...attempts]
        .filter(attempt => 
          attempt.scorePercentile?.sectionBreakdown?.[section] !== undefined
        )
        .sort((a, b) => 
          b.scorePercentile.sectionBreakdown[section] - 
          a.scorePercentile.sectionBreakdown[section]
        );
      
      assignRanks(sectionSorted, section);
      

    }

    // console.log("Section",sectionSorted);
      for (let i in attempts)
      {
        console.log("sections",attempts[i].scorePercentile)

      }

    // 5. Bulk update all attempts
    await Attempt.bulkWrite(
      attempts.map(attempt => ({
        updateOne: {
          filter: { _id: attempt._id },
          update: { $set: { scorePercentile: attempt.scorePercentile } }
        }
      }))
    );

    return {
      success: true,
      totalAttempts: attempts.length,
      sections: Array.from(sections),
      overallTop: overallSorted[0].scorePercentile
    };

  } catch (error) {
    console.error('Rank calculation failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to assign ranks (pure JavaScript)
function assignRanks(sortedItems, rankType) {
  let currentRank = 1;
  for (let i = 0; i < sortedItems.length; i++) {
    // Skip if section score doesn't exist (for section ranks)
    if (rankType !== 'overall' && 
        !sortedItems[i].scorePercentile?.sectionBreakdown?.[rankType]) {
      continue;
    }

    // Handle ties (compare with previous item)
    if (i > 0) {
      const currentScore = rankType === 'overall' 
        ? sortedItems[i].scorePercentile.rawScore 
        : sortedItems[i].scorePercentile.sectionBreakdown[rankType];
      
      const prevScore = rankType === 'overall' 
        ? sortedItems[i-1].scorePercentile.rawScore 
        : sortedItems[i-1].scorePercentile.sectionBreakdown[rankType];
      
      if (currentScore !== prevScore) {
        currentRank = i + 1;
      }
    }

    // Initialize ranks object if not exists
    if (!sortedItems[i].scorePercentile.ranks) {
      sortedItems[i].scorePercentile.ranks = {};
    }

    // Calculate percentile
    const percentile = ((sortedItems.length - currentRank) / sortedItems.length) * 100;

    // Store rank
    if (rankType === 'overall') {
      sortedItems[i].scorePercentile.rank = currentRank;
      sortedItems[i].scorePercentile.percentile = parseFloat(percentile.toFixed(2));
    } else {
      sortedItems[i].scorePercentile.ranks[rankType] = {
        rank: currentRank,
        percentile: parseFloat(percentile.toFixed(2))
      };
    }
  }
}


async function leaderboard(examId){

  const attempts = await Attempt.find({ examId })
  .sort({ 'scorePercentile.rawScore': -1 })
  .exec();

  if (attempts.length === 0) {
    throw new Error('No attempts found for this exam.');
  }

  return attempts;

}
module.exports = {calculateExamScores ,calculateRanksAndPercentiles, leaderboard,calculateAllRanks};