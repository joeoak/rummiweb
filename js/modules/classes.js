function Card(color, id, num, type, onClickFn)
{
    this.color = color;
    this.isHeld = false;
    this.id = id;
    this.location = 'player-rack';
    this.num = num;
    this.type = type;

    this.render = (onClickFn) =>
    {
        let newCard = document.createElement('div');
        newCard.id = this.id;
        newCard.classList.add('card');
        newCard.onclick = (e) => onClickFn(e);
        
        if (this.type === 'num')
        {
            newCard.classList.add(this.color);
            newCard.innerHTML = this.num;
        }
        else if (this.type === 'joker')
        {
            newCard.classList.add(this.type);
            newCard.innerHTML = `🙂`;
        }

        if (this.isHeld && this.location != 'player-rack')
        {
            newCard.classList.add('held');
        }

        return newCard;
    }
}

function PlayerRack(name, cards)
{
    this.name = name;
    this.cards = cards;
}

function Set(id, cards)
{
    this.id = id;
    this.isValid = false;
    this.cards = cards;   
}

export { Card, PlayerRack, Set };