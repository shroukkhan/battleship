import {APIGatewayProxyEvent, Callback, Context, Handler} from 'aws-lambda';
import Db from '../db';
import ErrorCodes from '../errorCodes';
import Logger from '../logger';
import IAttackShip from '../models/dateModels/iAttackShip';
import IDeployShip from '../models/dateModels/iDeployShip';
import GameService from '../services/gameService';

/**
 * Endpoint: api/ - Get the current state of the ocean and the fleet.
 * Parameters: -
 * Response:
 *      - Return current state of the game including the ocean and the fleet, for debugging purpose
 * @param event
 * @param context
 * @param callback
 */
const get: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback): Promise<void> => {
    const fncName = 'apiController.get';
    Logger.info(fncName, '- Start - ', event);
    const response = {
        statusCode: 0, body: ''
    };
    try {
        const gameData = await GameService.getGameStatus();
        response.statusCode = 200;
        response.body = JSON.stringify(gameData);
    } catch (e) {
        response.statusCode = 400;
        response.body = e.message;
    }
    finally {
        await Db.closeConnection();
        Logger.info(fncName, '- Finish - ', response);
        callback(null, response);
    }
};

/**
 * Endpoint: api/reset - Reset the game to an initial state.
 * Response:
 *  - Return message “reset successfully”
 * @param event
 * @param context
 * @param callback
 */
const reset: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback): Promise<void> => {
    const fncName = 'apiController.reset';
    Logger.info(fncName, '- Start - ', event);
    const response = {
        statusCode: 0, body: {}
    };
    try {
        const gameId = await GameService.resetGame();
        if (gameId > 0) {
            response.statusCode = 200;
            response.body = 'reset successfully';
        }
        else {
            throw Error('Failed to reset game');
        }
    } catch (e) {
        response.statusCode = 400;
        response.body = e.message;
    }
    finally {
        await Db.closeConnection();
        Logger.info(fncName, '- Finish - ', response);
        callback(null, response);
    }
};

/**
 * Endpoint: api/ship - Place a single ship into the ocean
 * Parameters:
 * - ship-type.
 * - coordinate.
 * - ship direction (vertical or horizontal)
 * Response:
 *  - Return message ‘‘placed” follow with ship-type.
 *  - Return bad request when the ship placement does not allow or illegal.
 */
const ship: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback): Promise<void> => {
    const fncName = 'apiController.ship';
    Logger.info(fncName, '- Start - ', event);
    const response = {
        statusCode: 0, body: {}
    };
    try {
        const body = JSON.parse(event.body as string) as IDeployShip;
        const result = await GameService.deploy(body);
        if (result) {
            response.statusCode = 200;
            response.body = 'placed ' + body.shipType;
        }
        else {
            throw Error('Unknown Error');
        }
    } catch (e) {
        response.statusCode = 400;
        response.body = e.message;
    }
    finally {
        await Db.closeConnection();
        Logger.info(fncName, '- Finish - ', response);
        callback(null, response);
    }
};

/**
 * Endpoint: api/attack - Attack to a specific target on the ocean.
 * Parameters:
 * - coordinate.
 * Response:
 * The messages for each request will depend on the current game situation.
 * - Return unauthorized message when the fleet is not empty. (the player needs to place all ships
 * before start attacking)
 * - Return bad request when player attempt to attack any attacked coordinates.
 * - Return message based on game situation. (see the game rules section)
 */
const attack: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback): Promise<void> => {
    const fncName = 'apiController.attack';
    Logger.info(fncName, '- Start - ', event);
    const response = {
        statusCode: 0, body: {}
    };
    try {
        const body = JSON.parse(event.body as string) as IAttackShip;
        const attackResponse = await GameService.attack(body);
        if (attackResponse) {
            response.statusCode = 200;
            response.body = attackResponse.result;
        }
        else {
            throw Error('Unknown Error');
        }
    } catch (e) {
        response.statusCode = e.message === ErrorCodes.GAME_NOT_READY ? 401 : 400;
        response.body = e.message;
    }
    finally {
        await Db.closeConnection();
        Logger.info(fncName, '- Finish - ', response);
        callback(null, response);
    }
};

export {get, reset, ship, attack};
