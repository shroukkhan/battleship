export default class Logger {

    public static log(functionName: string, message: string, ...args): void {
        if (global.__TEST__) {
            console.log(`[DEBUG][${functionName}] ${message}`, ...args);
        }
        else {
            console.log(` [${functionName}] ${message}`, ...args);
        }
    }

    public static info(functionName: string, message: string, ...args): void {
        if (global.__TEST__) {
            console.log(`[INFO][${functionName}] ${message}`, ...args);
        }
        else {
            console.info(` [${functionName}] ${message}`, ...args);
        }

    }

    public static warn(functionName: string, message: string, ...args): void {
        if (global.__TEST__) {
            console.log(`[WARN][${functionName}] ${message}`, ...args);
        }
        console.warn(` [${functionName}] ${message}`, ...args);
    }

    public static error(functionName: string, message: string, ...args): void {
        if (global.__TEST__) {
            console.log(`[ERROR][${functionName}] ${message}`, ...args);
        }
        console.error(` [${functionName}] ${message}`, ...args);
    }
}


