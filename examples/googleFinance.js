const extremeHeadless = require ( '../index' );

const initOptions = {
    baseUrl   : 'https://www.google.com',
    debug     : true,
    strictSSL : true,
    runScripts: true

};

const events = () => {

    extremeHeadless.on( 'shutdown', () => {
        console.log( '** Shutdown event received. **');
    })

    extremeHeadless.on( 'aftergoto', () => {
        console.log( '** After goto. **');
    })

    extremeHeadless.on( 'console', ( message ) => {
        console.log( message );
    })

    extremeHeadless.on( 'xhr', ( xhrObject ) => {
        console.log( xhrObject.eventType, xhrObject.readyState, xhrObject.responseURL );
    })
}

( async () => {
    try {

        extremeHeadless.init ( initOptions );
        events ();  // setup event handlers

        await extremeHeadless.goto ( 'https://google.com/finance', true );
        const worldMarkets = extremeHeadless.find( 'div[data-tab-id="worldMarketNews"]');
        extremeHeadless.click( worldMarkets );
        console.log( worldMarkets.getAttribute( 'class' ))
        //await extremeHeadless.waitFor( '.preview-file' );
        //let x = EXH.docu
        //extremeHeadless.click( '.preview-file' );

        //const openFileHref = extremeHeadless.find( '#open-file').getAttribute( 'href' );
        //console.log( openFileHref );
        //extremeHeadless.shutdown ();

    } catch ( e ) {
        console.log ( e );
        extremeHeadless.shutdown ();
    }

   // extremeHeadless.shutdown ();

} ) ();




