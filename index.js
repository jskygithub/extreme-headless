const events = require('events');
const eventEmitter = new events.EventEmitter();

/**
 * Handle event requests
 * @param name
 * @param callBack
 */
const handleEvent = ( name, callBack ) => {
    eventEmitter.addListener(name, callBack );
    _log( 'info', `Event listener: ${name} applied.` );
}

const ExtremeHeadless = require ( './ExtremeHeadless' );

const _log = ( level, message ) => {
    if ( !global.EXH ) {
        console.log ( `${ new Date ().toISOString () }-[${ level }]-${ message }` );
        return;
    }
    if ( EXH.options.debug ) {
        console.log ( `${ new Date ().toISOString () }-[${ level }]-${ message }` );
    }
};

// Functions are just wrappes around our core functions.

exports.click = ( selector ) => {
    return ExtremeHeadless._click ( selector );
};

exports.fillField = ( selector, value ) => {

    return ExtremeHeadless._fillField ( selector, value );

};

exports.find = ( selector ) => {

    return ExtremeHeadless._find ( selector );
};

exports.findAll = ( selector ) => {
    return ExtremeHeadless._findAll ( selector );
};

exports.findByName = ( name ) => {
    return ExtremeHeadless._findByName ( name );
};

exports.findLinkText = ( text, exact ) => {
    return ExtremeHeadless._findByLinkText ( text, exact );
};

/**
 * Goto a path (but could be full url)
 * @param path
 * @param wait.  Wait until loaded?
 * @returns dom.window
 */
exports.goto = async ( path, wait = false ) => {
    return ExtremeHeadless._goto( path, wait );
};


exports.waitFor = ( selector, maxWait ) => {
    return new Promise ( async ( resolve, reject ) => {
        const isFound = await ExtremeHeadless._waitFor ( selector, maxWait );
        return resolve (isFound);
    } );
};

/**
 *
 * @param options  baseURL....
 * @returns {Promise<void>}
 */
exports.init = ( options ) => {
    global.EXH = {
        dom: null,
        window: null,
        document: null,
        options: {
            ...options,
            baseUrl: options.baseUrl.replace ( /\/$/, '' ),
            timeout: options.timeout ? options.timeout : 5
        },
        eventEmitter,
        log    : _log,
        realPath: null,
    };

    ExtremeHeadless.jsdomResourceLoader.strictSSL = options.strictSSL ? true : false;
    ExtremeHeadless.userAgent = options.userAgent ? options.userAgent : ExtremeHeadless.userAgent;

    EXH.log ( 'info', 'Extreme Headless initialisied...' );
};

exports.on = ( name, callBack ) => handleEvent ( name, callBack );

exports.shutdown = () => {
    eventEmitter.emit( 'shutdown' );
    _log ( 'info', 'Extreme Headless Shutdown request.' );
    EXH.dom.window.close ();
    _log ( 'info', 'Extreme Headless Shutdown complete.' );
    return;
};