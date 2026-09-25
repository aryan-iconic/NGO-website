const { Client } = require('pg');
const client = new Client('postgresql://postgres.pdqrzwnxzhblksbshtor:6tPpv_H.8%21rWti%2A@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres');
const { v4: uuidv4 } = require('crypto');

async function seed() {
  await client.connect();
  console.log('Connected to DB');

  // Instagram Posts
  const ig1 = [require('crypto').randomUUID(), 'https://www.instagram.com/p/C_K2lEByoIq/', 'Health Camp', 'Free medical checkups for rural communities.', 1, true];
  const ig2 = [require('crypto').randomUUID(), 'https://www.instagram.com/reel/C-1kH_Xyh6P/', 'Food Distribution', 'Serving hot meals to those in need on the streets of Varanasi.', 2, true];
  const ig3 = [require('crypto').randomUUID(), 'https://www.instagram.com/p/C9hV0T6S6L7/', 'Gau Seva at Vrindavan', 'Feeding the cows at our Gaushala. Every life matters.', 3, true];

  for (const ig of [ig1, ig2, ig3]) {
    await client.query('INSERT INTO instagram_posts (id, instagram_url, title, caption, display_order, is_published) VALUES ($1, $2, $3, $4, $5, $6)', ig);
  }
  console.log('Seeded Instagram Posts');

  // YouTube Videos
  const yt1 = [require('crypto').randomUUID(), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Ganga Aarti', 'Experiencing the divine Ganga Aarti at Dashashwamedh Ghat.', 1, true];
  const yt2 = [require('crypto').randomUUID(), 'https://youtu.be/39-qK9u0rGg', 'Vrindavan Gaushala Highlights', 'A tour of our newly built cow shelter and care facilities.', 2, true];
  const yt3 = [require('crypto').randomUUID(), 'https://www.youtube.com/shorts/5kE4g6W8C4M', 'Volunteering with us', 'Join our team of dedicated volunteers making a difference.', 3, true];

  for (const yt of [yt1, yt2, yt3]) {
    await client.query('INSERT INTO youtube_videos (id, youtube_url, title, description, display_order, is_published) VALUES ($1, $2, $3, $4, $5, $6)', yt);
  }
  console.log('Seeded YouTube Videos');

  await client.end();
}
seed().catch(console.error);
