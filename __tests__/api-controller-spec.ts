import * as LambdaTester from 'lambda-tester';
import * as ApiController from '../lib/controllers/api';
import Constants from '../lib/models/dateModels/constants';
import IAttackShip from '../lib/models/dateModels/iAttackShip';
import IDeployShip from '../lib/models/dateModels/iDeployShip';


describe('Api Controller Test', () => {

    describe('GET /get', () => {

        it('[Success] Should be able to get current game state', async () => {
            const postBody = {};
            await LambdaTester(ApiController.get)
                .event({body: postBody})
                .context({identity: {}})
                .expectResult((result) => {
                    expect(result.statusCode).toBe(200);
                    expect(result.body).toBeTruthy();
                });
        });

    });

    describe('POST /reset', () => {

        it('[Success] Should be able to reset a game', async () => {
            const postBody = {};
            await LambdaTester(ApiController.reset)
                .event({body: postBody})
                .context({identity: {}})
                .expectResult((result) => {
                    expect(result.statusCode).toBe(200);
                    expect(result.body).toBe('reset successfully');
                });
        });

    });


    describe('PUT /ship', () => {

        beforeEach(async () => {
            await LambdaTester(ApiController.reset)
                .event({body: {}})
                .context({identity: {}})
                .expectResult((result) => {
                    expect(result.statusCode).toBe(200);
                    console.log('-- Game has been reset -- ');
                });
        });

        it('[Success] Should be able to deploy to a game', async () => {
            const postBody: IDeployShip = {
                shipType: Constants.DESTROYER,
                orientation: Constants.ORIENTATION_VERTICAL,
                coordinate: 'A1'
            };


            await LambdaTester(ApiController.ship)
                .event({body: JSON.stringify(postBody)})
                .context({identity: {}})
                .expectResult((result) => {
                    expect(result).toEqual({statusCode: 200, body: 'placed Destroyer'});
                });
        });

    });


    describe('PUT /attack', () => {

        beforeEach(async () => {
            await LambdaTester(ApiController.reset)
                .event({body: {}})
                .context({identity: {}})
                .expectResult((result) => {
                    expect(result.statusCode).toBe(200);
                    console.log('-- Game has been reset -- ');
                });
        });

        it('[Failure] Should not be able to attack a non-ready game', async () => {
            const postBody: IAttackShip = {
                coordinate: 'A1'
            };

            console.log(' > ', JSON.stringify(postBody));

            await LambdaTester(ApiController.attack)
                .event({body: JSON.stringify(postBody)})
                .context({identity: {}})
                .expectResult((result) => {
                    expect(result).toEqual({statusCode: 401, body: 'GAME_NOT_READY'});
                });
        });

    });


});
