const axios = require('axios');
const fs = require('fs');
const ObjectsToCsv = require('objects-to-csv');
const API_KEY ;

let data = [];
let promises = [];

// 1. Import URLS
const urls = fs.readFileSync('./urls.txt', 'utf8').split('\n');

// 2. Build Promises array to fetch data

urls.map(function(url){
  const psi = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${API_KEY}`;
  promises.push(axios.get(psi))
});


// 3. Loop through all the promises and return the response
axios.all(promises).then(function(results) {
    results.map(function(res) {
      // Lab metrics
      try {
        const {
          metrics,
          categories,
          audits
        } = res.data.lighthouseResult;

        // Build data object
        data.push({
          'URL': res.data.id,
          'Performance Score': Math.ceil(categories['performance'].score * 100),
          'First Contentful Paint': audits['first-contentful-paint'].displayValue,
          'Largest Contentful Paint': audits['largest-contentful-paint'].displayValue,
          'Speed Index': audits['speed-index'].displayValue,
          'Time to Interactive': audits['interactive'].displayValue,
          'First Input Delay': audits['estimated-input-latency'].displayValue,
          'Cumulative Layout Shift': audits['cumulative-layout-shift'].displayValue,
        });
      }
      catch(e) {
        console.log(e);
      }
    })

    // 4. Write data to CSV
    // console.log(data);
    const csv = new ObjectsToCsv(data)
    csv.toDisk('./page-speed-data.csv')
});