import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase.js';
import { authenticate } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const SALT_ROUNDS = 12;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, college_id, graduation_year } = req.body;

    if (!username || !password || !email || !college_id || !graduation_year) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];
    if (!validYears.includes(graduation_year)) {
      return res.status(400).json({ error: 'Invalid graduation year selected' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check username uniqueness
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Check email uniqueness
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check college exists
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id, name, slug')
      .eq('id', college_id)
      .single();
    if (collegeError || !college) {
      return res.status(400).json({ error: 'Invalid college_id' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password_hash,
        college_id,
        graduation_year,
        display_name: username,
      })
      .select('id, username, email, display_name, college_id, graduation_year, created_at')
      .single();

    if (insertError) {
      console.error('Register error:', insertError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, college_id: user.college_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { ...user, college },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, display_name, password_hash, college_id, graduation_year, leetcode_username, created_at')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Fetch college
    const { data: college } = await supabase
      .from('colleges')
      .select('id, name, slug, logo_url')
      .eq('id', user.college_id)
      .single();

    const token = jwt.sign(
      { userId: user.id, username: user.username, college_id: user.college_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: { ...safeUser, college } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, display_name, college_id, graduation_year, leetcode_username, created_at')
      .eq('id', req.user.userId)
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
      .eq('user_id', user.id)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    res.json({ user: { ...user, college, leetcode_stats: stats || null } });
  } catch (err) {
    console.error('/me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
