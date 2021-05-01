const path = require("path");
const testFilePath = path.resolve('test.html');
const extremeHeadless = require ( '../index' );

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
    // baseUrl   : 'http://localhost:3000/',
    // use your own path
    baseUrl : `file:///${testFilePath}`,
    debug     : true,
    ignoreSSL : true,
    onAlert,
    onConfirm,
    runScripts: true

};


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
    })

    extremeHeadless.on( 'console', ( message ) => {
        console.log( message );
    })

    extremeHeadless.on( 'xhr', ( responseText, arguments ) => {
        console.log( arguments );
    })
}

( async () => {
    try {
        events();
        extremeHeadless.init ( initOptions );
        await extremeHeadless.goto ( '/', true );

        let obj = extremeHeadless.find( '#username');

        extremeHeadless.fillField( obj, 'someone@co.uk');

        obj = extremeHeadless.find( '#cb1').checked;
        console.log( obj );

        obj = extremeHeadless.find( '#cb1').checked = true;
        console.log( obj );

        const selectedIndex = extremeHeadless.find ( '#select1' ).selectedIndex;
        console.log( selectedIndex );

        extremeHeadless.find( '#select1').selectedIndex = 0;
        console.log( extremeHeadless.find( '#select1').selectedIndex );
        obj = extremeHeadless.find( '#select1');

        let values = '';
        for (let i = 0; i < obj.length; i++) {
            values += obj.options[i].value + '\n';
        }
        console.log(values);

        // show alert
        extremeHeadless.click( '#showAlert');

        // show confirm
        extremeHeadless.click( '#showConfirm');

    } catch ( e ) {
        console.log ( e );
    }

    extremeHeadless.shutdown ();

} ) ();





