import Constants from './constants';

export default interface IDeployShip {
    shipType: typeof Constants.DESTROYER | typeof Constants.BATTLE_SHIP | typeof Constants.CRUISER | typeof Constants.SUBMARINE;
    orientation: typeof Constants.ORIENTATION_HORIZONTAL | typeof Constants.ORIENTATION_VERTICAL;
    coordinate: string; // A0 , B1 Etc.
}
