import * as path from 'path';
import * as R from 'ramda';
import AppConfig from '../appConfig';
import Logger from './logger';
import Constants from './models/dateModels/constants';


export default class Utilities {

    public static getCharArray = (length: number, start?: number): string[] => {
        if (!start) {
            start = 0;
        }

        const alphabets = 'abcdefghijklmopqrstuvwxyza'.toUpperCase().split(''); // because writing an array is too much typing
        const slice = alphabets.slice(start, start + length);
        // Logger.log('Utilities.getCharArray', 'Start : ', start, 'Length : ', length, '\nalphabet:', alphabets, '\nslice', slice);
        return slice;
    }


    public static getNumberArray = (length: number, start?: number): number[] => {
        if (!start) {
            start = 0;
        }

        // @ts-ignore
        const numbers = Array(length + start + 1).join(0).split(0).map((v, i) => i + 1); // we want to start it from 1 , because thats easier for end user to understand
        const slice = numbers.slice(start, start + length);
        // Logger.log('Utilities.getNumberArray', 'Start : ', start, 'Length : ', length, '\nnumbers:', numbers, '\nslice', slice);
        return slice;
    }

    public static getShipCoordinates = (startingCoordinate: string,
                                        orientation: typeof Constants.ORIENTATION_HORIZONTAL | typeof Constants.ORIENTATION_VERTICAL,
                                        length: number): string[] => {
        startingCoordinate = startingCoordinate.toUpperCase();
        const x = startingCoordinate.charAt(0).charCodeAt(0) - 'A'.charCodeAt(0); // so A = 0 , B = 1 and so on

        const y = parseInt(startingCoordinate.substr(1), 10);

        if (orientation === Constants.ORIENTATION_HORIZONTAL) {
            return Utilities.getCharArray(length, x).map(v => `${v}${y}`);
        }


        const yArray = Utilities.getNumberArray(length, y - 1); // indexing starts at 0
        return yArray.map(v => `${startingCoordinate.charAt(0)}${v}`);

    }

    /**
     * Get root path containing the package.json , appConfig.ts , config.production.json etc
     * NOTE: Contains trailing slash ALREADY
     * @returns {string}
     */
    public static getBasePath = () => path.resolve(__dirname + '/../') + '/';


    /**
     * Used only in unit test to set the value of isUnitTest to test production state
     * @param {boolean} unitTest
     */
    public static setUnitTest(unitTest: boolean | undefined): void {
        Utilities.isUnitTest = unitTest;
    }

    public static setAppConfig(appConfig: typeof AppConfig | undefined): void {
        Utilities.appConfig = appConfig;
    }


    /**
     * Looks through program args and determines if it is running a test or production
     * @returns {boolean}
     */
    public static isRunningUnitTest(): boolean {
        if (typeof Utilities.isUnitTest === 'boolean') {
            return Utilities.isUnitTest;
        }
        let isTest = false;
        for (const arg of process.argv) {
            // console.log('arg is : ', arg);
            if (arg.indexOf('jest') !== -1) {
                Logger.warn('utilities.isRunningUnitTest', 'Detected to be unit test environment because of arg : ', arg);
                isTest = true;
                break;
            }
        }
        Logger.log('utilities.isRunningUnitTest', 'Is unit testing ?', isTest);
        this.isUnitTest = isTest;
        return isTest;
    }

    /**
     * Returns appConfig
     * @returns {typeof AppConfig}
     */
    public static getConfig(): typeof AppConfig {
        if (Utilities.appConfig) {
            return Utilities.appConfig;
        }

        if (Utilities.isRunningUnitTest()) {
            return AppConfig;
        }

        // there are two production environment , local ( sls_offline ) and on lambda
        const isSlsOffline = process.env.NODE_ENV === 'sls_offline';
        const configFileName = isSlsOffline ? 'config.sls_offline.json' : 'config.production.json';
        const filePath = `${__dirname}/../${configFileName}`;
        const fileContent = Utilities.fileGetContents(filePath);
        let config: typeof AppConfig = AppConfig;
        if (fileContent) {
            config = R.merge(config, JSON.parse(fileContent));
        }
        Logger.info('utilities.getConfig', 'Loaded config : ', config);
        Utilities.appConfig = config;
        return config;
    }


    private static appConfig?: typeof AppConfig;
    private static isUnitTest?;


}
