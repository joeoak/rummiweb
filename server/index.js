const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const socketio = require('socket.io');
const io = socketio(server);
const PORT = 8000;

const Class = require('./classes.js');
const Game = require('./game.js');
const GameState = require('./game-state.js');
const Utility = require('./utilities.js');
const Verify = require('./verify.js');

app.use(express.static('../public'));
app.get('/', (req, res) => { res.sendFile('index.html') });

const startGame = () =>
{
    GameState.deckArr = [];
    GameState.boardArr = [];
    GameState.playerRackArr = [];
    GameState.playerHandArr = [];
    GameState.turnCounter = 1;
    GameState.playerCount = 2;
    GameState.currentPlayerIndex = 0;
    Game.initiateDeck(GameState.deckArr);
    Game.distributeCards(GameState.deckArr, GameState.playerRackArr, 2);
}

const clearGame = () =>
{
    GameState.deckArr = [];
    GameState.boardArr = [];
    GameState.playerRackArr = [];
    GameState.playerHandArr = [];
    GameState.turnCounter = 1;
    GameState.playerCount = 2;
    GameState.currentPlayerIndex = 0;
}

const updateGameState = () =>
{
    GameState.currentPlayerRack = GameState.playerRackArr[GameState.currentPlayerIndex];
    removeEmptySets();

    Verify.verifySets(GameState.boardArr);
    Verify.checkIfPlayerPlacedCards(GameState.boardArr);

    GameState.boardArr.forEach(set => 
    {
        Utility.sortByColorAndNumber(set.cards);
    });

    GameState.playerRackArr.forEach(rack => 
    {
        Utility.sortByColorAndNumber(rack.cards);
    });
}

const removeEmptySets = () =>
{
    GameState.boardArr.forEach((set, index) =>
    {
        if (set.cards.length === 0)
        {
            // remove id from setIds
            GameState.setIdArr.forEach((id, index) =>
            {
                if (set.id === `set-${id}`)
                {
                    GameState.setIdArr.splice(index, 1);
                }
            })

            GameState.boardArr.splice(index, 1);
        };
    });
}

const lockDownSets = () =>
{
    // set all cards to isHeld = false
    GameState.boardArr.forEach(set =>
    {
        set.cards.forEach(card =>
        {
            (card.isHeld ? card.isHeld = false : null);
        });
    });
}

let clientsArr = new Array();
let clientsCount;

io.on('connection', socket =>
{
    let clientIP;
    let clientIndex;

    socket.nickname = 'foo';

    // clientId = socket.client.id;
    clientIP = socket.client.conn.remoteAddress;
    // clientsArr = Object.keys(socket.server.eio.clients);
    clientsCount = socket.server.eio.clientsCount;

    if (clientsArr.includes(clientIP) === false)
    {
        clientsArr.push(clientIP);
    }

    clientsArr.forEach((client, index) =>
    {
        if (client === clientIP)
        {
            clientIndex = index;
        }
    });

    console.log('--- user connected');
    console.log({ clientIP, clientsArr });

    socket.emit('player index', clientIndex);

    if (clientsCount === 1)
    {
        startGame();
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    }
    else if (clientsCount > 1)
    {
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    }
    else if (clientsCount > 4)
    {
        return;
    }

    socket.on('disconnect', () =>
    {
        // clientId = socket.server.eio.clients.remoteAddress;
        // clientsArr = Object.keys(socket.server.eio.clients);
        clientsCount = socket.server.eio.clientsCount;
        
        console.log('--- user disconnected');
        console.log({ clientsArr });

        if (clientsCount === 0)
        {
            clientsArr = [];
            clearGame();
        }
    });

    socket.on('game start', () =>
    {
        startGame();
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });

    socket.on('game update', () =>
    {
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });

    socket.on('add group', msg =>
    {
        let setCards = GameState.playerHandArr.splice(0, GameState.playerHandArr.length);

        setCards.forEach(card =>
        {
            card.location = 'set';
        });

        let setId = `set-${Utility.generateSetId()}`;
        let newSet = new Class.Set(setCards, setId);
        GameState.boardArr.push(newSet);
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });

    socket.on('draw card', msg =>
    {
        let r = Math.floor(Math.random() * GameState.deckArr.length);
        let targetCard = GameState.deckArr.splice(r, 1)[0];
        targetCard.isHeld = true;
        GameState.currentPlayerRack.cards.push(targetCard);
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });

    socket.on('advance turn', msg =>
    {
        GameState.turnCounter += 1;
        GameState.currentPlayerIndex = Utility.returnCurrentPlayerIndex(GameState.turnCounter, GameState.playerCount);
        lockDownSets();
        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });
    
    socket.on('select card', msg =>
    {
        if (msg.location === 'player-rack')
        {
            let targetCard = GameState.currentPlayerRack.cards.splice(msg.index, 1)[0];
            targetCard.location = msg.destination;
            GameState.playerHandArr.push(targetCard);
        }

        if (msg.location === 'player-hand' &&
            msg.isHeld)
        {
            let targetCard = GameState.playerHandArr.splice(msg.index, 1)[0];
            targetCard.location = msg.destination;
            GameState.currentPlayerRack.cards.push(targetCard);
        }

        if (msg.location === 'set')
        {
            GameState.boardArr.forEach(set =>
            {
                if (set.id === msg.setId)
                {
                    let targetCard = set.cards.splice(msg.index, 1)[0];
                    targetCard.location = msg.destination;

                    if (msg.destination === 'player-rack')
                    {
                        GameState.currentPlayerRack.cards.push(targetCard);
                    }
                    else if (msg.destination === 'player-hand')
                    {
                        GameState.playerHandArr.push(targetCard);
                    }
                }
            });
        }

        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });

    socket.on('select set', msg =>
    {
        let playerHandCards = GameState.playerHandArr.splice(0, GameState.playerHandArr.length);

        GameState.boardArr.forEach(set =>
        {
            if (set.id === msg)
            {
                playerHandCards.forEach(card =>
                {
                    card.location = 'set';
                    set.cards.push(card);
                });
            }
        });

        updateGameState();
        io.sockets.emit('game update', JSON.stringify(GameState));
    });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));