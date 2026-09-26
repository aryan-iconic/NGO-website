const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const modelsToUpdate = [
  'Category', 'SevaArea', 'Campaign', 'CampaignProduct', 
  'CampaignUpdate', 'CampaignMilestone', 'CampaignFaq', 
  'Event', 'BlogPost', 'Faq', 'InstagramPost', 'YouTubeVideo'
];

modelsToUpdate.forEach(model => {
  const regex = new RegExp('(model ' + model + ' \\{[^]*?)(\\n  @@)', 'g');
  schema = schema.replace(regex, '$1\n  translations Json?  @map("translations")\n  @@');
});

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Added translations column to models');
