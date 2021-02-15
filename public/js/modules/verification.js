let isBoardValid,
    isPlayerPlacedCards;

const checkIfPlayerPlacedCards = board =>
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

const isAllEqual = set =>
{
    let newArr = new Array();

    if (isContainsJoker(set).validate === false)
    {
        newArr = set.cards;
    }
    else
    {
        set.cards.forEach(card =>
        {
            if (card.type !== 'joker') { newArr.push(card) }; // ignore jokers
        })
    }

    return newArr.every(card => card.num === newArr[0].num);
}

const isConsecutive = (set, type) =>
{
    let sequence = new Array(),
        differences = new Array(),
        errorCount = 0;

    // build new array of numbers. ignore jokers
    set.cards.forEach(card =>
    {
        if (card.num != null) { sequence.push(card.num) };
    })

    sequence.sort((a, b) => { return a - b }); // sort new array of numbers

    // build new array of differences
    sequence.forEach((val, index) =>
    {
        if (index > 0)
        {
            differences.push(val - sequence[index - 1]);
        }
    });

    // count errors
    differences.forEach(difference =>
    {
        errorCount += difference - 1;
    })

    return {
        validate: differences.every(val => val === 1),
        errorCount: errorCount,
    }
}

const isDifferentColors = set =>
{
    let newArr = new Array();

    if (isContainsJoker(set).validate === false)
    {
        newArr = set.cards;
    }
    else
    {
        set.cards.forEach(card =>
        {
            if (card.type !== 'joker') { newArr.push(card) }; // ignore jokers
        })
    }

    // count amounts of each color
    let counter = {};
    newArr.forEach(card =>
    {
        counter[card.color] = (counter[card.color] || 0) + 1;
    });

    return Object.values(counter).every(val => val <= 1); // check if any amount > 1
}

const isSameColors = set =>
{
    let newArr = new Array();

    if (isContainsJoker(set).validate === false)
    {
        newArr = set.cards;
    }
    else
    {
        set.cards.forEach(card =>
        {
            if (card.type !== 'joker') { newArr.push(card) }; // ignore jokers
        })
    }

    return newArr.every(card => card.color === newArr[0].color);
}

const isContainsJoker = set =>
{
    let jokerCount = 0;

    set.cards.forEach(card =>
    {
        if (card.type === 'joker') { jokerCount += 1 };
    });

    return {
        validate: set.cards.some(card => card.type === 'joker'),
        jokerCount: jokerCount,
    }
}

const verifySets = board =>
{
    isBoardValid = true; // assume true to start

    board.forEach(set =>
    {
        if (set.cards.length >= 3)
        {
            if (isDifferentColors(set) && set.cards.length <= 4) // if different colors (one of each)
            {
                if (isAllEqual(set)) // if all same numbers
                {
                    set.isValid = true;
                }
                else // if not all the same numbers
                {
                    set.isValid = false;
                    isBoardValid = false;
                }
            }
            else if (isSameColors(set) && set.cards.length <= 13) // if all same colors
            {
                if (isContainsJoker(set).jokerCount === 0 && isConsecutive(set).errorCount === 0) // if consecutive
                {
                    set.isValid = true;
                }
                else if (isContainsJoker(set).jokerCount === 1 && isConsecutive(set).errorCount <= 1)
                {
                    set.isValid = true;
                }
                else if (isContainsJoker(set).jokerCount === 2 && isConsecutive(set).errorCount <= 2)
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
        else // if a set contains less than 3 cards
        {
            set.isValid = false;
            isBoardValid = false;
        }
    });
}

export { isBoardValid, isPlayerPlacedCards, checkIfPlayerPlacedCards, verifySets };