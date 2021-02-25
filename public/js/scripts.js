import { renderGame } from './render.js';

const socket = io();

let GameState = new Object(),
    thisPlayerIndex,
    thisPlayerRack;

socket.on('game update', msg =>
{
    GameState = JSON.parse(msg);
    thisPlayerRack = GameState.playerRackArr[thisPlayerIndex];
    renderGame();
});

socket.on('player index', msg =>
{
    thisPlayerIndex = msg;
});

export
{
    socket,
    GameState,
    thisPlayerIndex,
    thisPlayerRack,
}
