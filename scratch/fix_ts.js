const fs = require('fs');

const fixes = [
  {
    file: 'src/app/api/admin/events/route.ts',
    search: 'await db.listEvents().some(e =>',
    replace: '(await db.listEvents()).some((e: any) =>'
  },
  {
    file: 'src/app/api/campaigns/route.ts',
    search: 'await db.listPublicCampaigns(category).map((c)',
    replace: '(await db.listPublicCampaigns(category)).map((c: any)'
  },
  {
    file: 'src/app/api/donations/route.ts',
    search: 'await db.listCampaigns().find(p =>',
    replace: '(await db.listAllCampaigns()).find((p: any) =>'
  },
  {
    file: 'src/app/api/webhooks/razorpay/route.ts',
    search: 'await db.listAllDonations().find(d =>',
    replace: '(await db.listAllDonations()).find((d: any) =>'
  },
  {
    file: 'src/app/admin/audit-logs/page.tsx',
    search: 'logs.map((l)',
    replace: 'logs.map((l: any)'
  },
  {
    file: 'src/app/admin/content/blog/[id]/page.tsx',
    search: 'db.getPostById',
    replace: 'db.getBlogPostById'
  },
  {
    file: 'src/app/admin/content/blog/page.tsx',
    search: 'db.listAllPosts',
    replace: 'db.listBlogPosts'
  },
  {
    file: 'src/app/admin/content/blog/page.tsx',
    search: 'posts.map((p)',
    replace: 'posts.map((p: any)'
  },
  {
    file: 'src/app/admin/content/events/page.tsx',
    search: 'db.listAllEvents',
    replace: 'db.listEvents'
  },
  {
    file: 'src/app/admin/content/events/page.tsx',
    search: 'events.map((e)',
    replace: 'events.map((e: any)'
  },
  {
    file: 'src/app/admin/content/page.tsx',
    search: 'db.listAllPosts',
    replace: 'db.listBlogPosts'
  },
  {
    file: 'src/app/admin/content/page.tsx',
    search: 'db.listAllEvents',
    replace: 'db.listEvents'
  },
  {
    file: 'src/app/admin/people/page.tsx',
    search: 'volunteers.map((v)',
    replace: 'volunteers.map((v: any)'
  },
  {
    file: 'src/app/admin/people/page.tsx',
    search: 'members.map((m)',
    replace: 'members.map((m: any)'
  },
  {
    file: 'src/app/admin/seva-areas/page.tsx',
    search: 'areas.map((sa)',
    replace: 'areas.map((sa: any)'
  },
  {
    file: 'src/app/blog/page.tsx',
    search: 'posts.map((p)',
    replace: 'posts.map((p: any)'
  },
  {
    file: 'src/app/campaigns/page.tsx',
    search: 'categories.map((cat)',
    replace: 'categories.map((cat: any)'
  },
  {
    file: 'src/app/events/page.tsx',
    search: 'events.map((e)',
    replace: 'events.map((e: any)'
  },
  {
    file: 'src/app/faq/page.tsx',
    search: 'faqs.map((f)',
    replace: 'faqs.map((f: any)'
  },
  {
    file: 'src/app/faq/page.tsx',
    search: 'faqs.map(f =>',
    replace: 'faqs.map((f: any) =>'
  },
  {
    file: 'src/app/page.tsx',
    search: 'areas.map((area)',
    replace: 'areas.map((area: any)'
  },
  {
    file: 'src/app/page.tsx',
    search: 'events.map((e)',
    replace: 'events.map((e: any)'
  },
  {
    file: 'src/app/user/dashboard/page.tsx',
    search: 'donations.reduce((s, d)',
    replace: 'donations.reduce((s: number, d: any)'
  },
  {
    file: 'src/app/user/dashboard/page.tsx',
    search: 'donations.map((d)',
    replace: 'donations.map((d: any)'
  },
  {
    file: 'src/lib/view-models.ts',
    search: '(p)',
    replace: '(p: any)'
  },
  {
    file: 'src/lib/view-models.ts',
    search: '(m)',
    replace: '(m: any)'
  },
  {
    file: 'src/lib/view-models.ts',
    search: '(f)',
    replace: '(f: any)'
  },
  {
    file: 'src/lib/view-models.ts',
    search: '(u)',
    replace: '(u: any)'
  }
];

fixes.forEach(({ file, search, replace }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(search)) {
        fs.writeFileSync(file, content.replace(search, replace));
        console.log('Fixed', file, 'for', search);
    } else {
        console.log('Not found in', file, ':', search);
    }
  } else {
    console.log('File not found:', file);
  }
});
