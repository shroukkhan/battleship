import * as R from 'ramda';
import Db from '../db';
import ErrorCodes from '../errorCodes';
import Logger from '../logger';
import {BattleShip} from '../models/dateModels/battleShip';
import Constants from '../models/dateModels/constants';
import {Cruiser} from '../models/dateModels/cruiser';
import {Destroyer} from '../models/dateModels/destroyer';
import IAttackShip from '../models/dateModels/iAttackShip';
import IDeployShip from '../models/dateModels/iDeployShip';
import IGame from '../models/dateModels/iGame';
import {IShip} from '../models/dateModels/iShip';
import {Submarine} from '../models/dateModels/submarine';
import {GameEntityModel} from '../models/entities/gameEntityModel';
import {ShipEntityModel} from '../models/entities/shipEntityModel';
import {ShotEntityModel} from '../models/entities/shotEntityModel';
import Utilities from '../utilities';

/**
 * Implementation of game logic
 */
class GameService {


    /**
     * This function marks all games that are NEW or IN_PROGRESS as ABANDONED ( but leaves the GAME_OVER games alone )
     * And create a new game
     * The purpose of this function is that, we allow only a single running game in this project for now
     * Returns the new game id on success . 0 if its a failure
     * @return number
     */
    public async resetGame(): Promise<number> {
        const fncName = 'GameService.reset';
        let result = 0;
        try {

            const gameConfig = Utilities.getConfig().gameConfig;
            Logger.log(fncName, 'Obtained game config : ', gameConfig);

            if (gameConfig.board.x > 26 || gameConfig.board.y > 26) {
                throw Error('Invalid game config');
            }


            const textArray = Utilities.getCharArray(gameConfig.board.x); // x
            const numberArray = Utilities.getNumberArray(gameConfig.board.y); // y
            const gameBoard: string[][] = [];
            for (let y = 0; y < numberArray.length; y++) {
                gameBoard.push(textArray.map(v => `${v}${numberArray[y]}`));
            }
            Logger.log(fncName, 'Game board generated :\n', gameBoard);


            const connection = await Db.openConnection();

            // Mark any incomplete ( NEW or IN_PROGRESS ) games as ABDANDONED. The reason is that we support only one on going game
            await connection.createQueryBuilder()
                .update(GameEntityModel)
                .set({gameState: 'ABANDONED'})
                .where('gameState = :newState OR gameState = :inProgressState', {
                    newState: 'NEW',
                    inProgressState: 'IN_PROGRESS'
                })
                .execute();

            let newGame = new GameEntityModel();
            newGame.board = JSON.stringify(gameBoard);
            newGame = await connection.manager.save(newGame);

            Logger.info(fncName, 'New game successfully created : ', newGame);

            result = newGame.id;

        } catch (e) {
            Logger.error(fncName, 'Failed with error : ', e.message);
        }
        return result;
    }

    /**
     * Get the currently running game. Its always the one created last ( i.e with highest ID )
     */
    public async getGame(): Promise<GameEntityModel> {
        const connection = await Db.openConnection();
        return connection.manager.findOneOrFail(GameEntityModel, {order: {id: 'DESC'}});
    }

    /**
     * Get current game status
     * It will also return a string of game co-ordinates which
     * superimposes the ships and fired shots onto itself for easy debugging
     *              - Regular CoOrdinates ( like A1 , A2 ) indicates non-tempared positions ( no ship or shot )
     *              - Ships are indicated with a square brackade around the coordinate ( like [A1] , [A2] )
     *              - Miss fire shots are indicated with  [M]
     *              - Hit shots are indicated with [H]
     */
    public async getGameStatus(): Promise<IGame> {


        const fncName = 'GameService.getGameStatus';

        const gameConfig = Utilities.getConfig().gameConfig;
        Logger.log(fncName, 'Attempting to find game : ');
        const game = await this.getGame();

        const board1D: string[] = R.flatten(JSON.parse(game.board));
        // now replace cells based on shots OR ship placements
        const shipCoordinates: string[] = R.flatten(game.ships.map(ship => JSON.parse(ship.coordinates).map(coord => coord)));
        const shotCoordinates: string[] = R.flatten(game.shots.map(shot => shot.coordinate));
        Logger.log(fncName, 'Ships & Shots are at : ', shipCoordinates, shotCoordinates);
        board1D.forEach((coord, index, arrayItself) => {
            const coordExistsInShots = shotCoordinates.indexOf(coord) !== -1;
            const coordExistsInShips = shipCoordinates.indexOf(coord) !== -1;

            let replace = coord;
            // if the element exists in both shot and ship , it was a hit , replace with [ELEMENT][x]
            if (coordExistsInShots && coordExistsInShips) {
                replace = `[H]`;
            }
            // if element exists only in shot,  but not in ship , it was a miss
            else if (coordExistsInShots) {
                replace = '[M]';
            }
            // if element exists only in ship,  but not in shot , its a floater
            else if (coordExistsInShips) {
                replace = `[${coord}]`;
            }

            replace = replace.padStart(5);

            // if the element was does not exist anywhere else, it was not touched
            // replace = . , which we did earlier

            arrayItself[index] = replace;
        });

        const board2D: string[][] = [];
        const printableBoardArray1D: string[] = [];
        while (board1D.length) {
            const aRow = board1D.splice(0, gameConfig.board.x);
            board2D.push(aRow.map(r => r.trim()));
            printableBoardArray1D.push(aRow.join('\t'));
        }

        const printableBoard = printableBoardArray1D.join('\n');

        Logger.log(fncName, 'Current Game board looks like :\n' + printableBoard);

        const gameState: IGame = {
            gameId: game.id,
            ships: game.ships.map(s => {
                return {
                    shipType: s.shipType,
                    health: s.health,
                    coordinates: JSON.parse(s.coordinates) as string[]
                };
            }),
            shots: game.shots.map(s => {
                return {
                    coordinate: s.coordinate,
                    result: s.result
                };
            }),
            gameBoard: board2D,
            gameBoardString: printableBoard,
            gameStatus: game.gameState
        };
        Logger.info(fncName, 'Current game state is : ', gameState);
        return gameState;

    }


    /**
     * Attempts to deploy a ship at the given co-ordinate.
     * It is done in the following steps:
     *  1. Check if the game can be played , game status must be NEW or IN_PROGRESS
     *  2. Check if the ship can actually be deployed.
     *                2.1 Check ship type ( dont allow unknown type )
     *                2.2 Check how many ship of same type already deployed ( we must not be
     *                    allowed to deploy 2 battleship when only 1 is allowed ! )
     *                2.3 Check given ship's co-ordinate
     *                      2.3.1 Co-ordinate must fall within the game board
     *                      2.3.2 There must be atleast 1 cell distance between the newly
     *                            deployed ship and other ships that are already deployed.
     *  3. Deploy the ship
     *        3.1 When deploying, we calculate the padding area (  1 cell in every direction )
     *            as well. No other ships can be deployed in this area in future. The purpose
     *            of calculating it preemptive is that we don't need to repeatedly calculate
     *            for every ship in future when deploying
     * @param   {IDeployShip}               Object of Deploy command
     * @returns {Promise<boolean>}          True if successful
     * @throws  {GAME_NOT_READY}            If condition 1 is not fulfilled
     * @throws  {INVALID_SHIP_TYPE}         If condition 2.1 or 2.2 are not fulfilled
     * @throws  {INVALID_SHIP_COORDINATE}   If condition 2.3.1 or 2.3.2 are not fulfilled
     */
    public async deploy(deployCommand: IDeployShip): Promise<boolean> {
        const fncName = 'GameService.deploy';

        const connection = await Db.openConnection();
        const game = await this.getGame();

        // ------------------------------------------------
        // 1. Check if the game can be played , game status must be NEW or IN_PROGRESS
        // ------------------------------------------------
        if (['NEW', 'IN_PROGRESS'].indexOf(game.gameState) === -1) {
            throw Error(ErrorCodes.GAME_NOT_READY);
        }

        // ------------------------------------------------
        // 2. Check if the ship can actually be deployed.
        // ------------------------------------------------
        const ship = new ShipEntityModel();

        let shipDetail: IShip | undefined;
        if (deployCommand.shipType === Constants.BATTLE_SHIP) {
            shipDetail = new BattleShip();
        }
        else if (deployCommand.shipType === Constants.DESTROYER) {
            shipDetail = new Destroyer();
        }
        else if (deployCommand.shipType === Constants.CRUISER) {
            shipDetail = new Cruiser();
        }
        else if (deployCommand.shipType === Constants.SUBMARINE) {
            shipDetail = new Submarine();
        }

        // ------------------------------------------------
        // 2.1 Check ship type ( dont allow unknown type )
        // ------------------------------------------------
        if (!shipDetail) {
            throw Error(ErrorCodes.INVALID_SHIP_TYPE); // typescript prevents us from testing this line!
        }

        // -----------------------------------------------------------------------
        //  2.2 Check how many ship of same type already deployed ( we must not be
        //      allowed to deploy 2 battleship when only 1 is allowed ! )
        // -----------------------------------------------------------------------
        const gameConfig = Utilities.getConfig().gameConfig;
        const sameTypeOfShipsDeployed = (game.ships.filter(s => s.shipType === deployCommand.shipType)).length;
        Logger.log(fncName, 'Total number of already deployed : ' + deployCommand.shipType + ' is : ', sameTypeOfShipsDeployed, ' max allowed is : ', gameConfig.shipCount[deployCommand.shipType]);
        if (sameTypeOfShipsDeployed >= gameConfig.shipCount[deployCommand.shipType]) {
            throw Error(ErrorCodes.INVALID_SHIP_TYPE);
        }


        // ------------------------------------------------
        //  2.3 Check given ship's co-ordinate
        // ------------------------------------------------
        Logger.log(fncName, 'Attempting to place ship : ', shipDetail, ' on the board at ' + deployCommand.coordinate);

        // these are the co-ordinates the ship is going to occupy
        const shipCoordinates = Utilities.getShipCoordinates(deployCommand.coordinate, deployCommand.orientation, shipDetail.length);

        Logger.log(fncName, 'Ship co-ordinate is : ', shipCoordinates);

        const gameBoard2D = JSON.parse(game.board);
        const gameBoard1D = R.flatten(gameBoard2D); // for easy calculation of intersection


        // Validate placement . We shall start with the simplest and go to most complex.
        // to make sure this is done in the fastest manner ( i.e. throw error early )
        // ------------------------------------------------
        //   2.3.1 Co-ordinate must fall within the game board
        //
        //         To do this, we check the intersection of ship co-ordinate with the board
        //         array. if the intersection has the same as the ship cordinate , it means
        //         all points are within the board
        // ------------------------------------------------
        const interSection = R.intersection(shipCoordinates, gameBoard1D);
        let isValidDeploy = R.equals(interSection, shipCoordinates);

        if (!isValidDeploy) {
            Logger.warn(fncName, 'Ship co-ordinate falls outside the board');
            throw Error(ErrorCodes.INVALID_SHIP_COORDINATE);
        }


        // ------------------------------------------------
        //    2.3.2 There must be atleast 1 cell distance between the newly
        //          deployed ship and other ships that are already deployed.
        //
        //         To do this, we shall check if the ship's co-ordinates intersect with
        //         any other already placed ships padding zone ( buffer area )
        const otherShips = game.ships;
        for (let i = 0; i < otherShips.length; i++) {

            const blockedCells1D: string[] = R.flatten(JSON.parse(otherShips[i].blockedCells));
            const tooClose = R.intersection(shipCoordinates, blockedCells1D);


            isValidDeploy = tooClose.length === 0;
            if (!isValidDeploy) {
                Logger.warn(fncName, 'Ship is too close to existing ship : ', otherShips[i], 'collision at : ', tooClose);
                throw Error(ErrorCodes.INVALID_SHIP_COORDINATE);
            }
        }

        // if we have reached at this point without throwing error, it means we are good to go
        // ------------------------------------------------
        // 3. Deploy the ship
        // ------------------------------------------------

        ship.coordinates = JSON.stringify(shipCoordinates);
        ship.shipType = deployCommand.shipType;
        ship.game = game;
        ship.health = shipDetail.length;

        // ----------------------------------------------------------------------------------
        // 3.1 When deploying, we calculate the padding area (  1 cell in every direction )
        //     as well. No other ships can be deployed in this area in future. The purpose
        //     of calculating it preemptive is that we don't need to repeatedly calculate
        //     for every ship in future when deploying
        // -----------------------------------------------------------------------------------

        // calculate the padding area for this ship
        const startX = parseInt(shipCoordinates[0].substr(1), 10) - 1;
        const startY = shipCoordinates[0].charAt(0).charCodeAt(0) - 'A'.charCodeAt(0);

        const endX = shipCoordinates.length > 1 ? parseInt(shipCoordinates[shipCoordinates.length - 1].substr(1), 10) - 1 : startX;
        const endY = shipCoordinates.length > 1 ? shipCoordinates[shipCoordinates.length - 1].charAt(0).charCodeAt(0) - 'A'.charCodeAt(0) : startY;

        Logger.log(fncName,
            'Ship start :', {startX, startY, e: gameBoard2D[startX][startY]},
            ' end : ', {endX, endY, e: gameBoard2D[endX][endY]},);


        // calculate padded area by calculating a game board

        const paddingStartX = startX - 1;
        const paddingStartY = startY - 1;


        const height = deployCommand.orientation === Constants.ORIENTATION_HORIZONTAL ? 3 : shipCoordinates.length + 2;
        const width = deployCommand.orientation === Constants.ORIENTATION_HORIZONTAL ? shipCoordinates.length + 2 : 3;

        Logger.log(fncName,
            'Padding start :', {
                paddingStartX,
                paddingStartY,
                height,
                width,
            },
        );
        try {
            Logger.log(fncName,
                'Element', gameBoard2D[paddingStartX][paddingStartY]
            );
        } catch (e) {
            Logger.log(fncName, 'Edge detected');
        }

        const paddingArea: string[][] = [];
        for (let i = paddingStartX; i < height + paddingStartX; i++) {
            const row: string[] = [];
            for (let j = paddingStartY; j < width + paddingStartY; j++) {
                if (gameBoard2D[i] && gameBoard2D[i][j]) {
                    row.push(gameBoard2D[i][j]);
                }
            }
            if (!R.isEmpty(row)) {
                paddingArea.push(row);
            }
        }

        Logger.log(fncName, 'Padding zone Generated : ', paddingArea);


        ship.blockedCells = JSON.stringify(paddingArea);
        await connection.manager.save(ship);

        game.ships.push(ship);

        game.gameState = 'IN_PROGRESS'; // if the first ship is deployed, the game is already in progress

        await game.save();

        return isValidDeploy;

    }

    /**
     * Attempts to attack a co-ordianate.
     * The attack is done in following steps:
     *  1. Check if game is ready
     *          1.1 Game state must be IN_PROGRESS
     *          1.2 all ships must be deployed
     *  2. Check if the given co-ordinate can be attacked
     *          2.1 Co-ordinate must fall within the game board
     *          2.2 Co-ordinate must not have been attacked already
     *  3. Perform attack and calculate result
     *          3.1 If it DOES NOT fall on one of the ships co-ordinate, its a MISS
     *          3.2 If it falls on one of the ships co-ordinate, its a HIT , mark the game and decrement the ships health
     *              3.2.1 If it was a HIT , it might sink the ship if it was on last health already ( so now health = 0 means sunk )
     *              3.2.1 If was a HIT+SINK, it might mean a GAME_OVER if this was the last health of the last ship. calculate game health
     *
     * @param {IAttackShip} Object of type IAttackShip
     * @returns {Promise<{
     *     result: One of HIT,MISS,SINK
     *     message   : Only available if it was a SINK or GAME_OVER , provides the ship type that was just sunk , or game over
     * }>}
     *
     * @throws  {GAME_NOT_READY}                If condition 1.1 is not fulfilled
     * @throws  {INVALID_ATTACK_COORDINATE}     If condition 2.1 or 2.2 are not fulfilled
     */
    public async attack(attackCommand: IAttackShip): Promise<{ result: 'HIT' | 'MISS' | 'SINK', message?: 'GAME_OVER' | string }> {
        const fncName = 'GameService.attack';

        const gameConfig = Utilities.getConfig().gameConfig;
        const connection = await Db.openConnection();

        const game = await this.getGame();

        // ------------------------------------------------
        // 1. Check if game is ready
        // ------------------------------------------------

        // ------------------------------------------------
        // 1.1 Game state must be IN_PROGRESS
        // ------------------------------------------------
        if (game.gameState !== 'IN_PROGRESS') {
            throw Error(ErrorCodes.GAME_NOT_READY);
        }

        // ------------------------------------------------
        // 1.2 all ships must be deployed
        // ------------------------------------------------
        const ships = game.ships;
        const shipCount = {
            BattleShip: 0,
            Destroyer: 0,
            Cruiser: 0,
            Submarine: 0,
        };
        for (let i = 0; i < ships.length; i++) {
            shipCount[ships[i].shipType]++;
        }

        if (!R.equals(shipCount, gameConfig.shipCount)) {
            Logger.warn(fncName, 'Game is not ready, current ship count is : ', shipCount, 'required ship count is : ', gameConfig.shipCount);
            throw Error(ErrorCodes.GAME_NOT_READY);
        }


        // ------------------------------------------------
        // 2. Check if the given co-ordinate can be attacked
        // ------------------------------------------------

        // ------------------------------------------------
        // 2.1 Co-ordinate must fall within the game board
        // ------------------------------------------------
        const board2D = JSON.parse(game.board);
        const board1D = R.flatten(board2D); // for easy calculation of array index
        if (board1D.indexOf(attackCommand.coordinate) === -1) {
            console.warn(fncName, 'Attempting to attack a coordinate outside the board : ', attackCommand.coordinate);
            throw Error(ErrorCodes.INVALID_ATTACK_COORDINATE);
        }

        // ------------------------------------------------
        //  2.2 Co-ordinate must not have been attacked already
        // ------------------------------------------------
        const shots = game.shots.map(v => v.coordinate);
        if (shots.indexOf(attackCommand.coordinate) !== -1) {
            console.warn(fncName, 'Attempting to attack already attacked coordinate : ', attackCommand.coordinate);
            throw Error(ErrorCodes.INVALID_ATTACK_COORDINATE);
        }

        // if we have reached at this point without throwing error, it means we are good to go
        // ------------------------------------------------
        //  3. Perform attack and calculate result
        // ------------------------------------------------

        const shipCoordinates: string[] = [];
        game.ships.map((s) => shipCoordinates.push(s.coordinates));


        // ------------------------------------------------
        // 3.1 If it DOES NOT fall on one of the ships co-ordinate, its a MISS
        // ------------------------------------------------
        // Start by assuming it misses!
        let hit = false;
        let ship: ShipEntityModel | undefined;
        for (let i = 0; i < game.ships.length; i++) {
            if (game.ships[i].coordinates.indexOf(attackCommand.coordinate) !== -1) {
                // ------------------------------------------------
                //  3.2  It falls on one of the ships co-ordinate, its a HIT ,
                //       mark the game and decrement the ships health
                // ------------------------------------------------
                hit = true;
                game.ships[i].health--; // decrease health!
                ship = await game.ships[i].save();
                break; // no need to go on anymore!
            }
        }

        let shot = new ShotEntityModel();
        shot.coordinate = attackCommand.coordinate;
        shot.result = hit ? 'HIT' : 'MISS';
        shot.game = game;


        shot = await connection.manager.save(shot);

        Logger.log(fncName, 'Stored shot : ', shot);

        let hitMissSink: 'HIT' | 'MISS' | 'SINK' = shot.result;
        // ------------------------------------------------
        // 3.2.1 If it was a HIT , it might sink the ship
        //       if it was on last health already ( so now health = 0 means sunk )
        // ------------------------------------------------
        if (ship && ship.health === 0) {
            Logger.info(fncName, 'Ship of type : ', ship.shipType, ' was just sunk!');
            hitMissSink = 'SINK';
        }


        game.shots.push(shot);


        // calculate game state

        // check all ships
        // --------------------------------------------------------------------
        //   3.2.1 If was a HIT+SINK, it might mean a GAME_OVER if this was the
        //         last health of the last ship. calculate game health
        // --------------------------------------------------------------------
        if (hitMissSink === 'SINK') {
            const floatersRemaining = R.reduceRight((s, total) => total + s.health, 0, game.ships);
            if (floatersRemaining === 0) {
                Logger.warn(fncName, ' - GAME OVER - ');
                game.gameState = 'GAME_OVER';
            } else {
                Logger.warn(fncName, ' - REMAINING TOTAL HEALTH : ' + floatersRemaining + '- ');
            }
        }

        await game.save();

        let message: string | undefined;
        if (game.gameState === 'GAME_OVER') {
            message = game.gameState;
        }
        else if (hitMissSink === 'SINK' && ship) {
            message = `You just sank the ${ship.shipType}`;
        }

        return {
            result: hitMissSink,
            message
        };

    }

}

export default new GameService();
