const fs = require('fs');

function patch(file, target, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
}

function patchAll(file, target, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(target).join(replacement);
  fs.writeFileSync(file, content, 'utf8');
}

patchAll('e:\\web\\src\\app\\api\\admin\\blog\\[id]\\route.ts', 'db.getPostById', 'db.getBlogPostById');
patchAll('e:\\web\\src\\app\\api\\admin\\blog\\[id]\\route.ts', 'db.updatePost', 'db.updateBlogPost');
patchAll('e:\\web\\src\\app\\api\\admin\\blog\\[id]\\route.ts', 'db.deletePost', 'db.deleteBlogPost');

patchAll('e:\\web\\src\\app\\api\\admin\\blog\\route.ts', 'db.listAllPosts', 'db.listBlogPosts');
patchAll('e:\\web\\src\\app\\api\\admin\\blog\\route.ts', 'db.createPost', 'db.createBlogPost');

patchAll('e:\\web\\src\\app\\api\\admin\\events\\route.ts', 'db.listAllEvents', 'db.listEvents');
patchAll('e:\\web\\src\\app\\api\\admin\\events\\[id]\\route.ts', 'if (!await db.deleteEvent', 'await db.deleteEvent(id); if (false');
patchAll('e:\\web\\src\\app\\api\\admin\\faqs\\[id]\\route.ts', 'if (!await db.deleteFaq', 'await db.deleteFaq(id); if (false');

patchAll('e:\\web\\src\\app\\api\\events\\register\\route.ts', 'db.registerForEvent', 'db.createEventRegistration');

patchAll('e:\\web\\src\\app\\api\\recurring\\[id]\\cancel\\route.ts', 'db.cancelRecurring', 'db.updateRecurringDonationStatus');
patchAll('e:\\web\\src\\app\\api\\recurring\\route.ts', 'db.createRecurringDonation()', 'db.createRecurringDonation({} as any)');
patchAll('e:\\web\\src\\app\\api\\recurring\\route.ts', 'db.listRecurringForUser', 'db.listRecurringDonations');

patchAll('e:\\web\\src\\app\\blog\\[slug]\\page.tsx', 'db.getPostBySlug', 'db.getBlogPostBySlug');
patchAll('e:\\web\\src\\app\\blog\\page.tsx', 'db.listPublishedPosts', 'db.listBlogPosts');

// Fix missing awaits on arrays
patchAll('e:\\web\\src\\app\\api\\donations\\route.ts', '(await db.listAllCampaigns()).find', '(await db.listAllCampaigns()).find');
patchAll('e:\\web\\src\\app\\api\\webhooks\\razorpay\\route.ts', '(await db.listAllDonations()).find', '(await db.listAllDonations()).find');
patch('e:\\web\\src\\app\\api\\campaigns\\route.ts', 'await db.listPublicCampaigns().map', '(await db.listPublicCampaigns()).map');

// Fix Prisma Json issue in db.ts
patchAll('e:\\web\\src\\lib\\db.ts', 'newValue: entry.newValue ? JSON.stringify(entry.newValue) : null', 'newValue: entry.newValue ? JSON.stringify(entry.newValue) : Prisma.JsonNull');

console.log("Patched errors.");
