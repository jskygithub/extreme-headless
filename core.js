//
// add load( url)
//

const jsdom = require ( 'jsdom' );

const ehGlobals = require ( './globals' );

const DOMHelpers = require( './ExtremeHeadless');

let ehOptions = {};
let dom;
let window;
let document;

const resourceLoader = new jsdom.ResourceLoader ( {
                                                      strictSSL: false,
                                                      userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',

                                                  } );
const virtualConsole = new jsdom.VirtualConsole ();
virtualConsole.on ( 'log', ( msg ) => {
    _log ( 'CLIENT', msg  );
} );

const options = {
    resources : resourceLoader, // 'usable',
    //resources               : 'usable',
    runScripts              : 'dangerously',
    cookieJar               : new jsdom.CookieJar (),
    FetchExternalResources  : [ 'script' ],
    ProcessExternalResources: [ 'script' ],
    MutationEvents          : '2.0',
    virtualConsole,
    QuerySelector           : false
};

const baseUrl = 'https://bbc.co.uk';

const doWork = async () => {
    console.log ( 'Starting..' );

    let dom = await jsdom.JSDOM.fromURL ( baseUrl, options );
    let window = dom.window;

    console.log ( window );
    const sports = window.document.querySelector ( 'a[href="https://www.bbc.co.uk/sport"]' );
    // click it...
    //sports.click();
    dom = await jsdom.JSDOM.fromURL ( sports.getAttribute ( 'href' ), options );
    window = dom.window;

    //console.log ( window );
    console.log ( `cookie ${ window.document.cookie }` );
    //console.log ( window.document.body.innerHTML );
};

//doWork ();

const _log = ( level, message ) => {
    if ( ehOptions.debug ) {
        console.log ( `${ new Date ().toISOString () }-[${ level }]-${ message }` );
    }
};

const _body = () => {
    return dom.window.document.body.innerHTML;
};

const _createObjects = () => {
    dom.body = _body ();
    window = dom.window;
    document = window.document;
    //console.log ( `cookie: ${ document.cookie }` );
    window.alert = () => {
        console.log ( 'Alert ignored...' );
    };

    delete window.location;
    window.location = {};

    Object.defineProperty ( window.location, 'href', {
        configurable: true,
        get         : ( ) => {
            console.log ( 'get href' );
            return 'https://google.com';
        },
        set         : ( url ) => {
            console.log( 'set href' );
            console.log ( url );
            return 'https://google.com';
        }
    } );
};

/**
 * Ensure document is set before calling this
 *
 * @param realPath
 * @private
 */
const _updateCookies = ( realPath ) => {
    ehGlobals.cookies[ realPath ] = document.cookie;
};

const _updateHistory = ( realPath ) => {
    ehGlobals.history.push ( realPath );
};

exports.click = async ( selector ) => {
    document.querySelector ( selector )
            .dispatchEvent ( new window.MouseEvent ( 'click', { bubbles: true } ) );

    //var { window } = new JSDOM(htmlDoc, options);
    console.log ( window.myFunction );

};

exports.fillField = async ( selector, value ) => {
    debugger;
    const elements = await exports.findAll( selector );
    for ( let i = 0; i < 10; i++ ) {
        const event = new window.KeyboardEvent ( 'keydown', { keyCode: 30, bubbles: true } );
        const node = await exports.find ( selector );
        node.dispatchEvent ( event );
    }



   // console.log( elements );
}
exports.find = async ( selector ) => {
    return Promise.resolve ( document.querySelector ( selector ) );
};

exports.findAll = async ( selector ) => {
    return Promise.resolve ( document.querySelectorAll ( selector ) );
};

/**
 *
 * @param options  baseURL....
 * @returns {Promise<void>}
 */
exports.init = async ( options ) => {
    ehOptions = options;
    ehOptions.baseUrl = ehOptions.baseUrl.replace ( /,\s*$/, '' ); // remove last '/' if there
    _log ( 'info', 'Extreme Headless initialising...' );
    return Promise.resolve ( 'done' );
};

/**
 * Goto a path (but could be full url)
 * @param path
 * @returns dom.window
 */
exports.goto = async ( path, wait ) => {
    return new Promise ( async ( resolve, reject ) => {
        let realPath;
        if ( path.startsWith ( 'http' ) ) {
            const temp = new URL ( path );
            console.log ( temp.pathname );
            realPath = ehOptions.baseUrl + new URL ( path ).pathname;
        } else {
            realPath = ehOptions.baseUrl + path;
        }

        _log ( 'info', `goto: ${ realPath }` );
        dom = await jsdom.JSDOM.fromURL ( realPath, options );
        _createObjects ();
        _updateHistory ( realPath );
        _updateCookies ( realPath );
        window.addEventListener ( 'load', function () {
            resolve ( dom );
        } );
    } );
};

exports.shutdown = async () => {
    _log ( 'info', 'Shutdown' );
    dom.window.close ();
    return Promise.resolve ();
};