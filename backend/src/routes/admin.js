import express from 'express';
import { supabase } from '../db/supabase.js';
import { fetchLeetCodeStats } from '../services/leetcode.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Middleware: verify ADMIN_SECRET
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(adminAuth);

// ─── USERS ───────────────────────────────────────────────

// GET /api/admin/users — list all users with college + latest stats
router.get('/users', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('users')
      .select(`
        id, username, email, display_name, college_id, leetcode_username,
        graduation_year, created_at,
        colleges ( id, name, slug ),
        leetcode_stats ( total_solved, easy_solved, medium_solved, hard_solved, streak, ranking, fetched_at )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,leetcode_username.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Flatten latest stats per user
    const users = data.map(u => {
      const stats = Array.isArray(u.leetcode_stats)
        ? u.leetcode_stats.sort((a, b) => new Date(b.fetched_at) - new Date(a.fetched_at))[0] || null
        : u.leetcode_stats;
      return { ...u, leetcode_stats: stats };
    });

    res.json({ users, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users/:id — single user full detail
router.get('/users/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, username, email, display_name, college_id, leetcode_username,
        graduation_year, created_at,
        colleges ( id, name, slug ),
        leetcode_stats ( * )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/users/:id — update user fields
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = ['username', 'email', 'display_name', 'college_id', 'graduation_year', 'leetcode_username'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, username, email, display_name, college_id, leetcode_username, graduation_year')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id — delete user + stats
router.delete('/users/:id', async (req, res) => {
  try {
    await supabase.from('leetcode_stats').delete().eq('user_id', req.params.id);
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/sync/:userId — manually sync LeetCode stats for a user
router.post('/sync/:userId', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('leetcode_username')
      .eq('id', req.params.userId)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    if (!user.leetcode_username) return res.status(400).json({ error: 'No LeetCode username linked' });

    const stats = await fetchLeetCodeStats(user.leetcode_username);
    if (!stats) return res.status(502).json({ error: 'Failed to fetch LeetCode stats' });

    await supabase.from('leetcode_stats').upsert({
      user_id: req.params.userId,
      ...stats,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    res.json({ message: 'Stats synced', stats });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── COLLEGES ────────────────────────────────────────────

// GET /api/admin/colleges — list all
router.get('/colleges', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*, users(count)')
      .order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ colleges: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/colleges — create
router.post('/colleges', async (req, res) => {
  try {
    const { name, slug, logo_url, city, state } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

    const { data, error } = await supabase
      .from('colleges')
      .insert({ name, slug, logo_url, city, state })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ college: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/colleges/:id — update
router.patch('/colleges/:id', async (req, res) => {
  try {
    const allowed = ['name', 'slug', 'logo_url', 'city', 'state'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabase
      .from('colleges')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ college: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/colleges/:id
router.delete('/colleges/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('colleges').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'College deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── STATS OVERVIEW ──────────────────────────────────────

// GET /api/admin/stats — dashboard overview numbers
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: linkedUsers },
      { count: totalColleges },
      { data: lastSync },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).not('leetcode_username', 'is', null),
      supabase.from('colleges').select('*', { count: 'exact', head: true }),
      supabase.from('leetcode_stats').select('fetched_at').order('fetched_at', { ascending: false }).limit(1),
    ]);

    res.json({
      totalUsers,
      linkedUsers,
      totalColleges,
      lastSync: lastSync?.[0]?.fetched_at || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
