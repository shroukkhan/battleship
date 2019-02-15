import Constants from './constants';
import {IShip} from './iShip';

export class BattleShip implements IShip {
    public name = Constants.BATTLE_SHIP;
    public length = 4;
}
