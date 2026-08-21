import fetch from 'node-fetch';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const USER_STATS_QUERY = `
query getUserStats($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
      reputation
      starRating
    }
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    badges {
      id
      displayName
      icon
    }
    userCalendar(year: 0) {
      streak
      totalActiveDays
    }
  }
}
`;

const DAILY_CHALLENGE_QUERY = `
query getDailyChallenge {
  activeDailyCodingChallengeQuestion {
    date
    link
    question {
      title
      titleSlug
      difficulty
      frontendQuestionId: questionFrontendId
    }
  }
}
`;

export async function fetchLeetCodeStats(username) {
  try {
    const response = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        query: USER_STATS_QUERY,
        variables: { username },
      }),
    });

    if (!response.ok) {
      console.error(`LeetCode API responded with ${response.status}`);
      return null;
    }

    const data = await response.json();
    const user = data?.data?.matchedUser;

    if (!user) return null; // User not found

    const acStats = user.submitStats?.acSubmissionNum || [];
    const easy = acStats.find(s => s.difficulty === 'Easy')?.count || 0;
    const medium = acStats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard = acStats.find(s => s.difficulty === 'Hard')?.count || 0;
    const total = acStats.find(s => s.difficulty === 'All')?.count || (easy + medium + hard);

    const totalSubmissions = acStats.find(s => s.difficulty === 'All')?.submissions || 1;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((total / totalSubmissions) * 100 * 100) / 100 : 0;

    return {
      total_solved: total,
      easy_solved: easy,
      medium_solved: medium,
      hard_solved: hard,
      ranking: user.profile?.ranking || null,
      reputation: user.profile?.reputation || 0,
      acceptance_rate: acceptanceRate,
      streak: user.userCalendar?.streak || 0,
      total_active_days: user.userCalendar?.totalActiveDays || 0,
      badges: (user.badges || []).map(b => ({
        id: b.id,
        name: b.displayName,
        icon: b.icon,
      })),
    };
  } catch (err) {
    console.error(`Error fetching LeetCode stats for ${username}:`, err.message);
    return null;
  }
}

export async function fetchDailyChallenge() {
  try {
    const response = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ query: DAILY_CHALLENGE_QUERY }),
    });

    const data = await response.json();
    const challenge = data?.data?.activeDailyCodingChallengeQuestion;
    return challenge || null;
  } catch (err) {
    console.error('Error fetching daily challenge:', err.message);
    return null;
  }
}
