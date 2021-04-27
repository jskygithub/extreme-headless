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
}

( async () => {
    try {

        extremeHeadless.init ( initOptions );
        events ();  // setup event handlers

        // Search and wait
        await extremeHeadless.goto ( '/search?q=nodejs', true );

        // get the results
        await extremeHeadless.waitFor( '#result-stats', 10);

        const resultCount = extremeHeadless.find( '#result-stats').innerHTML;
        console.log( resultCount.substring( 0, resultCount.indexOf( 'results') + 'results'.length ));

        // get all links that have the text 'node' in them.  Search is always case-insensitive
        const allLinks = extremeHeadless.findLinkText('node');
        allLinks.forEach( entry => console.log(  entry.getAttribute('href') ));

        extremeHeadless.shutdown ();

    } catch ( e ) {
        console.log ( e );
        extremeHeadless.shutdown ();
    }



} ) ();




