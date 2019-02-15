import Utilities from '../lib/utilities';

describe('Utilities Test Suite', () => {

    beforeEach(() => {
        Utilities.setUnitTest(undefined);
        Utilities.setAppConfig(undefined); // reset it to prepare
    });

    test('Should determine running unit test', () => {
        expect(Utilities.isRunningUnitTest()).toBeTruthy();
    });

    test('Should determine running unit test again , and reuse code', () => {
        expect(Utilities.isRunningUnitTest()).toBeTruthy();
    });


    test('Should be able to get config for unit testing', () => {
        const config = Utilities.getConfig();
        expect(config).toBeTruthy();
        expect(config.isProduction).toBeFalsy();
    });

    test('Should be able to get config for production', () => {
        Utilities.setUnitTest(false); // set production
        const config = Utilities.getConfig();
        expect(config).toBeTruthy();
        expect(config.isProduction).toBeTruthy();

        // try to get it again..
        const config2 = Utilities.getConfig();
        expect(config2).toBeTruthy();
        expect(config2.isProduction).toBeTruthy();
    });


});
