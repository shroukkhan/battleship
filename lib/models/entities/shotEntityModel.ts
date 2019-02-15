import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {GameEntityModel} from './gameEntityModel';

@Entity({name: 'shots'})
export class ShotEntityModel extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => GameEntityModel)
    @JoinColumn({name: 'game_id'})
    public game: GameEntityModel;

    @Column({type: 'enum', enum: ['HIT', 'MISS'], comment: 'Was the shot a hit or a miss?'})
    public result: 'HIT'|'MISS';

    @Column({type: 'varchar', length: 3, comment: 'Co ordinate of the shot, like A0 , A1 etc'})
    public coordinate: string;
}
