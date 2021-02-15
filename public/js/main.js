import * as Node from './nodes.js';

/* render */

const renderCard = (card, index, setId) =>
{
    let newCard = document.createElement('button');
    newCard.classList.add('card');
    newCard.id = card.id;
    newCard.dataset.index = index;
    newCard.dataset.location = card.location;

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        newCard.onclick = (e) => selectCard(e);
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

const renderBoard = () =>
{
    GameState.boardArr.forEach(set =>
    {
        let newSet = document.createElement('button');
        newSet.className = 'set';
        newSet.id = set.id;

        if (!set.isValid)
        {
            newSet.classList.add('invalid');
        }

        newSet.onclick = (e) => selectSet(e);

        set.cards.forEach((card, index) =>
        {
            newSet.appendChild(renderCard(card, index, set.id));
        });

        Node.boardSets.appendChild(newSet);
    });

    // render add set button
    let addSetButton = document.createElement('button');
    addSetButton.onclick = (e) => addGroup(e);
    addSetButton.id = 'button-new-set'
    addSetButton.innerText += '+';

    Node.boardSets.appendChild(addSetButton);
}

const renderPlayerConsole = () =>
{
    Node.playerConsoleHeader.innerHTML = `${thisPlayerRack.name}`;

    Node.scoreboard.innerHTML =
        `<div class="scoreboard-item">
            <div class="scoreboard-item-turn-title">Turn</div>
            <div class="scoreboard-item-turn-number">${GameState.turnCounter}</div>
        </div>`;

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

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        let nextButton = document.createElement('button');
        nextButton.classList.add('player-console-button');
        nextButton.id = 'button-next-turn';
        nextButton.innerHTML += 'Next turn';
        nextButton.onclick = () => advanceTurn();

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

const renderGame = () =>
{
    Node.boardSets.innerHTML = '';
    Node.scoreboard.innerHTML = '';
    Node.playerConsoleRack.innerHTML = '';
    Node.playerConsoleHand.innerHTML = '';
    Node.playerConsoleButtons.innerHTML = '';

    renderBoard();

    if (GameState.currentPlayerIndex === thisPlayerIndex)
    {
        // render player hand
        GameState.playerHandArr.forEach((card, index) => 
        {
            Node.playerConsoleHand.appendChild(renderCard(card, index));
        });
    }

    // render player rack
    thisPlayerRack.cards.forEach((card, index) =>
    {
        Node.playerConsoleRack.appendChild(renderCard(card, index));
    });

    renderPlayerConsole();
}

/* events */

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
    
    if (targetCard.location === 'player-hand' && 
        targetCard.isHeld)
    {
        targetCard.destination = 'player-rack';
    }
    
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

const selectSet = (e) =>
{
    let setId = e.target.id;
    socket.emit('select set', setId);
}

/* socket.io */

const socket = io();
let GameState = new Object();

let thisPlayerIndex,
    thisPlayerRack;

socket.on('game update', msg =>
{
    console.log('game update!');
    GameState = JSON.parse(msg);
    console.log(GameState);
    thisPlayerRack = GameState.playerRackArr[thisPlayerIndex];
    renderGame();
});

socket.on('player index', msg =>
{
    // console.log(msg, GameState.playerRackArr);
    thisPlayerIndex = msg;
    // thisPlayerRack = GameState.playerRackArr[msg];
});
