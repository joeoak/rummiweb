/*
// todo: add 'Arr' to variable names
let deck = new Array(),
    board = new Array(),
    playerHand = new Array(),
    playerRacks = new Array();

let setIds = new Array(); // todo: add 'Arr' to variable names

// todo: wrap these within an object
let playerCount = 2,
    turnCounter = 1,
    startingAmount = 14;

let playerCount = 2,
    turnCounter = 1;

*/

// import { Card, PlayerRack, Set } from './modules/classes.js';
import * as Node from './modules/nodes.js';
// import * as Utility from './modules/utilities.js';
import { isBoardValid, isPlayerPlacedCards, checkIfPlayerPlacedCards, verifySets } from './modules/verification.js';

/*

const returnPlayerRack = () => // todo: "returnCurrentPlayerRack"?
{
    if (playerCount === 1)
    {
        return gameState.playerRackArr[0];
    }
    else if (playerCount === 2)
    {
        if (turnCounter % playerCount === 0)
        {
            return gameState.playerRackArr[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return gameState.playerRackArr[0];
        }
    }
    else if (playerCount === 3)
    {
        if (turnCounter % playerCount === 0)
        {
            return gameState.playerRackArr[2];
        }
        else if (turnCounter % playerCount === 2)
        {
            return gameState.playerRackArr[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return gameState.playerRackArr[0];
        }
    }
    else if (playerCount === 4)
    {
        if (turnCounter % playerCount === 0)
        {
            return gameState.playerRackArr[3];
        }
        else if (turnCounter % playerCount === 3)
        {
            return gameState.playerRackArr[2];
        }
        else if (turnCounter % playerCount === 2)
        {
            return gameState.playerRackArr[1];
        }
        else if (turnCounter % playerCount === 1)
        {
            return gameState.playerRackArr[0];
        }
    }
}

const initiateDeck = (deck) => 
{   
    const colorArr = ['color0', 'color1', 'color2', 'color3'];
    const seriesArr = ['a', 'b'];

    seriesArr.forEach(series =>
    {
        colorArr.forEach(color =>
        {
            for (let num = 1; num <= 13; num++)
            {
                deck.push(new Card(color, `${color}-${num}-${series}`, num, 'num'));
            }
        });

        deck.push(new Card(null, `joker-${series}`, null, 'joker'));
    });
}

const distributeCards = () =>
{
    for (let i = 1; i <= playerCount; i++)
    {
        let rack = new Array(); // todo: add 'Arr' to variable names

        for (let j = 0; j < startingAmount; j++)
        {
            let r = Math.floor(Math.random() * deck.length);
            let targetCard = deck.splice(r, 1)[0];
            targetCard.isHeld = true;
            rack.push(targetCard);
        }

        playerRacks.push(new PlayerRack(rack, `Player ${i}`, i - 1));
    }
}

*/

/* render */

const drawCanvas = () =>
{
    // socket.emit('game update');

    // clear canvas
    Node.boardSets.innerHTML = '';
    Node.scoreboard.innerHTML = '';
    Node.playerConsoleRack.innerHTML = '';
    Node.playerConsoleHand.innerHTML = '';
    Node.playerConsoleButtons.innerHTML = '';

    /*
    // remove empty sets
    gameState.boardArr.forEach((set, index) =>
    {
        if (set.cards.length === 0)
        {
            // remove id from setIds
            setIds.forEach((id, index) =>
            {
                if (set.id === `set-${id}`)
                {
                    setIds.splice(index, 1);
                }
            })

            gameState.boardArr.splice(index, 1);
        };
    });
    */

    // verification
    verifySets(gameState.boardArr);
    checkIfPlayerPlacedCards(gameState.boardArr);

    /*

    // sort board cards
    gameState.boardArr.forEach(set => Utility.sortByColorAndNumber(set.cards));

    // sort player rack
    Utility.sortByColorAndNumber(returnPlayerRack().cards);

    */

    // draw sets
    gameState.boardArr.forEach(set =>
    {
        let newSet = document.createElement('button');
        newSet.id = set.id;
        newSet.className = 'set';

        if (!set.isValid)
        {
            newSet.classList.add('invalid');
        }

        newSet.onclick = (e) => selectSet(e);

        set.cards.forEach(card =>
        {
            let newCard = document.createElement('button');
            newCard.id = card.id;
            newCard.classList.add('card');
            newCard.onclick = (e) => selectCard(e);
            
            if (card.type === 'num')
            {
                newCard.classList.add(card.color);
                newCard.innerHTML = card.num;
            }
            else if (card.type === 'joker')
            {
                newCard.classList.add(card.type);
                newCard.innerHTML = `🙂`;
            }

            if (card.isHeld && card.location != 'player-rack')
            {
                newCard.classList.add('held');
            }

            newSet.appendChild(newCard);
        });

        Node.boardSets.appendChild(newSet);
    });

    // render add set button
    let addSetButton = document.createElement('button');
    addSetButton.id = 'button-new-set'
    addSetButton.onclick = () => addGroup();
    addSetButton.innerHTML += '+';
    Node.boardSets.appendChild(addSetButton);

    // render player hand
    gameState.playerHandArr.forEach(card => 
    {
        let newCard = document.createElement('button');
        newCard.id = card.id;
        newCard.classList.add('card');
        newCard.onclick = (e) => selectCard(e);
        
        if (card.type === 'num')
        {
            newCard.classList.add(card.color);
            newCard.innerHTML = card.num;
        }
        else if (card.type === 'joker')
        {
            newCard.classList.add(card.type);
            newCard.innerHTML = `🙂`;
        }

        if (card.isHeld && card.location != 'player-rack')
        {
            newCard.classList.add('held');
        }

        Node.playerConsoleHand.appendChild(newCard);
    });

    // render player rack
    // returnPlayerRack().cards.forEach(card => Node.playerConsoleRack.appendChild(card.render(selectCard)));
    gameState.playerRackArr[gameState.currentPlayer].cards.forEach(card =>
    {
        let newCard = document.createElement('button');
        newCard.id = card.id;
        newCard.classList.add('card');
        newCard.onclick = (e) => selectCard(e);
        
        if (card.type === 'num')
        {
            newCard.classList.add(card.color);
            newCard.innerHTML = card.num;
        }
        else if (card.type === 'joker')
        {
            newCard.classList.add(card.type);
            newCard.innerHTML = `🙂`;
        }

        if (card.isHeld && card.location != 'player-rack')
        {
            newCard.classList.add('held');
        }

        Node.playerConsoleRack.appendChild(newCard);
    });

    /* render player console */

    Node.playerConsoleHeader.innerHTML = `${gameState.playerRackArr[gameState.currentPlayer].name}'s turn`;
    Node.scoreboard.innerHTML =
        `<div class="scoreboard-item">
            <div class="scoreboard-item-turn-title">Turn</div>
            <div class="scoreboard-item-turn-number">${gameState.turnCounter}</div>
        </div>`;

    for (let i = 0; i < gameState.playerCount; i++)
    {
        let playerScore = document.createElement('div');
        playerScore.classList.add('scoreboard-item');

        if (i === gameState.currentPlayer)
        {
            playerScore.classList.add('selected');
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">👉 ${gameState.playerRackArr[i].name}</div>
                 <div class="scoreboard-item-player-score">${gameState.playerRackArr[i].cards.length}</div>`;
        }
        else
        {
            playerScore.innerHTML = 
                `<div class="scoreboard-item-player-name">${gameState.playerRackArr[i].name}</div>
                 <div class="scoreboard-item-player-score">${gameState.playerRackArr[i].cards.length}</div>`;
        }
        
        Node.scoreboard.appendChild(playerScore);
    }

    // render next turn button
    let nextButton = document.createElement('button');
    nextButton.id = 'button-next-turn'
    nextButton.classList.add('player-console-button');
    nextButton.onclick = () => advanceTurn();
    nextButton.innerHTML += 'Next turn';

    if (isBoardValid === false || gameState.playerHandArr.length > 0)
    {
        nextButton.classList.add('disabled');
    }
    else
    {
        nextButton.classList.add('enabled');
    }
    
    Node.playerConsoleButtons.appendChild(nextButton);
}

/* events */

const addGroup = () =>
{
    socket.emit('add group');
    // board.push(new Set(playerHand.splice(0, playerHand.length), `set-${Utility.generateId(setIds)}`));
    // drawCanvas();
}

const advanceTurn = () =>
{
    if (isBoardValid && gameState.playerHandArr.length <= 0)
    {
        if (isPlayerPlacedCards)
        {
            /*
            // set all cards to isHeld = false
            board.forEach(set =>
            {
                set.cards.forEach(card =>
                {
                    if (card.isHeld)
                    {
                        card.isHeld = false;
                    }
                });
            });
            */
        }
        else
        {
            drawCard();
        }

        if (gameState.playerRackArr[gameState.currentPlayer].cards.length === 0)
        {
            alert('Game over!');
        }
        else
        {
            // gameState.turnCounter += 1;
        }

        socket.emit('advance turn');
        // drawCanvas();
    }
}

const drawCard = () =>
{
    if (gameState.deckArr.length > 0)
    {
        /*
        let r = Math.floor(Math.random() * gameState.deckArr.length);
        let targetCard = gameState.deckArr.splice(r, 1)[0];
        targetCard.isHeld = true;
        returnPlayerRack().cards.push(targetCard);
        */

        socket.emit('draw card');
    }
}

const selectCard = (e) =>
{
    // todo: see if card.location is being used

    e.stopPropagation(); // prevents player from triggering set event underneath card

    let targetParent = e.path[1];
    let setId;
    let targetCard;
    let targetCardIndex;
    let destination;

    if (targetParent.id === 'player-console-rack')
    {
        gameState.playerRackArr[gameState.currentPlayer].cards.forEach((card, index) =>
        {
            if (card.id === e.target.id)
            {
                // targetCard = gameState.playerRackArr[gameState.currentPlayer].cards.splice(index, 1)[0];

                setId = null;
                targetCardIndex = index;
                origin = 'player-rack';
                destination = 'player-hand';
                // socket.emit('select card', { targetCardIndex, destination });
            };
        });

        // targetCard.location = 'player-hand';
        // playerHand.push(targetCard);
    }
    
    if (targetParent.id === 'player-console-hand')
    {
        gameState.playerHandArr.forEach((card, index) =>
        {
            if (card.id === e.target.id && 
                card.isHeld === true)
            {
                // targetCard = playerHand.splice(index, 1)[0];
                // targetCard.location = 'player-rack';
                // gameState.playerRackArr[gameState.currentPlayer].cards.push(targetCard);

                setId = null;
                targetCardIndex = index;
                origin = 'player-hand';
                destination = 'player-rack';
                // socket.emit('select card', { targetCardIndex, destination });
            }
        });
    }
    
    if (targetParent.classList.contains('set'))
    {
        gameState.boardArr.forEach(set =>
        {
            if (set.id === targetParent.id)
            {
                set.cards.forEach((card, index) =>
                {
                    if (card.id === e.target.id)
                    {
                        // targetCard = set.cards.splice(index, 1)[0];
                        setId = set.id;
                        targetCardIndex = index;
                        origin = 'set';
                        destination = 'player-hand';
                    }
                });
            }
        });

        // todo: execute this logic on the server side
        /*
        if (targetCard.isHeld)
        {
            targetCard.location = 'player-rack';
            gameState.playerRackArr[gameState.currentPlayer].cards.push(targetCard);
        }
        else
        {
            targetCard.location = 'player-hand';
            playerHand.push(targetCard);
        }
        */
    }

    // drawCanvas();
    socket.emit('select card', { setId, targetCardIndex, origin, destination }); 
}

const selectSet = (e) =>
{
    /*
    let cards = playerHand.splice(0, playerHand.length);

    board.forEach(set =>
    {
        if (set.id === e.target.id)
        {
            cards.forEach(card =>
            {
                card.location = 'set';
                set.cards.push(card);
            });
        }
    });
    */

    let setId = e.target.id;

    // drawCanvas();
    socket.emit('select set', setId);
}

/* init */

// initiateDeck(deck);
// distributeCards();
// drawCanvas();

/* socket start */

const socket = io();
let gameState = new Object();

socket.emit('game start');

// socket.on('game start', message =>
// {
//     console.log('game start!');
//     gameState = JSON.parse(message);
//     console.log(gameState);
//     drawCanvas();
// });

socket.on('game update', message =>
{
    console.log('game update!');
    gameState = JSON.parse(message);
    console.log(gameState);
    drawCanvas();
});

/* socket end */
