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
    })).sort((a, b) => b.member_count - a.member_count || a.name.localeCompare(b.name));

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


// POST /api/colleges/suggest — Add a missing college immediately to the live list
router.post('/suggest', async (req, res) => {
  try {
    const { name, state } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'College name is required' });

    const trimmedName = name.trim();

    // Auto-generate a URL-safe slug from the name
    let slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Insert directly into colleges table — immediately live
    const { data, error } = await supabase
      .from('colleges')
      .insert({
        name: trimmedName,
        slug,
        state: (state || '').trim() || null,
        type: 'Engineering',
        source: 'user',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Slug conflict — append a short random suffix and retry
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        const { data: data2, error: error2 } = await supabase
          .from('colleges')
          .insert({ name: trimmedName, slug, state: (state || '').trim() || null, type: 'Engineering', source: 'user' })
          .select()
          .single();
        if (error2) return res.status(500).json({ error: error2.message });
        return res.status(201).json({ college: data2 });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ college: data });
  } catch (err) {
    console.error('College suggest error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

