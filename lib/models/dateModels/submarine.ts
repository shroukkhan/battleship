import Constants from './constants';
import {IShip} from './iShip';

export class Submarine implements IShip {
    public name = Constants.SUBMARINE;
    public length = 1;
}
