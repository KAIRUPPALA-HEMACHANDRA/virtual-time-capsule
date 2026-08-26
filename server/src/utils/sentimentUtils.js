const Sentiment = require('sentiment');

const analyzer = new Sentiment();

/**
 * Sentiment Analyzer
 * 
 * Analyzes text and returns a score + human-readable label.
 * 
 * HOW IT WORKS:
 * The 'sentiment' library has a dictionary of ~2000 words
 * with pre-assigned positive/negative scores.
 * "happy" = +3, "terrible" = -3, "good" = +2, etc.
 * It sums up all the word scores and divides by word count
 * to get a comparative score.
 * 
 * SCORE RANGES:
 *   < -0.5  → Sad / Negative
 *   -0.5 to -0.1 → Melancholic
 *   -0.1 to 0.1  → Neutral / Reflective
 *   0.1 to 0.5   → Hopeful / Warm
 *   > 0.5  → Happy / Positive
 */

function analyzeSentiment(text) {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: 'neutral', emoji: '😐' };
  }

  const result = analyzer.analyze(text);
  
  // Comparative score normalizes by word count
  const score = parseFloat(result.comparative.toFixed(4));

  let label, emoji;

  if (score < -0.5) {
    label = 'sad';
    emoji = '😢';
  } else if (score < -0.1) {
    label = 'melancholic';
    emoji = '🥀';
  } else if (score <= 0.1) {
    label = 'neutral';
    emoji = '😐';
  } else if (score <= 0.5) {
    label = 'hopeful';
    emoji = '🌤️';
  } else {
    label = 'happy';
    emoji = '😊';
  }

  return { score, label, emoji };
}

module.exports = { analyzeSentiment };
