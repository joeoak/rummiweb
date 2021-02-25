const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const socketio = require('socket.io');
const io = socketio(server);
const PORT = 8000;

const Class = require('./scripts/classes.js');
const GameSetup = require('./scripts/game-setup.js');
const GameState = require('./scripts/game-state.js');
const Utility = require('./scripts/utilities.js');
const Verify = require('./scripts/verify.js');

app.use(express.static('../public'));
app.get('/', (req, res) => { res.sendFile('index.html') });

let clientsArr = new Array(),
    clientsCount;

const startGame = () =>
{
    GameState.deckArr = [];
    GameState.boardArr = [];
    GameState.playerRackArr = [];
    GameState.playerHandArr = [];
    GameState.turnCounter = 1;
    GameState.playerCount = 2;
    GameState.currentPlayerIndex = 0;
    GameSetup.initiateDeck(GameState.deckArr);
    GameSetup.distributeCards(GameState.deckArr, GameState.playerRackArr, 2);
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
    Verify.checkIfCardsAdded(GameState.boardArr);

    GameState.boardArr.forEach(set => 
    {
        Utility.sortByColorAndNumber(set.cards);
    });

    // GameState.playerRackArr.forEach(rack => 
    // {
    //     Utility.sortByColorAndNumber(rack.cards);
    // });
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

const lockSets = () =>
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

io.on('connection', socket =>
{
    const emitGameState = () => io.sockets.emit('game update', JSON.stringify(GameState));

    let clientsCount = socket.server.eio.clientsCount,
        clientIndex = socket.server.eio.clientsCount,
        clientIP = socket.client.conn.remoteAddress;
        

    // socket.nickname = 'foo';
    // clientId = socket.client.id;
    // clientsArr = Object.keys(socket.server.eio.clients);

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

    socket.emit('player index', clientIndex);

    if (clientsCount === 1)
    {
        startGame();
        updateGameState();
        emitGameState();
    }
    else if (clientsCount > 1)
    {
        updateGameState();
        emitGameState();
    }
    else if (clientsCount > 4)
    {
        return;
    }

    console.log({ clientsCount, clientsArr });

    socket.on('disconnect', () =>
    {
        clientsCount = socket.server.eio.clientsCount;

        if (clientsCount === 0)
        {
            clientsArr = [];
            clearGame();
        }

        console.log({ clientsCount, clientsArr });
    });

    socket.on('game start', () =>
    {
        startGame();
        updateGameState();
        emitGameState();
    });

    socket.on('game update', () =>
    {
        updateGameState();
        emitGameState();
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
        emitGameState();
    });

    socket.on('draw card', msg =>
    {
        let r = Math.floor(Math.random() * GameState.deckArr.length);
        let targetCard = GameState.deckArr.splice(r, 1)[0];
        targetCard.isHeld = true;
        GameState.currentPlayerRack.cards.push(targetCard);
        updateGameState();
        emitGameState();
    });

    socket.on('advance turn', msg =>
    {
        GameState.turnCounter += 1;
        GameState.currentPlayerIndex = Utility.returnCurrentPlayerIndex(GameState.turnCounter, GameState.playerCount);
        lockSets();
        updateGameState();
        emitGameState();
    });
    
    socket.on('select card', msg =>
    {
        /*
        if (msg.location === 'player-rack')
        {
            let targetCard = GameState.currentPlayerRack.cards.splice(msg.index, 1)[0];
            targetCard.location = msg.destination;
            GameState.playerHandArr.push(targetCard);

            GameState.currentPlayerRack.cards.splice(msg.index, 0, new Class.Cell());
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
        */

        if (msg.location === 'player-rack')
        {
            let targetCard = GameState.currentPlayerRack.cards.splice(msg.index, 1)[0];
            targetCard.location = msg.destination;

            if (GameState.playerHandArr.length === 1)
            {
                let heldCard = GameState.playerHandArr.splice(0, 1)[0];
                heldCard.location = 'player-rack';
                GameState.currentPlayerRack.cards.splice(msg.index, 0, heldCard);
            }
            else
            {
                GameState.currentPlayerRack.cards.splice(msg.index, 0, new Class.Cell());
            }

            GameState.playerHandArr.push(targetCard);
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
        emitGameState();
    });

    socket.on('select cell', msg =>
    {
        // console.log(msg);
        let targetCard = GameState.playerHandArr.splice(0, 1)[0];
        targetCard.location = 'player-rack';
        GameState.currentPlayerRack.cards.splice(msg, 1, targetCard);

        updateGameState();
        emitGameState();
    });

    socket.on('select set', msg =>
    {
        let playerHandCardsArr = GameState.playerHandArr.splice(0, GameState.playerHandArr.length);

        GameState.boardArr.forEach(set =>
        {
            if (set.id === msg)
            {
                playerHandCardsArr.forEach(card =>
                {
                    card.location = 'set';
                    set.cards.push(card);
                });
            }
        });

        updateGameState();
        emitGameState();
    });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));