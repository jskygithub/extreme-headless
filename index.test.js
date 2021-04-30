/**
 * @jest-environment node
 */

const extremeHeadless = require('./index');
const onConfirm = ( message ) => {
    return true;
};

const options = {
    baseUrl : 'file:///home/james/WebstormProjects/extreme-headless/examples/test.html',
    debug     : true,
    ignoreSSL : true,
    onConfirm,
    runScripts: true
};

describe('Test Extreme Headless', () => {

    beforeAll(() => {

    });

    it('Initialise.  Global object to be defined', async () => {
        extremeHeadless.init ( options );
        expect(EXH).toBeDefined();
    });

    it('Global object (DOM) to be defined', async () => {
        extremeHeadless.init ( options );
        expect(EXH.dom).toBeDefined();
    });

    it('Global object (WINDOW) to be defined', async () => {
        extremeHeadless.init ( options );
        expect(EXH.window).toBeDefined();
    });

    it('Global object (DOCUMENT) to be defined', async () => {
        extremeHeadless.init ( options );
        expect(EXH.document).toBeDefined();
    });

    it('Go to page.  Find username ID', async () => {
        extremeHeadless.init ( options );
        await extremeHeadless.goto ( '/', true );
        const username = extremeHeadless.find( '#username');
        expect ( username ).not.toBe(null);
    });

    it('Go to page.  Find all divs.', async () => {
        extremeHeadless.init ( options );
        await extremeHeadless.goto ( '/', true );
        const divs = extremeHeadless.findAll( 'div');
        expect ( divs.length ).toEqual( 1 );
    });

    it('Go to page.  Set value and check.', async () => {
        extremeHeadless.init ( options );
        await extremeHeadless.goto ( '/', true );
        const obj = extremeHeadless.find( '#username');
        extremeHeadless.fillField( obj, 'someone@co.uk');
        expect ( obj.value ).toEqual( 'someone@co.uk' );
    });


    it('Go to page.  Click and check client console message', async () => {
        extremeHeadless.init ( options );
        let consoleLog = null;
        extremeHeadless.on( 'console', ( message ) => {
            consoleLog =  message;
        })
        await extremeHeadless.goto ( '/', true );
        extremeHeadless.click( '#clickme');
        expect ( consoleLog ).toEqual ( 'changed by click' );
    });

    it('Go to page.  Click and check value', async () => {
        extremeHeadless.init ( options );
        await extremeHeadless.goto ( '/', true );
        const obj = extremeHeadless.find( '#username');
        extremeHeadless.click( '#clickme');
        expect ( obj.value ).toEqual( 'Changed by click' );
    });

    it('Go to page.  Click and check alert text', async () => {
        extremeHeadless.init ( options );
        let consoleLog = null;
        extremeHeadless.on( 'alert', ( message ) => {
            consoleLog =  message;
        })
        await extremeHeadless.goto ( '/', true );
        extremeHeadless.click( '#showAlert');
        expect ( consoleLog ).toEqual ( 'Hi from an alert!' );
    });

    it('Go to page.  Fire confirm and click OK.  Check console text', async () => {
        extremeHeadless.init ( options );
        let consoleLog = null;
        extremeHeadless.on( 'alert', ( message ) => {
            consoleLog =  message;
        })
        await extremeHeadless.goto ( '/', true );
        extremeHeadless.click( '#showConfirm');
        expect ( consoleLog ).toEqual ( 'You selected OK' ); // onConfirm handler (above) returns true
    });


});


