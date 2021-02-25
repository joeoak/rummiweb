import * as Event from './events.js';
import * as Node from './nodes.js';
import { GameState, thisPlayerIndex, thisPlayerRack } from './scripts.js';

const renderCard = (card, index, setId) =>
{
    let newCard = document.createElement('button');
    newCard.classList.add('card');
    newCard.id = card.id;
    newCard.dataset.index = index;
    newCard.dataset.location = card.location;

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        newCard.onclick = (e) => Event.selectCard(e);
    }
    
    if (card.type === 'num')
    {
        newCard.classList.add(card.color);
        newCard.innerText = card.num;
    }
    else if (card.type === 'joker')
    {
        newCard.classList.add(card.type);
        newCard.innerText = `🙂`;
    }

    if (card.location === 'set')
    {
        newCard.dataset.setId = setId;
    }

    if (card.isHeld && card.location != 'player-rack')
    {
        newCard.classList.add('held');
    }
    
    return newCard;
}

const renderCell = index =>
{
    let newCell = document.createElement('button');
    newCell.classList.add('cell');
    newCell.dataset.index = index;
    newCell.innerText = '•';

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        newCell.onclick = (e) => Event.selectCell(e);
    }

    return newCell;
}

const renderConsoleButton = () =>
{
    Node.playerConsoleButtons.innerHTML = '';

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        let nextButton = document.createElement('button');
        nextButton.classList.add('player-console-button');
        nextButton.id = 'button-next-turn';
        nextButton.onclick = () => Event.advanceTurn();

        if (GameState.isCardsAdded)
        {
            nextButton.innerHTML += 'Finish turn';
        }
        else
        {
            nextButton.innerHTML += 'Draw tile';
        }

        if (GameState.isValidBoard === false || GameState.playerHandArr.length > 0)
        {
            nextButton.classList.add('disabled');
        }
        else
        {
            nextButton.classList.add('enabled');
        }
        
        Node.playerConsoleButtons.appendChild(nextButton);
    }
    else
    {
        let newDiv = document.createElement('div');
        newDiv.innerText = `${GameState.playerRackArr[GameState.currentPlayerIndex].name}'s turn`;

        Node.playerConsoleButtons.appendChild(newDiv);
    }
}

const renderRack = () =>
{
    Node.playerConsoleRack.innerHTML = '';

    thisPlayerRack.cards.forEach((card, index) =>
    {
        if (card.type === 'num' || card.type === 'joker')
        {
            // add card
            Node.playerConsoleRack.appendChild(renderCard(card, index));
        }
        else
        {
            // add cell
            Node.playerConsoleRack.appendChild(renderCell(index));
        }
    });
}

const renderScoreboard = () =>
{
    Node.scoreboard.innerHTML = '';
    
    for (let i = 0; i < GameState.playerCount; i++)
    {
        let playerScore = document.createElement('div');
        playerScore.classList.add('scoreboard-item');

        if (i === GameState.currentPlayerIndex)
        {
            playerScore.classList.add('selected');
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">👉 ${GameState.playerRackArr[i].name}</div>
                 <div class="scoreboard-item-player-score">${GameState.playerRackArr[i].cards.length}</div>`;
        }
        else
        {
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">${GameState.playerRackArr[i].name}</div>
                 <div class="scoreboard-item-player-score">${GameState.playerRackArr[i].cards.length}</div>`;
        }
        
        Node.scoreboard.appendChild(playerScore);
    }
}

const renderSet = set =>
{
    let newSet = document.createElement('button');
    newSet.className = 'set';
    newSet.id = set.id;

    if (!set.isValid)
    {
        newSet.classList.add('invalid');
    }

    newSet.onclick = (e) => Event.selectSet(e);

    set.cards.forEach((card, index) =>
    {
        newSet.appendChild(renderCard(card, index, set.id));
    });

    return newSet;
}

const renderBoard = () =>
{
    Node.boardSets.innerHTML = '';

    GameState.boardArr.forEach(set =>
    {
        Node.boardSets.appendChild(renderSet(set));
    });

    // render add set button
    let addSetButton = document.createElement('button');
    addSetButton.onclick = (e) => Event.addGroup(e);
    addSetButton.id = 'button-new-set'
    addSetButton.innerText += '+';
    Node.boardSets.appendChild(addSetButton);
}

const renderHand = () =>
{
    Node.playerConsoleHand.innerHTML = '';

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        GameState.playerHandArr.forEach((card, index) => 
        {
            Node.playerConsoleHand.appendChild(renderCard(card, index));
        });
    }
}

const renderPlayerConsole = () =>
{
    Node.playerConsoleHeader.innerHTML = `${thisPlayerRack.name}`;
    renderRack();
    renderScoreboard();
    renderConsoleButton();
}

const renderGame = () =>
{
    renderBoard();
    renderHand();
    renderPlayerConsole();
}

export { renderGame }
