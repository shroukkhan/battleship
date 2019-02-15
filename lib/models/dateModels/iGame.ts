export default interface IGame {
    gameId: number;
    ships: Array<{
        shipType: string,
        health: number,
        coordinates: string[]; // [A0 , B1] Etc.
    }>;
    shots: Array<{ coordinate: string, result: 'HIT' | 'MISS' }>;
    gameBoard: string[][];
    gameBoardString: string;
    gameStatus: 'NEW' | 'IN_PROGRESS' | 'ABANDONED' | 'GAME_OVER';
}
