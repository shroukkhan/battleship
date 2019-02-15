import Constants from './constants';
import {IShip} from './iShip';

export class Destroyer implements IShip {
    public name = Constants.DESTROYER;
    public length = 2;
}
