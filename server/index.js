const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const socketio = require('socket.io');
const io = socketio(server);
const PORT = 8000;

const Class = require('./js/classes.js');
const { setUpGame } = require('./js/game-setup.js');
const GameState = require('./js/game-state.js');
const Utility = require('./js/utils.js');
const Verify = require('./js/verify.js');

app.use(express.static('../public'));
app.get('/', (req, res) => { res.sendFile('index.html') });

let clientsArr = new Array();

const updateLocations = () =>
{
    GameState.playerHandArr.forEach(hand =>
    {
        hand.cards.forEach(card => card.location = 'player-hand');
    })

    GameState.playerRackArr.forEach(rack =>
    {
        rack.cards.forEach(card => card.location = 'player-rack');
    })

    GameState.boardArr.forEach(set =>
    {
        set.cards.forEach(card => card.location = 'set');
    })
}

const updateGameState = () =>
{
    GameState.currentPlayerHand = GameState.playerHandArr[GameState.currentPlayerIndex];
    GameState.currentPlayerRack = GameState.playerRackArr[GameState.currentPlayerIndex];
    removeEmptySets();

    Verify.verifySets(GameState.boardArr);
    Verify.checkIfCardsAdded(GameState.boardArr);

    updateLocations();

    GameState.boardArr.forEach(set => Utility.sortByColorAndNumber(set.cards));
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
    GameState.playerRackArr.forEach(rack =>
    {
        rack.cards.forEach(card => card.isHeld = true);
    });

    GameState.boardArr.forEach(set =>
    {
        set.cards.forEach(card => card.isHeld = false);
    });
}

const updateScore = () =>
{
    GameState.playerRackArr.forEach(rack =>
    {
        let score = 0;

        rack.cards.forEach(card => 
        {
            if (card.type != 'cell')
                score += 1;
        });

        rack.score = score;
    })
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
        setUpGame();
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

    // console.log({ clientsCount, clientsArr });

    socket.on('disconnect', () =>
    {
        clientsCount = socket.server.eio.clientsCount;

        if (clientsCount === 0)
            clientsArr = [];

        // console.log({ clientsCount, clientsArr });
    });

    socket.on('load game', () =>
    {
        updateGameState();
        emitGameState();
    });

    socket.on('add set', () =>
    {
        let setCards = GameState.currentPlayerHand.cards.splice(0, GameState.currentPlayerHand.cards.length);
        let setId = `set-${Utility.generateSetId()}`;
        let newSet = new Class.Set(setCards, setId);
        GameState.boardArr.push(newSet);
        updateGameState();
        emitGameState();
    });

    socket.on('advance turn', () =>
    {
        if (GameState.isValidBoard)
        {
            if (GameState.isCardsAdded === false &&
                GameState.deckArr.length > 0)
            {
                let r = Math.floor(Math.random() * GameState.deckArr.length);
                let targetCard = GameState.deckArr.splice(r, 1)[0];
                let targetCellIndex = GameState.currentPlayerRack.cards.findIndex(cell => cell.type === 'cell');
                GameState.currentPlayerRack.cards.splice(targetCellIndex, 1, targetCard);
            }

            if (GameState.currentPlayerRack.score === 0)
            {
                io.sockets.emit('game over', GameState.currentPlayerRack.name);
            }
            else
            {
                GameState.turnCounter += 1;
                GameState.currentPlayerIndex = Utility.returnCurrentPlayerIndex(GameState.turnCounter, GameState.playerCount);
                lockSets();
                updateScore();
                updateGameState();
                emitGameState();
            }
        }
    });
    
    socket.on('select card', msg =>
    {
        let targetCardData = JSON.parse(msg);
        let targetPlayerHand = GameState.playerHandArr[targetCardData.thisPlayerIndex];
        let targetPlayerRack = GameState.playerRackArr[targetCardData.thisPlayerIndex];

        if (targetCardData.location === 'player-rack')
        {
            let targetCard = targetPlayerRack.cards.splice(targetCardData.index, 1)[0];

            if (targetPlayerHand.cards.length === 0)
            {
                // if hand is empty, insert cell where the target card was
                targetPlayerRack.cards.splice(targetCardData.index, 0, new Class.Cell());
            }
            else if (targetPlayerHand.cards.length === 1)
            {
                // if hand = 1, insert held card where the target card was
                let heldCard = targetPlayerHand.cards.splice(0, 1)[0];
                targetPlayerRack.cards.splice(targetCardData.index, 0, heldCard);
            }

            targetPlayerHand.cards.push(targetCard);
        }

       if (targetCardData.location === 'set')
        {
            let targetSet = GameState.boardArr.find(set => set.id === targetCardData.setId);

            if (GameState.currentPlayerHand.cards.length === 0)
            {
                let targetCard = targetSet.cards.splice(targetCardData.index, 1)[0];
                GameState.currentPlayerHand.cards.push(targetCard);
            }
            else if (GameState.currentPlayerHand.cards.length === 1)
            {
                let heldCard = GameState.currentPlayerHand.cards.splice(0, 1)[0];
                targetSet.cards.push(heldCard);
            }
        }

        updateGameState();
        emitGameState();
    });

    socket.on('select cell', msg =>
    {
        let targetCellData = JSON.parse(msg);
        let targetPlayerHand = GameState.playerHandArr[targetCellData.thisPlayerIndex];
        let targetPlayerRack = GameState.playerRackArr[targetCellData.thisPlayerIndex];

        // if hand = 1 and that card isHeld, replace cell with heldCard
        if (targetPlayerHand.cards.length === 1 &&
            targetPlayerHand.cards[0].isHeld === true)
        {
            let heldCard = targetPlayerHand.cards.splice(0, 1)[0];
            targetPlayerRack.cards.splice(targetCellData.index, 1, heldCard);
            updateGameState();
            emitGameState();
        }
    });

    socket.on('select set', targetSetId =>
    {
        let targetSet = GameState.boardArr.find(set => set.id === targetSetId);

        if (GameState.currentPlayerHand.cards.length === 0)
        {
            let targetSetCards = targetSet.cards.splice(0, targetSet.cards.length);
            targetSetCards.forEach(card => GameState.currentPlayerHand.cards.push(card));
        }
        else if (GameState.currentPlayerHand.cards.length >= 1)
        {
            let playerHandCardsArr = GameState.currentPlayerHand.cards.splice(0, GameState.currentPlayerHand.cards.length);
            playerHandCardsArr.forEach(card => targetSet.cards.push(card));
        }

        updateGameState();
        emitGameState();
    });
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));
