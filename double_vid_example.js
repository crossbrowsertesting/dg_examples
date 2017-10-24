// Login Form and Todo App with separate videos - Selenium Test Example
// see https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs for details

var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
var request = require('request');
var remoteHub = 'http://hub.crossbrowsertesting.com:80/wd/hub';

var username = 'daniel.giordano@smartbear.com'; //replace with your email address 
var authkey = 'uec63bb75f4dc429'; //replace with your authkey 

var capabilities = {
    name : 'Login Form and Todo App with separate Videos - Selenium Test Example',
    build :  '1.0',
    browserName : 'Chrome', 
    version : 'Latest', 
    platform: 'Windows 10',
    screenResolution : '1366x768'
};

capabilities.username = username;
capabilities.password = authkey;

var sessionId = null,
    currentVideoHash = null;

//register general error handler
webdriver.promise.controlFlow().on('uncaughtException', webdriverErrorHandler);

console.log('Connection to the CrossBrowserTesting remote server');

var driver = new webdriver.Builder()
            .usingServer(remoteHub)
            .withCapabilities(capabilities)
            .build();

//console.log('driver is ', driver)



// All driver calls are automatically queued by flow control.
// Async functions outside of driver can use call() function.
// To get a feel for the order of execution the console.logs happen after each command is actually run
console.log('Waiting on the browser to be launched and the session to start');

driver.getSession().then(function(session){
    sessionId = session.id_; //need for API calls
    console.log('Session ID: ', sessionId); 
    console.log('See your test run at: https://app.crossbrowsertesting.com/selenium/' + sessionId)
});

/******** LOGIN PROCESS VIDEO ********/

//start recording video
driver.call(startRecordingVideo).then(function(){
    console.log('started video of LOGIN')
});

driver.call(setVideoDescription, null, 'Login Form test');

//load your URL
driver.get('http://crossbrowsertesting.github.io/login-form.html');

 //find checkout and click it 
driver.findElement(webdriver.By.id("username")).sendKeys("tester@crossbrowsertesting.com");

//send keys to element to enter text
driver.findElement(webdriver.By.xpath("//*[@type=\"password\"]")).sendKeys("test123");

//click the archive button
driver.findElement(webdriver.By.css("button[type=submit]")).click();

//wait on logged in message
driver.wait(webdriver.until.elementLocated(webdriver.By.id("logged-in-message")), 10000);

//start recording video
driver.call(stopRecordingVideo).then(function(){
    console.log('stopped video of LOGIN')
});




/******** TODO APP PROCESS VIDEO ********/

//start recording video
driver.call(startRecordingVideo).then(function(){
    console.log('started video of TODO APP')
});

driver.call(setVideoDescription, null, 'Todo App test');

//load your URL
driver.get('http://crossbrowsertesting.github.io/todo-app.html').then(function(){
    console.log('loaded URL')
});

//find checkout and click it 
driver.findElement(webdriver.By.name("todo-4")).click().then(function(){
    console.log('clicked todo-4')
});

//find checkout and click it 
driver.findElement(webdriver.By.name("todo-5")).click().then(function(){
    console.log('clicked todo-5')
});

//send keys to element to enter text
driver.findElement(webdriver.By.id("todotext")).sendKeys("Run your first Selenium Test").then(function(){
    console.log('entered text')
});

//click add button
driver.findElement(webdriver.By.id("addbutton")).click().then(function(){
    console.log('clicked add button')
});

//click the archive button
driver.findElement(webdriver.By.linkText("archive")).click().then(function(){
    console.log('clicked archive button')
});

//start recording video
driver.call(stopRecordingVideo).then(function(){
    console.log('stopped video of TODO APP')
});

//quit the driver
driver.quit()

//set the score as passing
driver.call(setScore, null, 'pass').then(function(result){
    console.log('set score to pass')
});


//Call API to set the score
function setScore(score) {

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
function takeSnapshot() {

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

//Call API to start a video
function startRecordingVideo() {

    //webdriver has built-in promise to use
    var deferred = webdriver.promise.defer();
    var result = { error: false, message: null }
    
    if (sessionId){

        request.post(
            'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/videos', 
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
                    result.message = body;

                    var videoResult = JSON.parse(body);
                    currentVideoHash = videoResult.hash;

                }
                //console.log('fulfilling promise in startVideo')
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

//Call API to stop a video
function stopRecordingVideo() {

    //webdriver has built-in promise to use
    var deferred = webdriver.promise.defer();
    var result = { error: false, message: null }
    
    if (sessionId){

       
        request.del(
            'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/videos/' + currentVideoHash, 
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

                    var videoResult = JSON.parse(body);
                    console.log('See video here: ' + videoResult.show_result_web_url)

                }
                //console.log('fulfilling promise in startVideo')
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

//Call API to set video notes/description
function setVideoDescription(text) {

    //webdriver has built-in promise to use
    var deferred = webdriver.promise.defer();
    var result = { error: false, message: null }
    
    if (sessionId){
       
        request.put({
                uri: 'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/videos/' + currentVideoHash, 
                body: {'description': text },
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

//general error catching function
function webdriverErrorHandler(err){

    console.error('There was an unhandled exception! ' + err);

    //if we had a session, end it and mark failed
    if (driver && sessionId){
        driver.quit();
        setScore('fail').then(function(result){
            console.log('set score to fail')
        })
        stopRecordingVideo();
    }
}
