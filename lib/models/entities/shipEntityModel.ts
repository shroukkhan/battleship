import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import Constants from '../dateModels/constants';
import {GameEntityModel} from './gameEntityModel';

@Entity({name: 'ships'})
export class ShipEntityModel extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => GameEntityModel)
    @JoinColumn({name: 'game_id'})
    public game: GameEntityModel;

    @Column({
        name: 'ship_type', type: 'enum', enum: [
            Constants.BATTLE_SHIP,
            Constants.CRUISER,
            Constants.DESTROYER,
            Constants.SUBMARINE,
        ], comment: 'Type of ship'
    })
    public shipType: typeof Constants.DESTROYER | typeof Constants.BATTLE_SHIP | typeof Constants.CRUISER | typeof Constants.SUBMARINE;


    @Column({
        type: 'text',
        comment: 'JSON encoded array of co-ordinates occupied by this ship'
    })
    public coordinates: string;

    /**
     * Purpose of this column is to calculate the cells that become off-limit as soon as the ship is placed on the board.
     * This way we don't need to re-calculate it every time another ship is placed
     */
    @Column({
        name: 'blocked_cells',
        type: 'text',
        comment: 'JSON encoded array of co-ordinates blocked by this ship'
    })
    public blockedCells: string;

    @Column({type: 'int', comment: 'How much health does this ship has ? health = 0 means the ship is sunk'})
    public health: number;

}
