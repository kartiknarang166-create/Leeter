import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// GET /api/leaderboard/:collegeSlug
router.get('/:collegeSlug', async (req, res) => {
  try {
    const { collegeSlug } = req.params;
    const { sort = 'total_solved', limit = 50 } = req.query;

    // Get college
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id, name, slug, logo_url')
      .eq('slug', collegeSlug)
      .single();

    if (collegeError || !college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Get users in this college with LeetCode linked
    const { data: users } = await supabase
      .from('users')
      .select('id, username, display_name, leetcode_username, created_at')
      .eq('college_id', college.id)
      .not('leetcode_username', 'is', null);

    if (!users || users.length === 0) {
      return res.json({ college, leaderboard: [], total: 0 });
    }

    const userIds = users.map(u => u.id);

    // Get latest stats for all users
    const { data: allStats } = await supabase
      .from('leetcode_stats')
      .select('*')
      .in('user_id', userIds);

    // Build leaderboard entries — take latest stats per user
    const statsMap = {};
    if (allStats) {
      for (const stat of allStats) {
        if (!statsMap[stat.user_id] || new Date(stat.fetched_at) > new Date(statsMap[stat.user_id].fetched_at)) {
          statsMap[stat.user_id] = stat;
        }
      }
    }

    const leaderboard = users
      .map((user, index) => {
        const stats = statsMap[user.id] || null;
        return {
          user,
          stats,
          total_solved: stats?.total_solved || 0,
          easy_solved: stats?.easy_solved || 0,
          medium_solved: stats?.medium_solved || 0,
          hard_solved: stats?.hard_solved || 0,
          streak: stats?.streak || 0,
          ranking: stats?.ranking || null,
          acceptance_rate: stats?.acceptance_rate || 0,
          badges: stats?.badges || [],
          fetched_at: stats?.fetched_at || null,
        };
      })
      .sort((a, b) => {
        const sortFields = {
          total_solved: (x, y) => y.total_solved - x.total_solved,
          hard_solved: (x, y) => y.hard_solved - x.hard_solved,
          streak: (x, y) => y.streak - x.streak,
          ranking: (x, y) => (x.ranking || 999999) - (y.ranking || 999999),
          acceptance_rate: (x, y) => y.acceptance_rate - x.acceptance_rate,
        };
        return (sortFields[sort] || sortFields.total_solved)(a, b);
      })
      .slice(0, parseInt(limit))
      .map((entry, index) => ({ ...entry, college_rank: index + 1 }));

    // College-level stats
    const collegeStats = {
      total_members: leaderboard.length,
      avg_solved: Math.round(leaderboard.reduce((s, e) => s + e.total_solved, 0) / (leaderboard.length || 1)),
      top_solver: leaderboard[0]?.user?.username || null,
      total_hard: leaderboard.reduce((s, e) => s + e.hard_solved, 0),
      active_streaks: leaderboard.filter(e => e.streak > 0).length,
    };

    res.json({ college, leaderboard, collegeStats, total: leaderboard.length });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/:collegeSlug/compare?user1=id1&user2=id2
router.get('/:collegeSlug/compare', async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
      return res.status(400).json({ error: 'user1 and user2 query params required' });
    }

    const fetchUser = async (userId) => {
      const { data: user } = await supabase
        .from('users')
        .select('id, username, display_name, leetcode_username')
        .eq('id', userId)
        .single();
      const { data: stats } = await supabase
        .from('leetcode_stats')
        .select('*')
        .eq('user_id', userId)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();
      return { user, stats };
    };

    const [data1, data2] = await Promise.all([fetchUser(user1), fetchUser(user2)]);
    res.json({ user1: data1, user2: data2 });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
