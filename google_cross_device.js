// Google Search - Selenium Example Script
//See https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs for detailed instructions

var username = "Daniel.Giordano@smartbear.com"
var authkey = "uec63bb75f4dc429"

var webdriver = require('selenium-webdriver'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer,
    request = require('request');

var remoteHub = "http://" + username + ":" + authkey + "@hub.crossbrowsertesting.com:80/wd/hub";

//add multiple browsers to run in parallel here
var browsers = [
   //Desktop
   { browserName: 'safari', version: '9', platform: 'Mac OSX 10.11', screen_resolution: '1366x768' },
   { browserName: 'firefox', version: '55x64', platform: 'Windows 7 64-bit', screen_resolution: '1366x768' },
   { browserName: 'internet explorer', version: '11', platform: 'Windows 10', screen_resolution: '1366x768' },
   { browserName: 'MicrosoftEdge', version: '15', platform: 'Windows 10', screen_resolution: '1366x768' },
   //Mobile
   { browserName: 'Chrome', deviceName: 'Nexus 6P', platformVersion: '7.0', platformName: 'Android', deviceOrientation: 'portrait' },
   { browserName: 'Chrome', deviceName: 'Galaxy Tab 2', platformVersion: '4.1', platformName: 'Android', deviceOrientation: 'landscape' },
   { browserName: 'Safari', deviceName: 'iPad Pro Simulator', platformVersion: '9.3', platformName: 'iOS', deviceOrientation: 'landscape' }
];

var flows = browsers.map(function(browser) {
    return webdriver.promise.createFlow(function() {
      if (browser.version)
      {
          var caps = {
              name : 'Basic Demo - Desktop - Google Search',
              build :  '1.0',

              browserName : browser.browserName, // <---- this needs to be the browser type in lower case: firefox, internet explorer, chrome, opera, or safari
              version : browser.version,
              platform : browser.platform,
              screen_resolution : browser.screen_resolution,

              record_video : "true",
              record_network : "true",
              record_snapshot :  "false",

              username : username,
              password : authkey
          };
        }
        else
        {
          var caps = {
              name : 'Walgreens Demo - Mobile - Google Search',
              build :  '1.0',

              browserName : browser.browserName, // <---- this needs to be the browser type in lower case: firefox, internet explorer, chrome, opera, or safari
              deviceName : browser.deviceName,
              platformVersion : browser.platformVersion,
              platformName : browser.platformName,
              deviceOrientation : browser.deviceOrientation,

              record_video : "true",
              record_network : "true",
              record_snapshot :  "false",

              username : username,
              password : authkey
            };
          };


          var driver = new webdriver.Builder()
               .usingServer(remoteHub)
               .withCapabilities(caps)
               .build();

          //need sessionId before any api calls
          driver.getSession().then(function(session){

              var sessionId = session.id_;

              driver.get('http://www.google.com');
              var element = driver.findElement(webdriver.By.name('q'));
              element.sendKeys('cross browser testing');
              element.submit();
              driver.call(takeSnapshot, null, sessionId);
              driver.getTitle().then(function(title) {
                  if (title !== ('cross browser testing - Google Search')) {
                  }
              });
              driver.quit();
              driver.call(setScore, null, 'pass', sessionId);
          });
    });
});

webdriver.promise.fullyResolved(flows).then(function() {
    console.log('All tests passed!');
});

webdriver.promise.controlFlow().on('uncaughtException', function(err){
    console.error('There was an unhandled exception! ' + err);
});


//Call API to set the score
function setScore(score, sessionId) {

    //webdriver has built-in promise to use
    var deferred = webdriver.promise.defer();
    var result = { error: false, message: null }

    if (sessionId){

        request({
            method: 'PUT',
            uri: 'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId,
            body: {'action': 'set_score', 'score': score },
            json: true
        },
        function(error, response, body) {
            if (error) {
                result.error = true;
                result.message = error;
            }
            else if (response.statusCode !== 200){
                result.error = true;
                result.message = body;
            }
            else{
                result.error = false;
                result.message = 'success';
            }

            deferred.fulfill(result);
        })
        .auth(username, authkey);
    }
    else{
        result.error = true;
        result.message = 'Session Id was not defined';
        deferred.fulfill(result);
    }

    return deferred.promise;
}

//Call API to get a snapshot
function takeSnapshot(sessionId) {

    //webdriver has built-in promise to use
    var deferred = webdriver.promise.defer();
    var result = { error: false, message: null }

    if (sessionId){
        request.post(
            'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/snapshots',
            function(error, response, body) {
                if (error) {
                    result.error = true;
                    result.message = error;
                }
                else if (response.statusCode !== 200){
                    result.error = true;
                    result.message = body;
                }
                else{
                    result.error = false;
                    result.message = 'success';
                }
                //console.log('fulfilling promise in takeSnapshot')
                deferred.fulfill(result);
            }
        )
        .auth(username,authkey);
    }
    else{
        result.error = true;
        result.message = 'Session Id was not defined';
        deferred.fulfill(result); //never call reject as we don't need this to actually stop the test
    }
    return deferred.promise;
}
