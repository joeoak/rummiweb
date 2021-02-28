import * as Node from './nodes.js';
import { renderGame } from './render.js';

const socket = io();

let GameState = new Object(),
    thisPlayerIndex,
    thisPlayerHand,
    thisPlayerRack;

socket.on('game update', msg =>
{
    GameState = JSON.parse(msg);
    thisPlayerHand = GameState.playerHandArr[thisPlayerIndex];
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
    thisPlayerHand,
    thisPlayerIndex,
    thisPlayerRack,
}

// to do: find a better implementation of this
const onMouseMove = e =>
{
  Node.playerConsoleHand.style.left = (e.pageX + 10) + 'px';
  Node.playerConsoleHand.style.top = (e.pageY + 10) + 'px';
}

document.addEventListener('mousemove', onMouseMove);
