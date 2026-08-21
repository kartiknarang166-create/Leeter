import express from 'express';
import { supabase } from '../db/supabase.js';

const router = express.Router();

// GET /api/colleges — List all colleges
router.get('/', async (req, res) => {
  try {
    const { data: colleges, error } = await supabase
      .from('colleges')
      .select('id, name, slug, logo_url, state, type')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch colleges' });
    }

    // Get member counts
    const { data: memberCounts } = await supabase
      .from('users')
      .select('college_id')
      .not('leetcode_username', 'is', null);

    const countMap = {};
    if (memberCounts) {
      for (const { college_id } of memberCounts) {
        countMap[college_id] = (countMap[college_id] || 0) + 1;
      }
    }

    const result = colleges.map(c => ({
      ...c,
      member_count: countMap[c.id] || 0,
    }));

    res.json({ colleges: result });
  } catch (err) {
    console.error('Colleges error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/colleges/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { data: college, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error || !college) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json({ college });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
