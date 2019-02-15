import Constants from './constants';
import {IShip} from './iShip';

export class Cruiser implements IShip {
    public name = Constants.CRUISER;
    public length = 3;
}
