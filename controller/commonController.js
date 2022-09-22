

const puppeteer = require('puppeteer');
const request_client = require('request-promise-native');




const scrapper = (req, res) => {
console.log("=>", req.query.charId);
async function start() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', request => {
      request_client({
          uri: request.url(),
          resolveWithFullResponse: true,
      }).then(response => {
          const request_url = request.url();
          const response_body = response.body;
          if (request.resourceType() === 'image') {
            request.continue();
           // request.abort();
          } 
           else if (request_url.includes('https://www.midasbuy.com/interface/getCharac')) {
              res.end(response_body)
                browser.close()

          }
          else {
            request.continue();
          }
      }).catch(error => {
          request.abort();
      });
  });


  await page.goto('https://www.midasbuy.com/midasbuy/gb/buy/pubgm',  { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#cookieSwitchBtn');
  await page.$$eval('#cookieSwitchBtn', elHandles => elHandles.forEach(el => el.click()))
  await page.waitForSelector(`[placeholder="Please enter Player ID"]`)
  await page.type('[placeholder="Please enter Player ID"]', req.query.charId);
  await page.click('div.btn');
   
}
try {

  start();
}
catch (e) {
  console.log('e.pri', e)
}
};


module.exports = {
  scrapper,
};
