import * as Node from './nodes.js';
import { socket, GameState, thisPlayerRack } from './scripts.js';

const addGroup = (e) =>
{
    socket.emit('add group');
}

const advanceTurn = (e) =>
{
    if (GameState.isValidBoard &&
        GameState.playerHandArr.length === 0)
    {
        if (GameState.isCardsAdded === false &&
            GameState.deckArr.length > 0)
        {
            socket.emit('draw card');
        }

        if (thisPlayerRack.cards.length === 0)
        {
            alert('Game over!');
        }
        else
        {
            socket.emit('advance turn');
        }
    }
}

const selectCard = (e) =>
{
    e.stopPropagation();

    let targetCard = new Object(
    {
        destination: '',
        location: e.target.dataset.location,
        setId: e.target.dataset.setId,
        id: e.target.id,
        index: e.target.dataset.index,
        isHeld: e.target.classList.contains('held'),
    });

    if (targetCard.location === 'player-rack')
    {
        targetCard.destination = 'player-hand';
    }
    
    // if (targetCard.location === 'player-hand' && 
    //     targetCard.isHeld)
    // {
    //     targetCard.destination = 'player-rack';
    // }
    
    if (targetCard.location === 'set')
    {
        if (targetCard.isHeld)
        {
            targetCard.destination = 'player-rack';
        }
        else
        {
            targetCard.destination = 'player-hand';
        }
    }

    socket.emit('select card', targetCard);
}

const selectCell = (e) =>
{
    if (GameState.playerHandArr.length === 1)
    {
        socket.emit('select cell', e.target.dataset.index);
    }
}

const selectSet = (e) =>
{
    let setId = e.target.id;
    socket.emit('select set', setId);
}

const onMouseMove = (e) =>
{
  Node.playerConsoleHand.style.left = (e.pageX + 10) + 'px';
  Node.playerConsoleHand.style.top = (e.pageY + 10) + 'px';
}

document.addEventListener('mousemove', onMouseMove);

export
{
    addGroup,
    advanceTurn,
    selectCard,
    selectCell,
    selectSet,
}
