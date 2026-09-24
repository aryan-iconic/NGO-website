const https = require('https');

https.get('https://react.dev/page-data/errors/441/page-data.json', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(json.result.pageContext.error.text);
    } catch(e){
      console.error(e);
    }
  });
});
