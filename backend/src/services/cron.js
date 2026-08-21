import cron from 'node-cron';
import { supabase } from '../db/supabase.js';
import { fetchLeetCodeStats, fetchDailyChallenge } from './leetcode.js';

// 12 PM IST = 06:30 UTC → cron: "30 6 * * *"
const SYNC_SCHEDULE = '30 6 * * *';

async function syncAllUsers() {
  console.log(`[CRON] Starting daily LeetCode sync at ${new Date().toISOString()}`);

  try {
    // Get all users with LeetCode username
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, leetcode_username')
      .not('leetcode_username', 'is', null);

    if (error || !users?.length) {
      console.log('[CRON] No users to sync');
      return;
    }

    console.log(`[CRON] Syncing ${users.length} users...`);

    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const stats = await fetchLeetCodeStats(user.leetcode_username);
        if (stats) {
          await supabase.from('leetcode_stats').upsert({
            user_id: user.id,
            ...stats,
            fetched_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
          success++;
        } else {
          failed++;
          console.warn(`[CRON] Could not fetch stats for ${user.leetcode_username}`);
        }
        // Rate limit: wait 500ms between requests
        await new Promise(r => setTimeout(r, 500));
      } catch (userErr) {
        failed++;
        console.error(`[CRON] Error syncing ${user.username}:`, userErr.message);
      }
    }

    console.log(`[CRON] Sync complete: ${success} succeeded, ${failed} failed`);
  } catch (err) {
    console.error('[CRON] Fatal sync error:', err);
  }
}

async function syncDailyChallenge() {
  console.log('[CRON] Fetching daily challenge...');
  try {
    const challenge = await fetchDailyChallenge();
    if (!challenge) return;

    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_challenges').upsert({
      date: today,
      title: challenge.question.title,
      slug: challenge.question.titleSlug,
      difficulty: challenge.question.difficulty,
      link: challenge.link,
      solved_by: [],
    }, { onConflict: 'date' });

    console.log(`[CRON] Daily challenge set: "${challenge.question.title}" (${challenge.question.difficulty})`);
  } catch (err) {
    console.error('[CRON] Error fetching daily challenge:', err.message);
  }
}

export function startCronJobs() {
  // Daily sync at 12 PM IST (06:30 UTC)
  cron.schedule(SYNC_SCHEDULE, async () => {
    await syncDailyChallenge();
    await syncAllUsers();
  }, {
    timezone: 'UTC',
  });

  console.log(`[CRON] Daily sync scheduled at 12:00 PM IST (${SYNC_SCHEDULE} UTC)`);
}

// Manual trigger for testing
export { syncAllUsers, syncDailyChallenge };
