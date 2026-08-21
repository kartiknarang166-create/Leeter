import { supabase } from './src/db/supabase.js';

const moreColleges = [
  // --- GGSIPU (Delhi) ---
  { name: 'Guru Tegh Bahadur Institute of Technology (GTBIT)', slug: 'gtbit-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Dr. Akhilesh Das Gupta Institute (ADGITM)', slug: 'adgitm-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Vivekananda Institute of Professional Studies (VIPS)', slug: 'vips-delhi', state: 'Delhi', type: 'Private' },
  { name: 'HMR Institute of Technology and Management', slug: 'hmr-delhi', state: 'Delhi', type: 'Private' },
  { name: 'JIMS Engineering Management Technical Campus', slug: 'jims-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Delhi Technical Campus (DTC)', slug: 'dtc-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Trinity Institute of Innovations in Professional Studies', slug: 'trinity-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Maharaja Agrasen Institute of Technology (MAIT)', slug: 'mait-delhi', state: 'Delhi', type: 'Private' }, // Dupe check via slug
  { name: 'Maharaja Surajmal Institute of Technology (MSIT)', slug: 'msit-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Bharati Vidyapeeth College of Engineering (BVP)', slug: 'bvp-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Bhagwan Parshuram Institute of Technology (BPIT)', slug: 'bpit-delhi', state: 'Delhi', type: 'Private' },
  { name: 'University School of Information, Communication and Technology (USICT)', slug: 'usict-delhi', state: 'Delhi', type: 'State' },

  // --- MHT CET (Maharashtra) ---
  { name: 'Pune Institute of Computer Technology (PICT)', slug: 'pict-pune', state: 'Maharashtra', type: 'Private' },
  { name: 'Vishwakarma Institute of Technology (VIT Pune)', slug: 'vit-pune', state: 'Maharashtra', type: 'Private' },
  { name: 'MIT World Peace University (MIT WPU)', slug: 'mit-pune', state: 'Maharashtra', type: 'Private' },
  { name: 'Dwarkadas J. Sanghvi College of Engineering (DJSCE)', slug: 'djsce-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'Thadomal Shahani Engineering College (TSEC)', slug: 'tsec-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'Pimpri Chinchwad College of Engineering (PCCOE)', slug: 'pccoe-pune', state: 'Maharashtra', type: 'Private' },
  { name: 'Walchand College of Engineering (WCE)', slug: 'wce-sangli', state: 'Maharashtra', type: 'State' },
  { name: 'Shri Guru Gobind Singhji Institute (SGGSIE&T)', slug: 'sggs-nanded', state: 'Maharashtra', type: 'State' },
  { name: 'Government College of Engineering Amravati (GCOEA)', slug: 'gcoea-amravati', state: 'Maharashtra', type: 'State' },
  { name: 'Government College of Engineering Aurangabad (GECA)', slug: 'geca-aurangabad', state: 'Maharashtra', type: 'State' },
  { name: 'Cummins College of Engineering for Women', slug: 'cummins-pune', state: 'Maharashtra', type: 'Private' },
  { name: 'Ramrao Adik Institute of Technology (RAIT)', slug: 'rait-navi-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'Fr. Conceicao Rodrigues College of Engineering (CRCE)', slug: 'crce-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'Vidyalankar Institute of Technology (VIT Mumbai)', slug: 'vit-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'K. J. Somaiya Institute of Technology (KJSIT)', slug: 'kjsit-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'College of Engineering Pune (COEP)', slug: 'coep-pune', state: 'Maharashtra', type: 'State' },
  { name: 'VJTI Mumbai', slug: 'vjti-mumbai', state: 'Maharashtra', type: 'State' },
  { name: 'Sardar Patel Institute of Technology (SPIT)', slug: 'spit-mumbai', state: 'Maharashtra', type: 'Private' },

  // --- KCET / COMEDK (Karnataka) ---
  { name: 'Bangalore Institute of Technology (BIT)', slug: 'bit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'Dayananda Sagar College of Engineering (DSCE)', slug: 'dsce-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'Nitte Meenakshi Institute of Technology (NMIT)', slug: 'nmit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'SJB Institute of Technology (SJBIT)', slug: 'sjbit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'CMR Institute of Technology (CMRIT)', slug: 'cmrit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'National Institute of Engineering (NIE Mysore)', slug: 'nie-mysore', state: 'Karnataka', type: 'Private' },
  { name: 'Siddaganga Institute of Technology (SIT Tumkur)', slug: 'sit-tumkur', state: 'Karnataka', type: 'Private' },
  { name: 'B.N.M Institute of Technology (BNMIT)', slug: 'bnmit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'RNS Institute of Technology (RNSIT)', slug: 'rnsit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'New Horizon College of Engineering (NHCE)', slug: 'nhce-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'JSS Science and Technology University (SJCE Mysore)', slug: 'sjce-mysore', state: 'Karnataka', type: 'Private' },
  { name: 'RV College of Engineering (RVCE)', slug: 'rvce-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'BMS College of Engineering (BMSCE)', slug: 'bmsce-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'M. S. Ramaiah Institute of Technology (MSRIT)', slug: 'msrit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'PES University (Ring Road Campus)', slug: 'pes-university', state: 'Karnataka', type: 'Private' },
  { name: 'PES University (Electronic City Campus)', slug: 'pes-ec-campus', state: 'Karnataka', type: 'Private' },

  // --- UPTAC / UPSEE (Uttar Pradesh) ---
  { name: 'Kamla Nehru Institute of Technology (KNIT)', slug: 'knit-sultanpur', state: 'Uttar Pradesh', type: 'State' },
  { name: 'Bundelkhand Institute of Engineering & Technology (BIET)', slug: 'biet-jhansi', state: 'Uttar Pradesh', type: 'State' },
  { name: 'Ajay Kumar Garg Engineering College (AKGEC)', slug: 'akgec-ghaziabad', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'KIET Group of Institutions', slug: 'kiet-ghaziabad', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'ABES Engineering College', slug: 'abes-ghaziabad', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'Galgotias College of Engineering and Technology (GCET)', slug: 'gcet-greater-noida', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'G.L. Bajaj Institute of Technology and Management', slug: 'gl-bajaj-greater-noida', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'Noida Institute of Engineering and Technology (NIET)', slug: 'niet-greater-noida', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'IET Lucknow', slug: 'iet-lucknow', state: 'Uttar Pradesh', type: 'State' },
  { name: 'JSS Academy of Technical Education', slug: 'jss-noida', state: 'Uttar Pradesh', type: 'Private' },

  // --- VIT Group ---
  { name: 'VIT Vellore', slug: 'vit-vellore', state: 'Tamil Nadu', type: 'Private' },
  { name: 'VIT Chennai', slug: 'vit-chennai', state: 'Tamil Nadu', type: 'Private' },
  { name: 'VIT-AP University', slug: 'vit-ap', state: 'Andhra Pradesh', type: 'Private' },
  { name: 'VIT Bhopal University', slug: 'vit-bhopal', state: 'Madhya Pradesh', type: 'Private' },

  // --- SRM Group ---
  { name: 'SRM Institute of Science and Technology (KTR Main)', slug: 'srm-chennai', state: 'Tamil Nadu', type: 'Private' },
  { name: 'SRM Institute (Ramapuram Campus)', slug: 'srm-ramapuram', state: 'Tamil Nadu', type: 'Private' },
  { name: 'SRM Institute (Vadapalani Campus)', slug: 'srm-vadapalani', state: 'Tamil Nadu', type: 'Private' },
  { name: 'SRM Institute (NCR Campus, Modinagar)', slug: 'srm-ncr', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'SRM University AP (Amaravati)', slug: 'srm-ap', state: 'Andhra Pradesh', type: 'Private' },

  // --- Manipal Group ---
  { name: 'Manipal Institute of Technology (MIT Manipal)', slug: 'manipal-mit', state: 'Karnataka', type: 'Private' },
  { name: 'Sikkim Manipal Institute of Technology (SMIT)', slug: 'smit-sikkim', state: 'Sikkim', type: 'Private' },
  { name: 'Manipal University Jaipur (MUJ)', slug: 'muj-jaipur', state: 'Rajasthan', type: 'Private' },
  { name: 'Manipal Institute of Technology (MIT Bengaluru)', slug: 'mit-bengaluru', state: 'Karnataka', type: 'Private' }
];

async function seed() {
  console.log(`Starting to insert ${moreColleges.length} regional colleges...`);
  
  const batchSize = 30;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < moreColleges.length; i += batchSize) {
    const batch = moreColleges.slice(i, i + batchSize);
    const { error } = await supabase
      .from('colleges')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true });
    
    if (error) {
      console.error('Error inserting batch:', error);
      failCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`Inserted batch ${Math.ceil(i/batchSize) + 1}`);
    }
  }

  console.log(`Done! Successfully added ${successCount} colleges (Failed: ${failCount}).`);
}

seed();
