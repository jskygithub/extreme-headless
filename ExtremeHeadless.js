let dom;
let window;
const jsdom = require ( 'jsdom' );

// exports.userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36';
exports.userAgent ='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4449.0 Safari/537.36 Edg/91.0.838.3';
exports.jsdomResourceLoader = new jsdom.ResourceLoader ( {
                                                      strictSSL: false,
                                                      userAgent: exports.userAgent

                                                  } );
const virtualConsole = new jsdom.VirtualConsole ();

virtualConsole.on ( 'log', ( msg ) => {
    EXH.log ( 'CLIENT', msg );
    EXH.eventEmitter.emit ( 'console', msg );
} );

exports.jsdom_options = {
    resources               : exports.jsdomResourceLoader, // 'usable',
    runScripts              : 'dangerously',
    cookieJar               : new jsdom.CookieJar (),
    FetchExternalResources  : [ 'script' ],
    ProcessExternalResources: [ 'script' ],
    MutationEvents          : '2.0',
    virtualConsole,
    QuerySelector           : false,
    SkipExternalResources   : false
};

exports._body = () => {
    return EXH.dom.window.document.body.innerHTML;
};

exports._click = ( selector ) => {

    // selector or object ?
    let node = selector;
    if ( typeof selector === 'string' ) {
        node = exports._find ( selector );
    }
    node.dispatchEvent ( new EXH.dom.window.MouseEvent ( 'click', { bubbles: true } ) );
};

/**
 * Override XMLHTTP -- might be useful?
 * Override HREF -- JSDOM does not support navigation
 * Override window.alert.  Migt want to callback into client to 'wait' and respond.  (Do same for confirm?)
 *
 * @private
 */
exports._createObjects = () => {
    EXH.dom.body = exports._body ();
    EXH.window = EXH.dom.window;
    EXH.document = EXH.window.document;

    EXH.window.alert = ( message ) => {
        EXH.eventEmitter.emit ( 'alert', message );
        if ( EXH.onAlert ) {
            return EXH.onAlert( message );
        }
    };

    EXH.window.confirm = ( message ) => {
        EXH.eventEmitter.emit ( 'confirm', message );
        if ( EXH.onConfirm ) {
            return EXH.onConfirm( message );
        }
        return false;
    };

    // Override location.href
    const overrideLocation = JSON.parse( JSON.stringify( EXH.window.location )); // new obj

    Object.defineProperty ( overrideLocation, 'href', {
        configurable: true,
        get         : () => {
            EXH.log ( 'HREF', 'get href ' + EXH.realPath );
            return EXH.realPath;
        },
        set         : ( url ) => {
            EXH.log ( 'HREF', 'set href ' + EXH.realPath );
            return EXH.options.baseUrl ;
        }
    } );

    EXH.window.location = overrideLocation;

    const getXMLHttpObject = ( self, type ) => {
        return {
            readyState: self.readyState,
            responseText: self.responseText,
            responseURL: self.responseURL,
            eventType: type
        }
    };

    const xmlOriginal = EXH.window.XMLHttpRequest.prototype.open;

    EXH.window.XMLHttpRequest.prototype.open = function ( method, url, async, user, password ) {

        this.addEventListener ( 'load', function () {
            EXH.eventEmitter.emit ( 'xhr', getXMLHttpObject( this, 'load' ) );
        } );
        return xmlOriginal.apply ( this, [].slice.call ( arguments ) );
    };
    const xmlSend = EXH.window.XMLHttpRequest.prototype.send;
    EXH.window.XMLHttpRequest.prototype.send = function ( method, url, async, user, password ) {
        this.addEventListener('readystatechange', function() {
            EXH.eventEmitter.emit ( 'xhr', getXMLHttpObject( this, 'send' ) );
        });

        return xmlSend.apply ( this, [].slice.call ( arguments ) );
    };

};

exports._fillField = ( selector, value ) => {

    EXH.dom.window.addEventListener ( 'keydown', e => {

    } );

    // selector or object ?
    let node = selector;
    if ( typeof selector === 'string' ) {
        node = exports._find ( selector );
    }

    if ( !node ) {
        return;
    }

    node.focus ();
    node.value = value;
    // example keyboard events.   ignore for now
    // node.focus ();
    /*for ( let i = 0; i < 10; i++ ) {
        const event1 = new EXH.dom.window.KeyboardEvent ( 'keydown', { keyCode: 65, bubbles: true, isTrusted: true } );
        node.dispatchEvent ( event1 );
        var evt = EXH.dom.window.document.createEvent ( 'HTMLEvents' );
        evt.initEvent ( 'change', false, true ); // adding this created a magic and passes it as if keypressed
        node.dispatchEvent ( evt );
        console.log ( EXH.dom.window.document.getElementById ( 'username' ).value );

    }*/
    const tabKey = new EXH.dom.window.KeyboardEvent ( 'keydown', { keyCode: 9, bubbles: true } );
    node.dispatchEvent ( tabKey );

};

exports._find = ( selector ) => {
    return EXH.dom.window.document.querySelector ( selector );
};

exports._findAll = ( selector ) => {
    return EXH.dom.window.document.querySelectorAll ( selector );
};

exports._findByName = ( name ) => {
    return EXH.dom.window.document.getElementsByName( name );
};

exports._findByLinkText = ( text ) => {
    const linkArray = [];
    const links = exports._findAll( 'a' );
    links.forEach((entry) => {

        if ( entry.innerHTML.toLowerCase().indexOf( text.toLowerCase() ) > -1 ) {
            linkArray.push( entry );
        }

    });

    return linkArray;
};

/**
 * Goto a path (but could be full url)
 * @param path
 * @param wait.  Wait until loaded?
 * @returns dom.window
 */
exports._goto = async ( path, wait = false ) => {
    return new Promise ( async ( resolve, reject ) => {
        if ( path.startsWith ( 'http' ) ) {
            EXH.realPath = EXH.options.baseUrl + new URL ( path ).pathname;
        } else {
            EXH.realPath = EXH.options.baseUrl + path;
        }

        EXH.log ( 'info', `goto: ${ EXH.realPath }` );

        if ( EXH.realPath.startsWith( 'file') ) {
            let fileName = new URL ( EXH.options.baseUrl ).pathname;
            EXH.dom = await jsdom.JSDOM.fromFile( fileName, exports.jsdom_options);
        } else {
            EXH.dom = await jsdom.JSDOM.fromURL ( EXH.realPath, exports.jsdom_options );
        }

        exports._createObjects ();

        if ( wait ) {
            EXH.window.addEventListener ( 'load', function () {
                EXH.eventEmitter.emit ( 'aftergoto' );
                return resolve ( dom );
            } );
        } else {
            EXH.eventEmitter.emit ( 'aftergoto' );
            return resolve ( EXH.dom );
        }
    } );
};

/**
 * Wait for an element to appear.
 *
 * @param selector
 * @param maxWait
 * @returns {Promise<unknown>}
 * @private
 */
exports._waitFor = ( selector, maxWait = EXH.options.timeout * 1000 ) => {
    return new Promise ( async ( resolve, reject ) => {

        let isFound = false;
        const waitTime = 200;
        const iterations = maxWait * 1000 / waitTime;
        let count = 0;
        for ( ; ; ) {
            isFound = exports._find ( selector ) !== null;
            await exports._sleep ( waitTime );

            if ( isFound ) {
                break;
            }
            count++;
            if ( count > iterations ) {
                break;
            }
        }
        resolve ( isFound );
    } );
};

exports._sleep = ms => {

    return new Promise ( resolve => setTimeout ( resolve, ms ) );

};