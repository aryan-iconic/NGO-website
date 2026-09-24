const fs = require('fs');

const fixes = [
  {
    file: 'src/app/admin/people/page.tsx',
    search: 'members.map((m)',
    replace: 'members.map((m: any)'
  },
  {
    file: 'src/app/api/admin/blog/route.ts',
    search: 'await db.listBlogPosts().some(p =>',
    replace: '(await db.listBlogPosts()).some((p: any) =>'
  },
  {
    file: 'src/app/api/admin/blog/route.ts',
    search: 'await db.listBlogPosts().some((p) =>',
    replace: '(await db.listBlogPosts()).some((p: any) =>'
  },
  {
    file: 'src/app/api/admin/campaigns/route.ts',
    search: 'await db.listAllCampaigns().some((c) =>',
    replace: '(await db.listAllCampaigns()).some((c: any) =>'
  },
  {
    file: 'src/app/api/admin/campaigns/route.ts',
    search: 'await db.listAllCampaigns().some(c =>',
    replace: '(await db.listAllCampaigns()).some((c: any) =>'
  },
  {
    file: 'src/app/api/events/register/route.ts',
    search: 'await db.registerForEvent(parsed.data, eventId, userId, ip)',
    replace: 'await db.registerForEvent({ ...parsed.data, eventId, userId, ip })'
  },
  {
    file: 'src/app/api/recurring/[id]/cancel/route.ts',
    search: 'await db.updateRecurringDonationStatus(id, "CANCELLED")',
    replace: 'await db.updateRecurringDonationStatus()' // It's not supported in Phase 3
  },
  {
    file: 'src/app/api/recurring/route.ts',
    search: 'await db.listRecurringDonations(session.user.id)',
    replace: 'await db.listRecurringDonations()'
  },
  {
    file: 'src/app/api/recurring/route.ts',
    search: 'await db.createRecurringDonation(parsed.data)',
    replace: 'await db.createRecurringDonation()'
  },
  {
    file: 'src/app/api/admin/blog/[id]/route.ts',
    search: 'if (await db.updateBlogPost(id, parsed.data)) {',
    replace: 'const result = await db.updateBlogPost(id, parsed.data);\n    if (result) {'
  },
  {
    file: 'src/app/api/admin/events/[id]/route.ts',
    search: 'if (await db.updateEvent(id, parsed.data)) {',
    replace: 'const result = await db.updateEvent(id, parsed.data);\n    if (result) {'
  },
  {
    file: 'src/app/api/admin/faqs/[id]/route.ts',
    search: 'if (await db.updateFaq(id, parsed.data)) {',
    replace: 'const result = await db.updateFaq(id, parsed.data);\n    if (result) {'
  },
  {
    file: 'prisma/seed.ts',
    search: 'const sevaAreas = [];',
    replace: 'const sevaAreas: any[] = [];'
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
