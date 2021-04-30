# About

End to end ("E2E") testing generally means automating the flow and actions that a 'real' user 
might take.  Of course, we must also examine the responses that the browser (app) produces to ensure that the app is performing properly.

There are plenty of excellent tools available for this.  However, there are also use cases that 
demand that we 'scrape' sites at runtime.  Some tools provide the ability to produce 
dom-like structures from raw HTML and these are useful.  However, in other cases, we want to
click on an element on the site, and have it respond -- just like our E2E automation tools do.  In other words, have the power
of our end-to-end testing tool available to us in a production environment.

But... there is usually a problem with this.

App servers and API servers generally lack the pre-requisite graphics capability to run browsers such as Webkit
which our E2E tools require.   

This is from Puppeteer's GITHUB project. [LINK](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)

Challenging? Yes and could be impossible to implement in your environment.

<hr />

## Installation

```nashorn js
npm install extreme-headless --save-dev
```

### Run tests

```bash
npm test
```
<hr />

## About this project

This project is about providing a level of programmatic interaction with a web page that mimics
the E2E tools we use.  The keyword here is 'level'. It is neither perfect nor complete.

## Capabilities

Extreme headless provides the following:

1. Navigation
1. Find by selector
1. Find all by selector
1. find by name (name=)
1. Find where link contains text
1. Click on an element
1. Set a value on an input field (input, checkbox, selects)
1. Wait for an element to appear on the page and specify a custom timeout
1. Be notified of XMLHTTPRequest open and send requests
1. Intercept and respond to window.confirm
1. Intercept window.alert

In addition, scripts on the page will be run - even on a click event.  For example, 

1. click a button.
1. the button fires a XMLHttpRequest.
1. Data is retrieved and the DOM updated.
   
This will work.

## Event support

Extreme headless provides event support that allows you to hook into the following events.

1. aftergoto. After navigation is complete
1. console. All console.log events from the client site are returned
1. xhr.  XHR events open and send are passed including readyState, responseText and responseURL.
1. alert
1. confirm
1. shutdown

## Example of event handling

```javascript

const events = () => {

    extremeHeadless.on( 'shutdown', () => {
        console.log( '** Shutdown event received. **');
    })

    extremeHeadless.on( 'aftergoto', () => {
        console.log( '** After goto. **');
    })

    extremeHeadless.on( 'alert', ( message ) => {
        console.log( message );
    })

    extremeHeadless.on( 'confirm', ( message ) => {
        console.log( message );
       // return true for OK, false for cancel
    })

    extremeHeadless.on( 'console', ( message ) => {
        console.log( message );
    })

    extremeHeadless.on( 'xhr', ( responseText, arguments ) => {
        console.log( arguments );
    })
}

```

## Alert and Confirm intercept

```javascript

/**
 * Alert callback
 * @param message
 */
const onAlert = ( message ) => {
    // anything to do?
};


/**
 * onConfirm callback.
 * @param message
 * @returns {boolean} true = ok, false = cancel
 */
const onConfirm = ( message ) => {
    return true; // same as the user clicking 'ok'
};
```

## API

First, you need to initialise Extreme headless.  It accepts an options object.

```javascript
const extremeHeadless = require ( '../index' );

const initOptions = {
    baseUrl   : 'https://www.google.com',
    strictSSL : true,
    onAlert, // <== Optional
    onConfirm, // <== Optional
    runScripts: true, // Enable JavaScript to run on fetched page
    userAgent: 'user agent string' // optional
    // default UA is:
    // Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4449.0 Safari/537.36 Edg/91.0.838.3

};

extremeHeadless.init ( initOptions );
```

Now, we can navigate to a page.  Here, I am just going to perform a search using Google.

```javascript
// Search and wait
await extremeHeadless.goto ( '/search?q=nodejs', true );
```

This goes to the Google search page and waits until the page has loaded.

Just to ensure we have the results, we can use the waitFor element API and wait for a maximum of 10 seconds.


```javascript
// get the results
await extremeHeadless.waitFor( '#result-stats', 10);
```

Google has a div with an ID called ```result-stats```.  Now, we get a list of all links that contain the word 'node'.  This is done via this
API call.

```javascript
const allLinks = extremeHeadless.findLinkText('node');
```

We can then iterate through all links and use that info in any way we want.

Here, I just log the href.
```javascript
 allLinks.forEach( entry => console.log(  entry.getAttribute('href') ));
```

# API Documentation

| API | Parameters | Returns | 
| ----------- | ----------- | ----------- |
| click | P1 -> HTMLElement or CSS Selector
| fillField | P1 -> HTMLElement or CSS Selector, P2 -> Value
| find | P1 -> CSS Selector | HTMLElement or null if not found
| findAll | P1 -> CSS Selector | HTMLElement <NodeList> or null if not found
| goto | P1 -> Relative path (/pathtopage), P2 (optional) -> wait (default is false.  | Promise -- use with await
| init | P1 -> options object |
| waitFor | P1 -> CSS Selector P2 (optional) -> Timeout value in seconds |


<hr />

## API Examples

### init

This is always the first call.  It expects an options object.

Example:

```javascript


/**
 * Alert callback
 * @param message
 */
const onAlert = ( message ) => {
    // anything to do?
};


/**
 * onConfirm callback.
 * @param message
 * @returns {boolean} true = ok, false = cancel
 */
const onConfirm = ( message ) => {
    return true; // click 'OK'
};

const initOptions = {
    baseUrl   : 'https://www.google.com',
    strictSSL : true,
    onAlert, // alert callback
    onConfirm, // confirm callback
    runScripts: true // Enable JavaScript to run on the fetched page

};
```

| Option | Parameters | 
| ----------- | ----------- | 
| baseUrl | Self-explanatory
| debug | P1 -> HTMLElement or CSS Selector, P2 -> Value
| strictSSL | Used to ignore invalid certificates
| runScripts | Used to run scripts inside the page tat has been loaded
| timeout | Used by te waitFor API.  How long to with for an element (in seconds) before timing out.


### Click

Click an element.  Just like a user would.

Find an element, then click

```javascript
const sportsNews = extremeHeadless.find( 'div[data-tab-id="sportsNews"]');
extremeHeadless.click( sportsNews );
```

Click using a selector


```javascript
extremeHeadless.click( 'div[data-tab-id="sportsNews"]' );
```

### fillField

Used to provide an input field with a value.

As with click, you can provide a CSS selector, or HTMLElement. 

```javascript
let obj = extremeHeadless.find( '#username');
extremeHeadless.fillField( obj, 'someone@co.uk');
```

or...

```javascript
let obj = extremeHeadless.find( '#username');
extremeHeadless.fillField( '#username', 'someone@co.uk');
```

### find

Find returns the HTMLElement that matches a CSS selector or null if not found.

```javascript
const sportsNews = extremeHeadless.find( 'div[data-tab-id="sportsNews"]');
```

### findAll

Similar to find but will return all matches of the CSS selector

```javascript
const allDivs = extremeHeadless.fnidAll( 'div'); // find all divs

if ( allDivs ) {
    allDivs.forEach ( ( entry ) => {
        // do something...
    } )
}
```

### goto

**goto** simply goes to a page.  It can be relative path (i.e. relative to the baseURL you supply in the options object
when you initialise extremeHeadless.)

Or, if can be a fully qualified URL (https://new.site.com)

The second parameter indicates whether you want to wait for the page to complete loading before returning.

```javascript
// https://oogle.com has been provided in the options object.
await extremeHeadless.goto ( '/finance', true ); // go and wait
```

or...

```javascript
await extremeHeadless.goto ( 'https://google.com/finance', true );
```

### waitFor

This API will inspect the page and look for an element. If it is not found, it 
continues to check for a maximum of ```timeout``` seconds.  The default timeout is specified in the options object
when you call init.  You can (optionally) override that here.

```javascript
await extremeHeadless.waitFor( '.preview-file', 5 );  // timeout after 5 seconds.
```

### Checkboxes and Selects

We saw above how to set a value on an input field.  Checkboxes and selects are similar.

Determine if a checkbox is 'checked'.

```javascript
if ( extremeHeadless.find( '#cb1').checked ) {
    console.log( 'is checked');
} else {
    console.log( 'is not checked');
}

```
**Check it**

```javascript
extremeHeadless.find( '#cb1').checked = true;
```

**Uncheck it**

```javascript
extremeHeadless.find( '#cb1').checked = false;
```

Get the selectedIndex of a select

```html
<select id="select1">
    <option value="val1">Value1</option>
    <option value="val2">Value2</option>
    <option value="val3" selected>Value3</option>
    <option value="val4">Value4</option>
</select>
```    
```javascript
console.log(  extremeHeadless.find( '#select1').selectedIndex ); // yields 2
```

Iterate though a select

Given the HTML above...

```javascript
 obj = extremeHeadless.find( '#select1');
let values = [];

for (let i = 0; i < obj.length; i++) {
    values.push( obj.options[ i ].value );
}
console.log(values);
```
This yields ```[ 'val1', 'val2', 'val3', 'val4' ] ```

And, if you wanted the 'text' of the select...

```javascript
values = [];
for (let i = 0; i < obj.length; i++) {
    values.push( obj.options[ i ].text );
}
console.log(values);
```

This yields ```[ 'Value1', 'Value2', 'Value3', 'Value4' ] ```

<hr />

# Summary
As you can see, this is no different from doing what you probably do today when inspecting HTML elements with Javascript.

Simply get an element via find/findAll and operate on it the way you normally would using the same attributes (innerHTML...) as you do now. 
Or the same function calls such as click();

See the examples folder for runnable code.

<hr />

# Acknowledgements

This project is built on top of JSDOM.  A great piece of work. 

[JSDOM on Github](https://github.com/jsdom/jsdom)
