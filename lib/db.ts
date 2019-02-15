import * as R from 'ramda';
import 'reflect-metadata';
import {createConnection, getConnection} from 'typeorm';
// tslint:disable-next-line
import {Connection} from 'typeorm/connection/Connection';
// tslint:disable-next-line
import {MysqlConnectionOptions} from 'typeorm/driver/mysql/MysqlConnectionOptions';
import appConfig from '../appConfig';
import Logger from './logger';
import Utilities from './utilities';

class Db {
    private connection?: Connection;

    /**
     * Close existing connection to database and cleanup any resources
     */
    public async closeConnection(): Promise<void> {
        try {
            if (this.connection && this.connection.isConnected) {
                await this.connection.close();
            }
        } catch (e) {
            Logger.warn('db.closeConnection', `Failed to close connection : ${e.message}`);
        }
    }

    /**
     * Open a connection to the database. If sychrnoize is used, it will force the database to sync with the entity files
     * @param synchronize
     */
    public async openConnection(synchronize?: boolean): Promise<Connection> {
        const fncName = 'Db.openConnection';

        try {
            this.connection = getConnection();
        } catch (e) {

            const connectionOption = Utilities.getConfig().db as MysqlConnectionOptions;
            const basePath = Utilities.getBasePath();
            const entities: string[] = [];
            if (connectionOption.entities) {
                for (const entity of connectionOption.entities) {
                    Logger.info(fncName, 'Adding entity : ', basePath + entity);
                    entities.push(basePath + entity);
                }
            }
            const migrations: string[] = [];
            if (connectionOption.migrations) {
                for (const migs of connectionOption.migrations) {
                    migrations.push(basePath + migs);
                }
            }
            const subscribers: string[] = [];
            if (connectionOption.subscribers) {
                for (const subs of connectionOption.subscribers) {
                    subscribers.push(basePath + subs);
                }
            }

            const connectionOptionsUpdated = R.merge(connectionOption, {
                entities,
                migrations,
                subscribers,
                logging: !global.__TEST__ && !appConfig.isProduction,
                synchronize: synchronize ? synchronize : false,
            });
            Logger.info(fncName, 'Creating connection with options : ', connectionOptionsUpdated);
            this.connection = await createConnection(connectionOptionsUpdated);
        }

        if (!this.connection.isConnected) {
            Logger.info(fncName, 'Attempting to open connection');
            await this.connection.connect();
            Logger.info(fncName, 'Connection established');
        } else {
            Logger.info(fncName, 'Connection was already opened');
        }


        return this.connection;
    }

    // tslint:disable-next-line
    public async populateInitialData(): Promise<void> {

    }


}

export default new Db();
