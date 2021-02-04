let isBoardValid,
    isPlayerPlacedCards;

const checkIfPlayerPlacedCards = (board) =>
{
    isPlayerPlacedCards = false; // assume false to start

    board.forEach(set =>
    {
        set.cards.forEach(card =>
        {
            if (card.isHeld === true)
            {
                isPlayerPlacedCards = true;
            }
        })
    });
}

const isAllEqual = (arr) =>
{
    return arr.every(val => val.num === arr[0].num);
}

const isConsecutive = (arr) =>
{
    let sequence = new Array(),
        differences = new Array();

    arr.forEach(val =>
    {
        sequence.push(val.num); // build new array of numbers
    })

    sequence.sort((a, b) =>
    {
        return a - b; // sort new array of numbers
    });

    sequence.forEach((val, index) =>
    {
        if (index > 0)
        {
            differences.push(val - sequence[index - 1]); // build new array of differences
        }
    });

    return differences.every(val => val === 1); // check if any differences > 1
}

const isDifferentColors = (arr) =>
{
    // count amounts of each color
    let counter = {};
    arr.forEach(val =>
    {
        counter[val.color] = (counter[val.color] || 0) + 1;
    });

    return Object.values(counter).every(val => val <= 1); // check if any amount > 1
}

const isSameColors = (arr) =>
{
    return arr.every(val => val.color === arr[0].color);
}

const verifySets = (board) =>
{
    isBoardValid = true; // assume true to start

    board.forEach((set) =>
    {
        if (set.cards.length < 3)
        {
            set.isValid = false;
            isBoardValid = false;
        }
        else
        {
            if (isDifferentColors(set.cards)) // if different colors, one of each
            {
                if (isAllEqual(set.cards)) // if all same numbers
                {
                    set.isValid = true;
                }
                else
                {
                    set.isValid = false;
                    isBoardValid = false;
                }
            }
            else if (isSameColors(set.cards)) // if all same colors
            {
                if (isConsecutive(set.cards)) // if consecutive
                {
                    set.isValid = true;
                }
                else
                {
                    set.isValid = false;
                    isBoardValid = false;
                }
            }
            else
            {
                set.isValid = false;
                isBoardValid = false;
            }
        }
    });
}

export { isBoardValid, isPlayerPlacedCards, checkIfPlayerPlacedCards, verifySets };