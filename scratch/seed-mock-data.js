const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client('postgresql://postgres.pdqrzwnxzhblksbshtor:6tPpv_H.8%21rWti%2A@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres');

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase!");

    // Insert Seva Areas
    const sevaAreas = [
      {
        id: crypto.randomUUID(),
        name: 'Education for All',
        hindiName: 'सबके लिए शिक्षा',
        slug: 'education',
        description: 'Providing quality education to underprivileged children.',
        icon: 'GraduationCap',
        published: true,
        is_active: true
      },
      {
        id: crypto.randomUUID(),
        name: 'Healthcare Support',
        hindiName: 'स्वास्थ्य सेवा',
        slug: 'healthcare',
        description: 'Free medical camps and healthcare assistance for the needy.',
        icon: 'HeartPulse',
        published: true,
        is_active: true
      },
      {
        id: crypto.randomUUID(),
        name: 'Food & Nutrition',
        hindiName: 'अन्न दान',
        slug: 'food-nutrition',
        description: 'Ensuring no one goes to sleep hungry through our daily meal programs.',
        icon: 'UtensilsCrossed',
        published: true,
        is_active: true
      }
    ];

    for (const area of sevaAreas) {
      await client.query(`
        INSERT INTO seva_areas (id, name, hindi_name, slug, description, icon, published, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;
      `, [area.id, area.name, area.hindiName, area.slug, area.description, area.icon, area.published, area.is_active]);
    }
    console.log("Inserted Seva Areas");

    // Insert Campaigns
    const campaigns = [
      {
        id: crypto.randomUUID(),
        title: 'Sponsor a Child\'s Education for a Year',
        slug: 'sponsor-education',
        short_description: 'Help provide books, uniforms, and tuition for a child in need.',
        story: '<p>Education is the key to breaking the cycle of poverty. By sponsoring a child, you are directly contributing to a brighter future.</p>',
        status: 'ACTIVE',
        is_featured: true,
        seva_area_id: sevaAreas[0].id,
        donation_mode: 'BOTH',
        minimum_amount_paise: 50000,
        cover_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000'
      },
      {
        id: crypto.randomUUID(),
        title: 'Medical Camp for Rural Villages',
        slug: 'rural-medical-camp',
        short_description: 'Funding free health checkups and medicines for remote areas.',
        story: '<p>Thousands lack basic healthcare. This campaign helps us organize weekly medical camps with certified doctors.</p>',
        status: 'ACTIVE',
        is_featured: true,
        seva_area_id: sevaAreas[1].id,
        donation_mode: 'BOTH',
        minimum_amount_paise: 10000,
        cover_image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1000'
      },
      {
        id: crypto.randomUUID(),
        title: 'Daily Annadaan (Food Distribution)',
        slug: 'daily-annadaan',
        short_description: 'Join our mission to serve 500 meals daily to the homeless.',
        story: '<p>Food is a fundamental human right. Our Annadaan program ensures daily hot meals are provided to those most in need.</p>',
        status: 'ACTIVE',
        is_featured: true,
        seva_area_id: sevaAreas[2].id,
        donation_mode: 'GENERAL',
        minimum_amount_paise: 10000,
        cover_image: 'https://images.unsplash.com/photo-1593113511470-76127814b7e1?q=80&w=1000'
      }
    ];

    for (const camp of campaigns) {
      await client.query(`
        INSERT INTO campaigns (id, title, slug, short_description, story, status, is_featured, seva_area_id, donation_mode, minimum_amount_paise, allow_custom_amount, is_urgent, cover_image, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false, $11, NOW(), NOW())
        ON CONFLICT (slug) DO NOTHING;
      `, [camp.id, camp.title, camp.slug, camp.short_description, camp.story, camp.status, camp.is_featured, camp.seva_area_id, camp.donation_mode, camp.minimum_amount_paise, camp.cover_image]);
    }
    console.log("Inserted Campaigns");

  } catch (e) {
    console.error("Error executing seed:", e);
  } finally {
    client.end();
  }
}

run();
