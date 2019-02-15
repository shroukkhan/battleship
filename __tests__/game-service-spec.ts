import * as R from 'ramda';
import Db from '../lib/db';
import ErrorCodes from '../lib/errorCodes';
import Constants from '../lib/models/dateModels/constants';
import IAttackShip from '../lib/models/dateModels/iAttackShip';
import IDeployShip from '../lib/models/dateModels/iDeployShip';
import {GameEntityModel} from '../lib/models/entities/gameEntityModel';
import GameService from '../lib/services/gameService';
import Utilities from '../lib/utilities';

describe('Game Service Test Suite', () => {

    afterAll(async () => {
        try {
            await Db.closeConnection();
        } catch (e) {
            // forget , because its irrelevant to our test
        }
    });

    describe('Reset Game Suite', () => {

        test('[Success] Should be able to create a new game', async () => {
            const result = await GameService.resetGame();
            expect(result).toBeGreaterThan(0);
        }, 25000);


        test('[Failure] Should not be able to create a new game if something wrong in db', async () => {
            const config = Utilities.getConfig();
            config.gameConfig.board.x = 100;
            Utilities.setAppConfig(config);
            const result = await GameService.resetGame();
            expect(result).toBe(0);
            config.gameConfig.board.x = 10;
            Utilities.setAppConfig(config);
        }, 25000);
    });

    describe('Deploy ship Suite', () => {
        let gameId: number;
        beforeEach(async () => {
            gameId = await GameService.resetGame();
        });

        test('[Success] Should be able to get the latest game', async () => {
            const game = await GameService.getGame();
            expect(game.id).toBe(gameId);
        });

        test('[Success] Should be able to deploy a ship to the game horizontally [ middle of board ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,
                coordinate: 'D3',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Failure] Should NOT be able to deploy a ship that is more than allowed [ like 2 battleship ! ] ', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'A1',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

            const deployCommand2: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'B3',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            try {
                await GameService.deploy(deployCommand2);
            }
            catch (e) {
                expect(e.message).toBe(ErrorCodes.INVALID_SHIP_TYPE);
            }

            const deployCommand3: IDeployShip = {
                shipType: Constants.DESTROYER,
                coordinate: 'G8',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result3 = await GameService.deploy(deployCommand3);
            expect(result3).toBe(true);

        }, 25000);


        test('[Success] Should be able to deploy a ship to the game horizontally [ top left edge of board ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'A1',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game horizontally [ left edge of board ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'A4',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game horizontally [ right edge of board ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'G5',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game horizontally [ bottom right edge of board ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'G10',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };


            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game horizontally [ top right edge of board ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'G1',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };


            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game horizontally [ right most edge case ] ', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'G6',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);


        test('[Success] Should be able to deploy a ship to the game vertically [center ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'I3',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game vertically [ top left edge ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'A1',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);


        test('[Success] Should be able to deploy a ship to the game vertically [ left edge ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'A2',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);


        test('[Success] Should be able to deploy a ship to the game vertically [ top edge ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'C1',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);


        test('[Success] Should be able to deploy a ship to the game vertically [ top right edge ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'J1',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);


        test('[Success] Should be able to deploy a ship to the game vertically [ bottom right edge ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.SUBMARINE,

                coordinate: 'J10',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);

        test('[Success] Should be able to deploy a ship to the game vertically [ center edge ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.SUBMARINE,

                coordinate: 'F5',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result = await GameService.deploy(deployCommand);
            expect(result).toBe(true);

        }, 25000);


        test('[Failure] Should NOT be able deploy a ship that goes out of bound [ horizontal ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'H10',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };
            try {
                await GameService.deploy(deployCommand);
            } catch (e) {
                expect(e.message).toBe(ErrorCodes.INVALID_SHIP_COORDINATE);
            }


        }, 25000);

        test('[Failure] Should NOT be able deploy a ship that goes out of bound [ vertical ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'I8',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            try {
                await GameService.deploy(deployCommand);
            } catch (e) {
                expect(e.message).toBe(ErrorCodes.INVALID_SHIP_COORDINATE);
            }

        }, 25000);

        test('[Success] Should  be able deploy a ship that is far enough', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'G5',
                orientation: Constants.ORIENTATION_HORIZONTAL
            };

            const result1 = await GameService.deploy(deployCommand);
            expect(result1).toBe(true);

            const intersector: IDeployShip = {
                shipType: Constants.DESTROYER,

                coordinate: 'G7',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result2 = await GameService.deploy(intersector);
            expect(result2).toBe(true);

        }, 25000);


        test('[Failure] Should NOT be able deploy a ship that goes intersects with another [ vertical ]', async () => {

            const deployCommand: IDeployShip = {
                shipType: Constants.BATTLE_SHIP,

                coordinate: 'G5',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            const result1 = await GameService.deploy(deployCommand);
            expect(result1).toBe(true);

            const intersector: IDeployShip = {
                shipType: Constants.CRUISER,

                coordinate: 'H1',
                orientation: Constants.ORIENTATION_VERTICAL
            };

            try {
                await GameService.deploy(intersector);
            } catch (e) {
                expect(e.message).toBe(ErrorCodes.INVALID_SHIP_COORDINATE);
            }

        }, 25000);


    });


    describe('Attack ship Suite', () => {
        let gameId: number;
        beforeEach(async () => {
            gameId = await GameService.resetGame();
        });

        test('[Failure] Should not be able to attack when game is not ready yet', async () => {

            const attackCommand: IAttackShip = {

                coordinate: 'D3',
            };

            try {
                await GameService.attack(attackCommand);
            } catch (e) {
                expect(e.message).toBe(ErrorCodes.GAME_NOT_READY);
            }


        }, 25000);

        describe('Attack Ship When game is ready suite', () => {
            beforeEach(async () => {
                // put stuffs on board

                const commands: IDeployShip[] = [
                    {
                        shipType: Constants.BATTLE_SHIP,

                        coordinate: 'A1',
                        orientation: Constants.ORIENTATION_HORIZONTAL
                    },
                    {
                        shipType: Constants.CRUISER,

                        coordinate: 'A3',
                        orientation: Constants.ORIENTATION_HORIZONTAL
                    },
                    {
                        shipType: Constants.CRUISER,

                        coordinate: 'A5',
                        orientation: Constants.ORIENTATION_HORIZONTAL
                    },
                    {
                        shipType: Constants.DESTROYER,

                        coordinate: 'J1',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },
                    {
                        shipType: Constants.DESTROYER,

                        coordinate: 'H1',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },
                    {
                        shipType: Constants.DESTROYER,

                        coordinate: 'F1',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },
                    {
                        shipType: Constants.SUBMARINE,

                        coordinate: 'J10',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },
                    {
                        shipType: Constants.SUBMARINE,

                        coordinate: 'H10',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },
                    {
                        shipType: Constants.SUBMARINE,

                        coordinate: 'F10',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },
                    {
                        shipType: Constants.SUBMARINE,

                        coordinate: 'I8',
                        orientation: Constants.ORIENTATION_VERTICAL
                    },

                ];
                let result = true;
                for (let i = 0; i < commands.length; i++) {
                    result = result && await GameService.deploy(commands[i]);
                }
                expect(result).toBe(true);

            });


            test('[SUCCESS] Should be able to hit something', async () => {
                const attackCommand: IAttackShip = {

                    coordinate: 'B1',
                };

                const r = await GameService.attack(attackCommand);
                expect(r.result).toBe('HIT');

            });

            test('[SUCCESS] Should be able to sink something', async () => {
                let attackCommand: IAttackShip = {

                    coordinate: 'A1',
                };

                let r = await GameService.attack(attackCommand);
                expect(r.result).toBe('HIT');
                /*--*/
                attackCommand = {

                    coordinate: 'B1',
                };
                r = await GameService.attack(attackCommand);
                expect(r.result).toBe('HIT');
                /*--*/
                attackCommand = {

                    coordinate: 'C1',
                };
                r = await GameService.attack(attackCommand);
                expect(r.result).toBe('HIT');
                /*--*/
                attackCommand = {

                    coordinate: 'D1',
                };
                r = await GameService.attack(attackCommand);
                expect(r).toEqual({
                    result: 'SINK',
                    message: 'You just sank the BattleShip'
                });

            });


            test('[SUCCESS] Should be able to miss something', async () => {
                const attackCommand: IAttackShip = {

                    coordinate: 'I10',
                };

                const r = await GameService.attack(attackCommand);
                expect(r.result).toBe('MISS');

            });

            test('[SUCCESS] Should be able to game over', async () => {
                const attackCommand: IAttackShip = {

                    coordinate: '',
                };
                let lastResult: any;

                const connection = await Db.openConnection();
                const game = await connection.manager.findOneOrFail(GameEntityModel, gameId);

                const shipCoords: string[] = R.flatten(game.ships.map(ship => JSON.parse(ship.coordinates).map(coord => coord)));

                for (const coord of shipCoords) {
                    attackCommand.coordinate = coord;
                    lastResult = await GameService.attack(attackCommand);
                }

                expect(lastResult.result).toBe('SINK');

                const game2 = await connection.manager.findOneOrFail(GameEntityModel, gameId);

                expect(game2.gameState).toBe('GAME_OVER');


            });

            test('[FAILURE] Should NOT be able to hit same place twice ', async () => {
                const attackCommand: IAttackShip = {

                    coordinate: 'I10',
                };

                const r = await GameService.attack(attackCommand);
                expect(r.result).toBe('MISS');
                try {
                    await GameService.attack(attackCommand);
                }
                catch (e) {
                    expect(e.message).toBe(ErrorCodes.INVALID_ATTACK_COORDINATE);
                }

            });

            test('[FAILURE] Should NOT be able to attack outside board', async () => {

                const attackCommand2: IAttackShip = {

                    coordinate: 'I11',
                };

                try {
                    await GameService.attack(attackCommand2);
                }
                catch (e) {
                    expect(e.message).toBe(ErrorCodes.INVALID_ATTACK_COORDINATE);
                }

            });


        });
    });

    describe('Game Status Suite', () => {
        let gameId: number;
        beforeEach(async () => {
            gameId = await GameService.resetGame();
            const deployShips: IDeployShip[] = [
                {
                    shipType: Constants.BATTLE_SHIP,

                    coordinate: 'A1',
                    orientation: Constants.ORIENTATION_HORIZONTAL
                },
                {
                    shipType: Constants.CRUISER,

                    coordinate: 'A3',
                    orientation: Constants.ORIENTATION_HORIZONTAL
                },
                {
                    shipType: Constants.CRUISER,

                    coordinate: 'A5',
                    orientation: Constants.ORIENTATION_HORIZONTAL
                },
                {
                    shipType: Constants.DESTROYER,

                    coordinate: 'J1',
                    orientation: Constants.ORIENTATION_VERTICAL
                },
                {
                    shipType: Constants.DESTROYER,

                    coordinate: 'H1',
                    orientation: Constants.ORIENTATION_VERTICAL
                },
                {
                    shipType: Constants.DESTROYER,

                    coordinate: 'F1',
                    orientation: Constants.ORIENTATION_VERTICAL
                },
                {
                    shipType: Constants.SUBMARINE,

                    coordinate: 'J10',
                    orientation: Constants.ORIENTATION_VERTICAL
                },
                {
                    shipType: Constants.SUBMARINE,

                    coordinate: 'H10',
                    orientation: Constants.ORIENTATION_VERTICAL
                },
                {
                    shipType: Constants.SUBMARINE,

                    coordinate: 'F10',
                    orientation: Constants.ORIENTATION_VERTICAL
                },
                {
                    shipType: Constants.SUBMARINE,

                    coordinate: 'I8',
                    orientation: Constants.ORIENTATION_VERTICAL
                },

            ];

            let result = true;
            for (let i = 0; i < deployShips.length; i++) {
                result = result && await GameService.deploy(deployShips[i]);
            }
            expect(result).toBe(true);

            const attackShips: IAttackShip[] = [
                {
                    coordinate: 'A1',
                },
                {
                    coordinate: 'B1',
                },
                {
                    coordinate: 'E4',
                },
            ];

            for (let i = 0; i < attackShips.length; i++) {
                await GameService.attack(attackShips[i]);
            }

        });

        test('[Success] Should return current game status', async () => {

            const gameState = await GameService.getGameStatus();

            expect(gameState).toBeTruthy();

            console.log('------------------------------------------------------------------------------\n'
                + gameState.gameBoardString);

        });

    });
});
