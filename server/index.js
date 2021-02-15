const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);

const socketio = require('socket.io');
const io = socketio(server);

const PORT = 8000;

const Class = require('./classes.js');
const Game = require('./game.js');
const Utility = require('./utilities.js');

let deckArr = new Array(),
    boardArr = new Array(),
    playerRackArr = new Array(),
    playerHandArr = new Array();

let setIdArr = new Array();

let turnCounter = 1,
    playerCount = 2,
    currentPlayer = 0;

app.use(express.static('../public'));
app.get('/', (request, response) => { response.sendFile('index.html') });

const startGame = () =>
{
    deckArr = [];
    boardArr = [];
    playerRackArr = [];
    playerHandArr = [];

    turnCounter = 1;
    playerCount = 2;
    currentPlayer = 0;

    Game.initiateDeck(deckArr);
    Game.distributeCards(deckArr, playerRackArr, 2);
}

const removeEmptySets = () =>
{
    boardArr.forEach((set, index) =>
    {
        if (set.cards.length === 0)
        {
            // remove id from setIds
            setIdArr.forEach((id, index) =>
            {
                if (set.id === `set-${id}`)
                {
                    setIdArr.splice(index, 1);
                }
            })

            boardArr.splice(index, 1);
        };
    });
}

io.on('connection', socket =>
{
    console.log('user connected');

    const updateGameState = () =>
    {
        removeEmptySets();

        socket.emit(
            'game update', 
            JSON.stringify(
            {
                turnCounter,
                playerCount,
                currentPlayer,
                deckArr,
                boardArr,
                playerRackArr,
                playerHandArr
            })
        );
    }

    socket.on('game start', () =>
    {
        startGame();
        updateGameState();
    });

    socket.on('game update', () =>
    {
        updateGameState();
    });

    socket.on('add group', msg =>
    {
        boardArr.push(new Class.Set(
            playerHandArr.splice(0, playerHandArr.length),
            `set-${Utility.generateId(setIdArr)}`)
        );
        updateGameState();
    });

    socket.on('draw card', msg =>
    {
        let r = Math.floor(Math.random() * deckArr.length);
        let targetCard = deckArr.splice(r, 1)[0];
        // targetCard.isHeld = true;
        // console.log(targetCard.isHeld);
        playerRackArr[Utility.returnCurrentPlayerRack(turnCounter, playerCount)].cards.push(targetCard);

        updateGameState();
    });

    socket.on('advance turn', msg =>
    {
        turnCounter += 1;
        currentPlayer = Utility.returnCurrentPlayerRack(turnCounter, playerCount);
        updateGameState();
    });
    
    socket.on('select card', msg =>
    {
        if (msg.origin === 'player-rack')
        {
            playerHandArr.push(
                playerRackArr[currentPlayer].cards.splice(msg.targetCardIndex, 1)[0]
            );
        }

        if (msg.origin === 'player-hand')
        {
            playerRackArr[currentPlayer].cards.push(
                playerHandArr.splice(msg.targetCardIndex, 1)[0]
            );
        }

        if (msg.origin === 'set')
        {
            // let targetSet;

            boardArr.forEach(set =>
            {
                if (set.id === msg.setId)
                {
                    playerHandArr.push(
                        set.cards.splice(msg.targetCardIndex, 1)[0]
                    );
                }
            });
        }

        updateGameState();
    });

    socket.on('select set', msg =>
    {
        let playerHandCards = playerHandArr.splice(0, playerHandArr.length);

        boardArr.forEach(set =>
        {
            if (set.id === msg)
            {
                playerHandCards.forEach(card =>
                {
                    set.cards.push(card);
                });
            }
        });

        updateGameState();
    });

    socket.on('disconnect', () =>
    {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));