const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const socketio = require('socket.io');
const io = socketio(server);
const PORT = 8000;

const Class = require('./js/classes.js');
const GameSetup = require('./js/game-setup.js');
const { playerHandArr } = require('./js/game-state.js');
const GameState = require('./js/game-state.js');
const Utility = require('./js/utilities.js');
const Verify = require('./js/verify.js');

app.use(express.static('../public'));
app.get('/', (req, res) => { res.sendFile('index.html') });

let clientsArr = new Array();

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

const updateLocation = (arr, str) =>
{
    arr.forEach(card =>
    {
        card.location = str;
    })
}

const updateGameState = () =>
{
    GameState.currentPlayerRack = GameState.playerRackArr[GameState.currentPlayerIndex];
    removeEmptySets();

    Verify.verifySets(GameState.boardArr);
    Verify.checkIfCardsAdded(GameState.boardArr);

    updateLocation(GameState.playerHandArr, 'player-hand');

    GameState.playerRackArr.forEach(rack =>
    {
        updateLocation(rack.cards, 'player-rack');
    })

    GameState.boardArr.forEach(set =>
    {
        updateLocation(set.cards, 'set');
    })

    GameState.boardArr.forEach(set => 
    {
        Utility.sortByColorAndNumber(set.cards);
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

    clientIndex = clientsArr.findIndex(client => client === clientIP);

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

    socket.on('add set', () =>
    {
        let setCards = GameState.playerHandArr.splice(0, GameState.playerHandArr.length);
        let setId = `set-${Utility.generateSetId()}`;
        let newSet = new Class.Set(setCards, setId);
        GameState.boardArr.push(newSet);
        updateGameState();
        emitGameState();
    });

    socket.on('draw card', () =>
    {
        let r = Math.floor(Math.random() * GameState.deckArr.length);
        let targetCard = GameState.deckArr.splice(r, 1)[0];
        targetCard.isHeld = true;
        GameState.currentPlayerRack.cards.push(targetCard);
        updateGameState();
        emitGameState();
    });

    socket.on('advance turn', () =>
    {
        GameState.turnCounter += 1;
        GameState.currentPlayerIndex = Utility.returnCurrentPlayerIndex(GameState.turnCounter, GameState.playerCount);
        lockSets();
        updateGameState();
        emitGameState();
    });
    
    socket.on('select card', msg =>
    {
        console.log('card received');
        
        let targetCardData = JSON.parse(msg);

        if (targetCardData.location === 'player-rack')
        {
            let targetCard = GameState.currentPlayerRack.cards.splice(targetCardData.index, 1)[0];

            if (GameState.playerHandArr.length === 0)
            {
                GameState.currentPlayerRack.cards.splice(targetCardData.index, 0, new Class.Cell());
            }
            else if (GameState.playerHandArr.length === 1)
            {
                let heldCard = GameState.playerHandArr.splice(0, 1)[0];
                GameState.currentPlayerRack.cards.splice(targetCardData.index, 0, heldCard);
            }

            GameState.playerHandArr.push(targetCard);
        }

       if (targetCardData.location === 'set')
        {
            let targetSet = GameState.boardArr.find(set => set.id === targetCardData.setId);

            if (GameState.playerHandArr.length === 0)
            {
                let targetCard = targetSet.cards.splice(targetCardData.index, 1)[0];
                GameState.playerHandArr.push(targetCard);
            }
            else if (GameState.playerHandArr.length === 1)
            {
                let heldCard = GameState.playerHandArr.splice(0, 1)[0];
                targetSet.cards.push(heldCard);
            }
        }

        updateGameState();
        emitGameState();
    });

    socket.on('select cell', targetCellIndex =>
    {
        if (GameState.playerHandArr.length === 1 &&
            GameState.playerHandArr[0].isHeld === true)
        {
            let heldCard = GameState.playerHandArr.splice(0, 1)[0];
            GameState.currentPlayerRack.cards.splice(targetCellIndex, 1, heldCard);
            updateGameState();
            emitGameState();
        }
    });

    socket.on('select set', targetSetId =>
    {
        let targetSet = GameState.boardArr.find(set => set.id === targetSetId);

        if (GameState.playerHandArr.length === 0)
        {
            let targetSetCards = targetSet.cards.splice(0, targetSet.cards.length);
            targetSetCards.forEach(card => GameState.playerHandArr.push(card));
        }
        else if (GameState.playerHandArr.length >= 1)
        {
            let playerHandCardsArr = GameState.playerHandArr.splice(0, GameState.playerHandArr.length);
            playerHandCardsArr.forEach(card => targetSet.cards.push(card));
        }

        updateGameState();
        emitGameState();
    });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));
