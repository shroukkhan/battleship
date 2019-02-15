import Logger from '../lib/logger';

describe('Logger Test Suite', () => {

    test('Should be able to Logger.log', () => {
        const fncOld = console.log;
        const fncTest = jest.fn();
        console.log = fncTest;
        Logger.log('Test/log', 'log me now');
        expect(fncTest).toHaveBeenCalled();
        console.log = fncOld;
    });

    test('Should be able to Logger.warn', () => {
        const fncOld = console.warn;
        const fncTest = jest.fn();
        console.warn = fncTest;
        Logger.warn('Test/warn', 'warn me now');
        expect(fncTest).toHaveBeenCalled();
        console.warn = fncOld;
    });

    test('Should be able to Logger.info', () => {
        const fncOld = console.log;
        const fncTest = jest.fn();
        console.log = fncTest;
        Logger.info('Test/info', 'info me now');
        expect(fncTest).toHaveBeenCalled();
        console.log = fncOld;
    });

    test('Should be able to Logger.error', () => {
        const fncOld = console.error;
        const fncTest = jest.fn();
        console.error = fncTest;
        Logger.error('Test/error', 'error me now');
        expect(fncTest).toHaveBeenCalled();
        console.error = fncOld;
    });
});
