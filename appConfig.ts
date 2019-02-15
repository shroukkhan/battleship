import * as R from 'ramda';

console.log('-- SYSTEM START : ' + process.env.NODE_ENV + ' --');

const isCircleCi = process.env.NODE_ENV === 'circleci';
const circleCiConfig = isCircleCi ? {
    host: 'battleship.ctmmz6dc2hbs.ap-southeast-1.rds.amazonaws.com',
    username: 'root',
    password: 'root0987',
} : {};


export default {
    isProduction: false, // checks if its a production system or unit testing environment
    pathBase: __dirname, // root path
    serviceName: 'BATTLESHIP',
    region: 'ap-southeast-1', // aws region

    gameConfig: {
        board: {
            x: 10,
            y: 10
        },
        shipCount: {
            BattleShip: 1,
            Cruiser: 2,
            Destroyer: 3,
            Submarine: 4,
        }
    },


    db: R.merge({ // basic typeorm db configuration https://github.com/typeorm/typeorm
        'type': 'mysql',
        'host': 'localhost',
        'port': 3306,
        'username': 'root',
        'password': 'root',
        'database': 'battleship',
        'synchronize': false,
        'logging': false,
        'entities': [
            'lib/models/entities/**/*.ts'
        ],
        'migrations': [
            'lib/models/migrations/**/*.ts'
        ],
        'subscribers': [
            'lib/models/subscribers/**/*.ts'
        ]
    }, circleCiConfig)
};
