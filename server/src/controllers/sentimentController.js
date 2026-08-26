const { prisma } = require('../config/db');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/capsules/stats/sentiment
 * Returns sentiment data for all user's capsules (for the emotion timeline chart)
 */
const getSentimentTimeline = catchAsync(async (req, res) => {
  const capsules = await prisma.capsule.findMany({
    where: {
      creatorId: req.user.userId,
      sentimentScore: { not: null },
    },
    select: {
      id: true,
      title: true,
      sentimentScore: true,
      sentimentLabel: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Summary stats
  const total = capsules.length;
  const avgScore = total > 0
    ? parseFloat((capsules.reduce((sum, c) => sum + c.sentimentScore, 0) / total).toFixed(4))
    : 0;

  const moodCounts = capsules.reduce((acc, c) => {
    acc[c.sentimentLabel] = (acc[c.sentimentLabel] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    status: 'success',
    data: {
      timeline: capsules.map((c) => ({
        id: c.id,
        title: c.title,
        score: c.sentimentScore,
        mood: c.sentimentLabel,
        date: c.createdAt,
      })),
      summary: {
        totalAnalyzed: total,
        averageScore: avgScore,
        averageMood: avgScore < -0.5 ? 'sad' : avgScore < -0.1 ? 'melancholic' : avgScore <= 0.1 ? 'neutral' : avgScore <= 0.5 ? 'hopeful' : 'happy',
        moodCounts,
      },
    },
  });
});

module.exports = { getSentimentTimeline };
