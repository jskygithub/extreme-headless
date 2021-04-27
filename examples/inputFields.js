const extremeHeadless = require ( '../index' );
const domtoimage = require ( 'dom-to-image' );

const initOptions = {
    // baseUrl   : 'http://localhost:3000/',
    baseUrl : 'file:///home/james/WebstormProjects/extreme-headless/examples/test.html',
    debug     : true,
    ignoreSSL : true,
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

    } catch ( e ) {
        console.log ( e );
    }

    extremeHeadless.shutdown ();

} ) ();





