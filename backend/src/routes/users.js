import express from 'express';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { fetchLeetCodeStats } from '../services/leetcode.js';

const router = express.Router();

// POST /api/users/leetcode-username — Set LeetCode username (auth required, one per user)
router.post('/leetcode-username', authenticate, async (req, res) => {
  try {
    const { leetcode_username } = req.body;
    const userId = req.user.userId;

    if (!leetcode_username || leetcode_username.trim() === '') {
      return res.status(400).json({ error: 'leetcode_username is required' });
    }
    const cleanUsername = leetcode_username.trim();

    // Check if user already has a LeetCode username
    const { data: currentUser } = await supabase
      .from('users')
      .select('leetcode_username')
      .eq('id', userId)
      .single();

    if (currentUser?.leetcode_username) {
      return res.status(409).json({
        error: 'You have already linked a LeetCode account. Only one LeetCode username is allowed per account.',
        current: currentUser.leetcode_username,
      });
    }

    // Check if this LeetCode username is taken by another user
    const { data: taken } = await supabase
      .from('users')
      .select('id')
      .eq('leetcode_username', cleanUsername)
      .single();

    if (taken) {
      return res.status(409).json({ error: 'This LeetCode username is already linked to another account' });
    }

    // Validate LeetCode username exists
    const stats = await fetchLeetCodeStats(cleanUsername);
    if (!stats) {
      return res.status(404).json({ error: `LeetCode user "${cleanUsername}" not found. Please check the username.` });
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({ leetcode_username: cleanUsername })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update LeetCode username' });
    }

    // Store initial stats
    await supabase.from('leetcode_stats').upsert({
      user_id: userId,
      ...stats,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    res.json({
      message: `LeetCode account "${cleanUsername}" linked successfully!`,
      stats,
    });
  } catch (err) {
    console.error('Set leetcode username error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:userId — Get user profile + stats
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, college_id, leetcode_username, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: college } = await supabase
      .from('colleges')
      .select('id, name, slug, logo_url')
      .eq('id', user.college_id)
      .single();

    const { data: stats } = await supabase
      .from('leetcode_stats')
      .select('*')
      .eq('user_id', userId)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    // Rank within college
    let collegeRank = null;
    if (stats) {
      const { data: allStats } = await supabase
        .from('leetcode_stats')
        .select('user_id, total_solved')
        .in('user_id', await getCollegeUserIds(user.college_id));

      if (allStats) {
        const sorted = allStats.sort((a, b) => b.total_solved - a.total_solved);
        collegeRank = sorted.findIndex(s => s.user_id === userId) + 1;
      }
    }

    res.json({ user: { ...user, college }, stats: stats || null, collegeRank });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function getCollegeUserIds(collegeId) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('college_id', collegeId)
    .not('leetcode_username', 'is', null);
  return data?.map(u => u.id) || [];
}

export default router;
