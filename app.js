const deck = document.getElementById("deck");
const cardsRemaining = document.getElementById("cards-remaining");
const instructions = document.getElementById("instructions");
const p1Hand = document.getElementById("p1-hand");
const p2Hand = document.getElementById("p2-hand");
const continueBtn = document.getElementById("continueBtn");
const p1CardCntP = document.getElementById("p1-card-cnt");
const p2CardCntP = document.getElementById("p2-card-cnt");
let deckId;
let cardsRemainingVal = 52;

function init() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1").then((response) => response.json()).then((response) => {
        deckId = response.deck_id;
        console.log(deckId);
    });
    updateCardsRemaining();
    continueBtn.style = "display:none";
    instructions.textContent = "Click the deck above to deal cards";
    deck.addEventListener("click", dealCards);
    deck.style = "cursor:pointer;"

}

function updateInstructions(str) {
    instructions.textContent = str;
}

function updateCardsRemaining() {
    cardsRemaining.textContent = `Cards Remaining = ${cardsRemainingVal}`;
}
let dict = {};
let p1CardCnt = {};
let p2CardCnt = {};
//phase 1: The deck is clicked and cards are dealt
function dealCards() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=14`).then((response) => response.json())
        .then((responseObject) => {
            let i = 0;
            responseObject.cards.forEach((card) => {
                console.log(card);
                let img = document.createElement('img');
                //map img src to card value
                img.setAttribute('src', card.image);
                dict[card.image] = card.value;
                if (i % 2 == 0) {
                    img.style = "margin-right:30px; margin-bottom:30px;"
                    p1CardCnt[card.value] = 1;
                    p1Hand.appendChild(img);
                } else {
                    img.style = " margin-left:30px;margin-bottom:30px;"
                    p2CardCnt[card.value] = 1;
                    p2Hand.appendChild(img);
                }
                i++;
            })
            cardsRemainingVal -= 14;
            updateCardsRemaining();
            instructions.textContent = "Choose a card to ask for";
            //remove styling and click function  for deck
            deck.style = "box-shadow:none;cursor:default";
            deck.removeEventListener("click", dealCards)
            updateP1(true);
            updateP1CardCnt();
            updateP2CardCnt()
        });

}

function updateP2CardCnt() {
    let keys = Object.keys(p2CardCnt);
    let str = "Player 2 Card Count: ";
    keys.forEach((key) => {
        str += key + " : " + p2CardCnt[key] + ", ";
    })
    p2CardCntP.textContent = str;
}

function updateP1CardCnt() {
    let keys = Object.keys(p1CardCnt);
    let str = "Player 1 Card Count: ";
    keys.forEach((key) => {
        str += key + " : " + p1CardCnt[key] + ", ";
    })
    p1CardCntP.textContent = str;
}

function updateP1(turnOn) {
    let nodes = p1Hand.childNodes;
    if (turnOn === true) {
        nodes.forEach((card) => {

            card.style = " margin-right:30px; margin-bottom:30px; box-shadow: 0px 0px 5px 5px blue;";
            card.addEventListener("click", askForCard);

        })
    } else {
        nodes.forEach((card) => {
            card.style = " margin-right:30px; margin-bottom:30px; box-shadow: none;";
            card.removeEventListener("click", askForCard);
        })
    }

}

//phase 2a: player 1 chooses a card to ask for and hits continue
function askForCard() {
    updateP1(false);
    updateInstructions(`You requested any ${dict[this.currentSrc]} values from player 2`);
    continueBtn.style = "display:inline;"
}

//phase 2b: player 1 ww
init();