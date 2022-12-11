const puppeteer = require ('puppeteer');
const request_client = require ('request-promise-native');

const scrapper = (req, res) => {
  console.log ('=>', req.query.charId);
  async function start () {
    const browser = await puppeteer.launch ({
      headless: false,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage ();
    await page.setRequestInterception (true);

    page.on ('request', request => {
      request_client ({
        uri: request.url (),
        resolveWithFullResponse: true,
      })
        .then (response => {
          const request_url = request.url ();
          const response_body = response.body;
          if (request.resourceType () === 'image') {
            request.continue ();
            // request.abort();
          } else if (
            request_url.includes (
              'https://www.midasbuy.com/interface/getCharac'
            )
          ) {
            res.end (response_body);
            browser.close ();
          } else {
            request.continue ();
          }
        })
        .catch (error => {
          request.abort ();
        });
    });

    await page.goto('https://www.midasbuy.com/midasbuy/gb/buy/pubgm', {
      waitUntil: 'domcontentloaded',
      timeout: 90000
      });

    page.setDefaultNavigationTimeout( 90000 );
    // await page.waitForNavigation();
    await page.waitForSelector ('#cookieSwitchBtn');

    try {
      console.log('running before clicked to close modal')
      
      
      // let handles = await page.$$('div.close-btn', { visible: true });
      // handles.forEach ((el, i) => 
      //   i === 8 ? 
      //   el.click() : console.log('el.no', JSON.stringify(el)) 
      //   );

      await page.evaluate(`
      document.getElementById('uc_landing_pop').remove()
          `);
      


      console.log('running after clicked to close modal')
      // await page.waitForNavigation();
      
      await page.waitForSelector('#cookieSwitchBtn', {visible: true})
      await page.$$eval('#cookieSwitchBtn', elHandles =>
        elHandles.forEach (el => console.log("element => ",el))
      );


      // let cookies = await page.$$('div.btn.comfirm-btn', { visible: true });
      // cookies.forEach (el => el.click ());
      

    //   await page.evaluate(() => {
        // let elements = document.getElementsByClassName('comfirm-btn');
    //     for (let element of elements)
    //         element.click();
    // });
      console.log('running after clicked to cookies ')

    } catch (e) {
      console.log ('Error => ', e);
    }
    await page.waitForSelector (`[placeholder="Please enter Player ID"]`);
    await page.type (
      '[placeholder="Please enter Player ID"]',
      req.query.charId
    );
    

    await page.keyboard.press('Enter');

      // await page.click ('div.btn',{visible: true});
 
  }
  try {
    start ();
  } catch (e) {
    console.log ('e.pri', e);
  }
};

module.exports = {
  scrapper,
};
