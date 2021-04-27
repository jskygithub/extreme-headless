const extremeHeadless = require ( '../index' );

const initOptions = {
    baseUrl   : 'https://www.sec.gov',
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
}

( async () => {
    try {

        extremeHeadless.init ( initOptions );
        events ();  // setup event handlers

        await extremeHeadless.goto ( '/edgar/search/#/category=custom&forms=424B2', true );
        await extremeHeadless.waitFor( '.preview-file' );

        extremeHeadless.click( '.preview-file' );

        const openFileHref = extremeHeadless.find( '#open-file').getAttribute( 'href' );
        console.log( openFileHref );

    } catch ( e ) {
        console.log ( e );
    }

    extremeHeadless.shutdown ();

} ) ();




