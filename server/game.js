const { Card, PlayerRack } = require('./classes.js');

const initiateDeck = (deckArr) => 
{   
    const colorArr = ['color0', 'color1', 'color2', 'color3'];
    const seriesArr = ['a', 'b'];

    seriesArr.forEach(series =>
    {
        colorArr.forEach(color =>
        {
            for (let num = 1; num <= 13; num++)
            {
                deckArr.push(new Card(
                    color, 
                    `${color}-${num}-${series}`,
                    num,
                    'num'
                ));
            }
        });

        deckArr.push(new Card(
            null,
            `joker-${series}`,
            null,
            'joker'
        ));
    });
}

const distributeCards = (deckArr, playerRackArr, playerCount) =>
{
    for (let i = 1; i <= playerCount; i++)
    {
        let newRackArr = new Array(); // todo: add 'Arr' to variable names

        for (let j = 0; j < 14; j++)
        {
            let r = Math.floor(Math.random() * deckArr.length);
            let targetCard = deckArr.splice(r, 1)[0];
            targetCard.isHeld = true;
            newRackArr.push(targetCard);
        }

        playerRackArr.push(new PlayerRack(
            newRackArr, 
            `Player ${i}`, 
            i - 1)
        );
    }
}

module.exports =
{
    initiateDeck,
    distributeCards,
}
