import {BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import {ShipEntityModel} from './shipEntityModel';
import {ShotEntityModel} from './shotEntityModel';

@Entity({name: 'games'})
export class GameEntityModel extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({
        name: 'game_state',
        type: 'enum',
        default: 'NEW',
        enum: ['NEW', 'IN_PROGRESS', 'GAME_OVER', 'ABANDONED'],
        comment: 'Whats the current state of this game? ' +
            'Is it new ( was Just rest ) , ' +
            'In progress ( defender has made his first move ) ,' +
            'Game Over ( Attacker managed to sink all ships ) ,' +
            'Abandoned ( Game was reset before attacker managed to sink everything ) '
    })
    public gameState: 'NEW'| 'IN_PROGRESS'| 'GAME_OVER'| 'ABANDONED';

    @Column({
        type: 'text',
        comment: 'State of the 10x10 board , stored as a json string. ' +
            'Would be nice to store it as a actual json data type, ' +
            'but mysql is not updated to latest yet , and also this is ' +
            'a readonly value, there is no need to search using this column anyway '
    })
    public board: string;

    @ManyToMany(type => ShotEntityModel, {eager: true})
    @JoinTable({
        name: 'game_shots',
        joinColumn: {name: 'game_id'},
        inverseJoinColumn: {name: 'shot_id'}
    })
    public shots: ShotEntityModel[];

    @ManyToMany(type => ShipEntityModel, {eager: true})
    @JoinTable({
        name: 'game_ships',
        joinColumn: {name: 'game_id'},
        inverseJoinColumn: {name: 'ship_id'}
    })
    public ships: ShipEntityModel[];


}
