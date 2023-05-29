const puppeteer = require ('puppeteer');
const request_client = require ('request-promise-native');
const puppeteerC = require ('puppeteer-core');
const scrapper = (req, res) => {
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';
  console.log (IS_PRODUCTION ? 'Production ' : 'Dev ', '=>', req.query.charId);

  const getBrowser = () => {
    const browserCon = process.env.browser;
    if (IS_PRODUCTION) {
      if (browserCon.includes ('browserless')) {
        console.log (
          'Type: BrowserLess',
          '\n',
          `String: ${process.env.browser}`
        );
        return puppeteer.connect ({
          browserWSEndpoint: browserCon,
        });
      }
      console.log ('Type: BrightData', '\n', `String: ${process.env.browser}`);
      return puppeteerC.connect ({
        browserWSEndpoint: browserCon,
      });
    }
    console.log ('Type: Development Driver');
    return puppeteer.launch ({
      headless: false,
      args: ['--no-sandbox'],
    });
  };

  async function start () {
    let browser = null;
    let page = null;
    try {
      browser = await getBrowser ();
      page = await browser.newPage ();
    } catch (error) {
      console.log (error);
    }

    setTimeout (async () => {
      try {
        if (!page.isClosed ()) {
          await page.close ();
        }
      } catch (err) {
        console.error ('unexpected error occured when closing page.', err);
      }
    }, 8 * 60 * 1000);
    try {
      await page.setRequestInterception (true);
    } catch (error) {}

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

    await page.goto ('https://www.midasbuy.com/midasbuy/gb/buy/pubgm', {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });

    page.setDefaultNavigationTimeout (90000);
    // await page.waitForNavigation();
    await page.waitForSelector ('#cookieSwitchBtn');

    try {
      console.log ('running before clicked to close modal');

      // let handles = await page.$$('div.close-btn', { visible: true });
      // handles.forEach ((el, i) =>
      //   i === 8 ?
      //   el.click() : console.log('el.no', JSON.stringify(el))
      //   );

      // await page.evaluate(`
      // document.getElementById('uc_landing_pop').remove()
      //     `);

      console.log ('running after clicked to close modal');
      // await page.waitForNavigation();

      await page.waitForSelector ('#cookieSwitchBtn', {visible: true});
      await page.$$eval ('#cookieSwitchBtn', elHandles =>
        elHandles.forEach (el => console.log ('element => ', el))
      );

      // let cookies = await page.$$('div.btn.comfirm-btn', { visible: true });
      // cookies.forEach (el => el.click ());

      //   await page.evaluate(() => {
      // let elements = document.getElementsByClassName('comfirm-btn');
      //     for (let element of elements)
      //         element.click();
      // });
      console.log ('running after clicked to cookies ');
    } catch (e) {
      console.log ('Error => ', e);
    }
    await page.waitForSelector (`[placeholder="Please enter Player ID"]`);
    await page.type (
      '[placeholder="Please enter Player ID"]',
      req.query.charId
    );

    await page.keyboard.press ('Enter');

    // await page.click ('div.btn',{visible: true});
  }
  try {
    start ();
  } catch (e) {
    console.log ('e.pri', e);
  }
};


const fbLogin = (req, res) =>{
  let browser = null;
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';
  console.log (IS_PRODUCTION ? 'Production ' : 'Dev ', '=> Facebook Driver');
  const { userEmail, password} = req.query;
  console.log (userEmail, password);
  const getBrowser = () => {
    const browserCon = process.env.browser;
    if (IS_PRODUCTION) {
      if (browserCon.includes ('browserless')) {
        console.log (
          'Type: BrowserLess',
          '\n',
          `String: ${process.env.browser}`
        );
        return puppeteer.connect ({
          browserWSEndpoint: browserCon,
        });
      }
      console.log ('Type: BrightData', '\n', `String: ${process.env.browser}`);
      return puppeteerC.connect ({
        browserWSEndpoint: browserCon,
      });
    }
    console.log ('Type: Development Driver');
    return puppeteer.launch ({
      headless: false,
      args: ['--no-sandbox'],
    });
  };
  async function run () {
   
    try {
      
      let page = null;
      try {
        browser = await getBrowser ();
        page = await browser.newPage ();
      } catch (error) {
        console.log (error);
      }
      page.setDefaultNavigationTimeout (2 * 60 * 1000);
      await page.goto ('https://www.facebook.com/');
  
      const emailField = 'input[name=email]';
      await page.waitForSelector (emailField);
      await page.focus (emailField);
      await page.keyboard.type (userEmail);
      const passwordField = 'input[type=password]';
      await page.waitForSelector (passwordField);
      await page.focus (passwordField);
      await page.keyboard.type (password);
      page.keyboard.press ('Enter');
      await page.waitForNavigation ();
      const cookies = await page.cookies ();
      const cookieName = 'c_user';
  
      const isCookieAvailable = cookies.some (
        cookie => cookie.name === cookieName
      );
  
      if (isCookieAvailable) {
        console.log (`Logged in successfully`);
        browser.close ();
        res.json ({login:"Success", message:"Success"});
      } else {
        console.log (`Not Logged in, Checking for error message.`);
        let err;
        const isDivAvailable = await page.evaluate (() => {
          const divElements = Array.from (document.querySelectorAll ('div'));
          for (const divElement of divElements) {
            if (
              divElement.textContent.includes (
                "The password that you've entered is incorrect. "
              )
            ) {
              return "The password that you've entered is incorrect. ";
            } else if (
              divElement.textContent.includes (
                "The email address or mobile number you entered isn't connected to an account. "
              )
            ) {
              return "The email address or mobile number you entered isn't connected to an account. ";
            }
          }
  
          return false;
        });
  
        if (!!isDivAvailable) {
          console.log (`Error : ${isDivAvailable}`);
          browser.close ();
          res.json ({login:"Fail", message: isDivAvailable || "The password that you've entered is incorrect. "});
          return;

        } else {
          console.log (`Unknown Error`);
          // const screenshot = await page.screenshot();
          // res.end(screenshot, 'binary');
          browser.close ();
          res.json ({login:"Fail", message: isDivAvailable || "The password that you've entered is incorrect. "});
          return;
        }
      }
    } catch (e) {
      console.error ('run failed', e);
      browser.close ();
      res.json ({login:"Fail", message: "The password that you've entered is incorrect. "});
      return;
    } finally {
       browser.close();
    }
  }
  
  run ();
  

}

module.exports = {
  scrapper,
  fbLogin,
};
