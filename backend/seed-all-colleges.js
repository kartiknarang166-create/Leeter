import { supabase } from './src/db/supabase.js';

const allColleges = [
  // --- IITs (JoSAA) ---
  { name: 'IIT Madras', slug: 'iit-madras', state: 'Tamil Nadu', type: 'IIT' },
  { name: 'IIT Delhi', slug: 'iit-delhi', state: 'Delhi', type: 'IIT' },
  { name: 'IIT Bombay', slug: 'iit-bombay', state: 'Maharashtra', type: 'IIT' },
  { name: 'IIT Kanpur', slug: 'iit-kanpur', state: 'Uttar Pradesh', type: 'IIT' },
  { name: 'IIT Roorkee', slug: 'iit-roorkee', state: 'Uttarakhand', type: 'IIT' },
  { name: 'IIT Kharagpur', slug: 'iit-kharagpur', state: 'West Bengal', type: 'IIT' },
  { name: 'IIT Guwahati', slug: 'iit-guwahati', state: 'Assam', type: 'IIT' },
  { name: 'IIT Hyderabad', slug: 'iit-hyderabad', state: 'Telangana', type: 'IIT' },
  { name: 'IIT Indore', slug: 'iit-indore', state: 'Madhya Pradesh', type: 'IIT' },
  { name: 'IIT BHU Varanasi', slug: 'iit-bhu', state: 'Uttar Pradesh', type: 'IIT' },
  { name: 'IIT (ISM) Dhanbad', slug: 'iit-ism-dhanbad', state: 'Jharkhand', type: 'IIT' },
  { name: 'IIT Bhubaneswar', slug: 'iit-bhubaneswar', state: 'Odisha', type: 'IIT' },
  { name: 'IIT Gandhinagar', slug: 'iit-gandhinagar', state: 'Gujarat', type: 'IIT' },
  { name: 'IIT Ropar', slug: 'iit-ropar', state: 'Punjab', type: 'IIT' },
  { name: 'IIT Patna', slug: 'iit-patna', state: 'Bihar', type: 'IIT' },
  { name: 'IIT Mandi', slug: 'iit-mandi', state: 'Himachal Pradesh', type: 'IIT' },
  { name: 'IIT Jodhpur', slug: 'iit-jodhpur', state: 'Rajasthan', type: 'IIT' },
  { name: 'IIT Tirupati', slug: 'iit-tirupati', state: 'Andhra Pradesh', type: 'IIT' },
  { name: 'IIT Bhilai', slug: 'iit-bhilai', state: 'Chhattisgarh', type: 'IIT' },
  { name: 'IIT Goa', slug: 'iit-goa', state: 'Goa', type: 'IIT' },
  { name: 'IIT Jammu', slug: 'iit-jammu', state: 'Jammu & Kashmir', type: 'IIT' },
  { name: 'IIT Dharwad', slug: 'iit-dharwad', state: 'Karnataka', type: 'IIT' },
  { name: 'IIT Palakkad', slug: 'iit-palakkad', state: 'Kerala', type: 'IIT' },

  // --- NITs (JoSAA) ---
  { name: 'NIT Trichy', slug: 'nit-trichy', state: 'Tamil Nadu', type: 'NIT' },
  { name: 'NIT Surathkal', slug: 'nit-surathkal', state: 'Karnataka', type: 'NIT' },
  { name: 'NIT Rourkela', slug: 'nit-rourkela', state: 'Odisha', type: 'NIT' },
  { name: 'NIT Warangal', slug: 'nit-warangal', state: 'Telangana', type: 'NIT' },
  { name: 'NIT Kurukshetra', slug: 'nit-kurukshetra', state: 'Haryana', type: 'NIT' },
  { name: 'NIT Durgapur', slug: 'nit-durgapur', state: 'West Bengal', type: 'NIT' },
  { name: 'MNNIT Allahabad', slug: 'mnnit-allahabad', state: 'Uttar Pradesh', type: 'NIT' },
  { name: 'MNIT Jaipur', slug: 'mnit-jaipur', state: 'Rajasthan', type: 'NIT' },
  { name: 'NIT Calicut', slug: 'nit-calicut', state: 'Kerala', type: 'NIT' },
  { name: 'VNIT Nagpur', slug: 'vnit-nagpur', state: 'Maharashtra', type: 'NIT' },
  { name: 'SVNIT Surat', slug: 'svnit-surat', state: 'Gujarat', type: 'NIT' },
  { name: 'NIT Silchar', slug: 'nit-silchar', state: 'Assam', type: 'NIT' },
  { name: 'MANIT Bhopal', slug: 'manit-bhopal', state: 'Madhya Pradesh', type: 'NIT' },
  { name: 'NIT Jalandhar', slug: 'nit-jalandhar', state: 'Punjab', type: 'NIT' },
  { name: 'NIT Meghalaya', slug: 'nit-meghalaya', state: 'Meghalaya', type: 'NIT' },
  { name: 'NIT Raipur', slug: 'nit-raipur', state: 'Chhattisgarh', type: 'NIT' },
  { name: 'NIT Srinagar', slug: 'nit-srinagar', state: 'Jammu & Kashmir', type: 'NIT' },
  { name: 'NIT Patna', slug: 'nit-patna', state: 'Bihar', type: 'NIT' },
  { name: 'NIT Goa', slug: 'nit-goa', state: 'Goa', type: 'NIT' },
  { name: 'NIT Jamshedpur', slug: 'nit-jamshedpur', state: 'Jharkhand', type: 'NIT' },
  { name: 'NIT Agartala', slug: 'nit-agartala', state: 'Tripura', type: 'NIT' },
  { name: 'NIT Hamirpur', slug: 'nit-hamirpur', state: 'Himachal Pradesh', type: 'NIT' },
  { name: 'NIT Uttarakhand', slug: 'nit-uttarakhand', state: 'Uttarakhand', type: 'NIT' },
  { name: 'NIT Puducherry', slug: 'nit-puducherry', state: 'Puducherry', type: 'NIT' },
  { name: 'NIT Arunachal Pradesh', slug: 'nit-arunachal', state: 'Arunachal Pradesh', type: 'NIT' },
  { name: 'NIT Sikkim', slug: 'nit-sikkim', state: 'Sikkim', type: 'NIT' },
  { name: 'NIT Delhi', slug: 'nit-delhi', state: 'Delhi', type: 'NIT' },
  { name: 'NIT Mizoram', slug: 'nit-mizoram', state: 'Mizoram', type: 'NIT' },
  { name: 'NIT Nagaland', slug: 'nit-nagaland', state: 'Nagaland', type: 'NIT' },
  { name: 'NIT Manipur', slug: 'nit-manipur', state: 'Manipur', type: 'NIT' },
  { name: 'NIT Andhra Pradesh', slug: 'nit-andhra', state: 'Andhra Pradesh', type: 'NIT' },

  // --- IIITs (JoSAA / Independent) ---
  { name: 'IIIT Hyderabad', slug: 'iiit-hyderabad', state: 'Telangana', type: 'IIIT' },
  { name: 'IIIT Bangalore', slug: 'iiit-bangalore', state: 'Karnataka', type: 'IIIT' },
  { name: 'IIIT Allahabad', slug: 'iiit-allahabad', state: 'Uttar Pradesh', type: 'IIIT' },
  { name: 'IIITM Gwalior', slug: 'iiitm-gwalior', state: 'Madhya Pradesh', type: 'IIIT' },
  { name: 'IIITDM Jabalpur', slug: 'iiitdm-jabalpur', state: 'Madhya Pradesh', type: 'IIIT' },
  { name: 'IIITDM Kancheepuram', slug: 'iiitdm-kancheepuram', state: 'Tamil Nadu', type: 'IIIT' },
  { name: 'IIIT Pune', slug: 'iiit-pune', state: 'Maharashtra', type: 'IIIT' },
  { name: 'IIIT Lucknow', slug: 'iiit-lucknow', state: 'Uttar Pradesh', type: 'IIIT' },
  { name: 'IIIT Guwahati', slug: 'iiit-guwahati', state: 'Assam', type: 'IIIT' },
  { name: 'IIIT Sri City', slug: 'iiit-sri-city', state: 'Andhra Pradesh', type: 'IIIT' },
  { name: 'IIIT Vadodara', slug: 'iiit-vadodara', state: 'Gujarat', type: 'IIIT' },
  { name: 'IIIT Kota', slug: 'iiit-kota', state: 'Rajasthan', type: 'IIIT' },
  { name: 'IIIT Trichy', slug: 'iiit-trichy', state: 'Tamil Nadu', type: 'IIIT' },
  { name: 'IIIT Una', slug: 'iiit-una', state: 'Himachal Pradesh', type: 'IIIT' },
  { name: 'IIIT Sonepat', slug: 'iiit-sonepat', state: 'Haryana', type: 'IIIT' },
  { name: 'IIIT Kalyani', slug: 'iiit-kalyani', state: 'West Bengal', type: 'IIIT' },
  { name: 'IIIT Lucknow', slug: 'iiit-lucknow', state: 'Uttar Pradesh', type: 'IIIT' },
  { name: 'IIIT Dharwad', slug: 'iiit-dharwad', state: 'Karnataka', type: 'IIIT' },
  { name: 'IIIT Kurnool', slug: 'iiitdm-kurnool', state: 'Andhra Pradesh', type: 'IIIT' },
  { name: 'IIIT Kottayam', slug: 'iiit-kottayam', state: 'Kerala', type: 'IIIT' },
  { name: 'IIIT Manipur', slug: 'iiit-manipur', state: 'Manipur', type: 'IIIT' },
  { name: 'IIIT Nagpur', slug: 'iiit-nagpur', state: 'Maharashtra', type: 'IIIT' },
  { name: 'IIIT Ranchi', slug: 'iiit-ranchi', state: 'Jharkhand', type: 'IIIT' },
  { name: 'IIIT Surat', slug: 'iiit-surat', state: 'Gujarat', type: 'IIIT' },
  { name: 'IIIT Bhopal', slug: 'iiit-bhopal', state: 'Madhya Pradesh', type: 'IIIT' },
  { name: 'IIIT Bhagalpur', slug: 'iiit-bhagalpur', state: 'Bihar', type: 'IIIT' },
  { name: 'IIIT Agartala', slug: 'iiit-agartala', state: 'Tripura', type: 'IIIT' },
  { name: 'IIIT Raichur', slug: 'iiit-raichur', state: 'Karnataka', type: 'IIIT' },

  // --- JAC Delhi ---
  { name: 'DTU Delhi', slug: 'dtu-delhi', state: 'Delhi', type: 'State' },
  { name: 'NSUT (NSIT) Delhi', slug: 'nsut-delhi', state: 'Delhi', type: 'State' },
  { name: 'IIIT Delhi', slug: 'iiitd', state: 'Delhi', type: 'State' },
  { name: 'IGDTUW Delhi', slug: 'igdtuw-delhi', state: 'Delhi', type: 'State' },
  { name: 'DSEU Delhi', slug: 'dseu-delhi', state: 'Delhi', type: 'State' },

  // --- BITS ---
  { name: 'BITS Pilani', slug: 'bits-pilani', state: 'Rajasthan', type: 'Private' },
  { name: 'BITS Goa', slug: 'bits-goa', state: 'Goa', type: 'Private' },
  { name: 'BITS Hyderabad', slug: 'bits-hyderabad', state: 'Telangana', type: 'Private' },
  { name: 'BIT Mesra', slug: 'bit-mesra', state: 'Jharkhand', type: 'GFTI' },

  // --- GGSIPU (Delhi) / Other Delhi ---
  { name: 'Maharaja Agrasen Institute of Technology (MAIT)', slug: 'mait-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Maharaja Surajmal Institute of Technology (MSIT)', slug: 'msit-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Bharati Vidyapeeth\'s College of Engineering (BVP)', slug: 'bvp-delhi', state: 'Delhi', type: 'Private' },
  { name: 'USICT (GGSIPU)', slug: 'usict-delhi', state: 'Delhi', type: 'State' },
  { name: 'BPIT Delhi', slug: 'bpit-delhi', state: 'Delhi', type: 'Private' },
  { name: 'Jamia Millia Islamia (JMI)', slug: 'jmi-delhi', state: 'Delhi', type: 'Central' },

  // --- Other Famous State/Private/Deemed ---
  { name: 'VIT Vellore', slug: 'vit-vellore', state: 'Tamil Nadu', type: 'Private' },
  { name: 'VIT Chennai', slug: 'vit-chennai', state: 'Tamil Nadu', type: 'Private' },
  { name: 'Manipal Institute of Technology (MIT)', slug: 'manipal-mit', state: 'Karnataka', type: 'Private' },
  { name: 'SRM Institute of Science and Technology', slug: 'srm-chennai', state: 'Tamil Nadu', type: 'Private' },
  { name: 'Thapar Institute of Engineering and Technology', slug: 'thapar', state: 'Punjab', type: 'Private' },
  { name: 'Jadavpur University', slug: 'jadavpur', state: 'West Bengal', type: 'State' },
  { name: 'College of Engineering Pune (COEP)', slug: 'coep-pune', state: 'Maharashtra', type: 'State' },
  { name: 'VJTI Mumbai', slug: 'vjti-mumbai', state: 'Maharashtra', type: 'State' },
  { name: 'Sardar Patel Institute of Technology (SPIT)', slug: 'spit-mumbai', state: 'Maharashtra', type: 'Private' },
  { name: 'KJ Somaiya College of Engineering', slug: 'kjsomaiya', state: 'Maharashtra', type: 'Private' },
  { name: 'RV College of Engineering (RVCE)', slug: 'rvce-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'BMS College of Engineering (BMSCE)', slug: 'bmsce-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'M. S. Ramaiah Institute of Technology (MSRIT)', slug: 'msrit-bangalore', state: 'Karnataka', type: 'Private' },
  { name: 'PES University', slug: 'pes-university', state: 'Karnataka', type: 'Private' },
  { name: 'DA-IICT Gandhinagar', slug: 'daiict', state: 'Gujarat', type: 'Private' },
  { name: 'Nirma University', slug: 'nirma', state: 'Gujarat', type: 'Private' },
  { name: 'LNMIIT Jaipur', slug: 'lnmiit', state: 'Rajasthan', type: 'Private' },
  { name: 'KIIT Bhubaneswar', slug: 'kiit', state: 'Odisha', type: 'Private' },
  { name: 'Amrita Vishwa Vidyapeetham', slug: 'amrita', state: 'Tamil Nadu', type: 'Private' },
  { name: 'PSG College of Technology', slug: 'psg-coimbatore', state: 'Tamil Nadu', type: 'Private' },
  { name: 'Anna University (CEG)', slug: 'ceg-anna', state: 'Tamil Nadu', type: 'State' },
  { name: 'Netaji Subhas Engineering College', slug: 'nsec-kolkata', state: 'West Bengal', type: 'Private' },
  { name: 'IEM Kolkata', slug: 'iem-kolkata', state: 'West Bengal', type: 'Private' },
  { name: 'Heritage Institute of Technology', slug: 'heritage-kolkata', state: 'West Bengal', type: 'Private' },
  { name: 'HBTU Kanpur', slug: 'hbtu-kanpur', state: 'Uttar Pradesh', type: 'State' },
  { name: 'IET Lucknow', slug: 'iet-lucknow', state: 'Uttar Pradesh', type: 'State' },
  { name: 'JSS Academy of Technical Education', slug: 'jss-noida', state: 'Uttar Pradesh', type: 'Private' },
  { name: 'JIIT Noida (Jaypee)', slug: 'jiit-noida', state: 'Private', type: 'Private' },
];

async function seed() {
  console.log(`Starting to insert ${allColleges.length} colleges...`);
  
  // Insert in batches of 30 to avoid huge payloads just in case
  const batchSize = 30;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allColleges.length; i += batchSize) {
    const batch = allColleges.slice(i, i + batchSize);
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
