import { supabase } from './src/db/supabase.js';

async function run() {
  const { data, error } = await supabase
    .from('colleges')
    .upsert(
      {
        name: 'Maharaja Agrasen Institute of Technology',
        slug: 'mait-delhi',
        state: 'Delhi',
        type: 'Private'
      },
      { onConflict: 'slug' }
    );

  if (error) {
    console.error('Failed to insert MAIT:', error);
  } else {
    console.log('Successfully inserted MAIT!');
  }
}

run();
