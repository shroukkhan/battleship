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


});
