import React from 'react';
import './App.css';
import './mindlessplay.css'
import {socket} from './service/socket';
import DisplayHand from './displayhand';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css


// TO DO: on game restart, add option to where if one user says restart game, the other has to confirm
class MindlessPlay extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        name: '', 
        opponent: {name: ''}, 
        turn: '', 
        chosenTurn: '3', 
        turnsLeft: [], 
        roundStarted: false, 
        drew: false, 
        deck: [], 
        hand: [], 
        opponentHand: [],
        nextCard: [],
        lastTurn: false,
        wonRound: false,
        picked: false, 
        playerScore: 0,
        playerScores: [],
        opponentScore: 0,
        opponentScores: [],
        rounds: [],
        gameOver: false,
        take: false
      };

      this.handleSelect = this.handleSelect.bind(this);
      this.pickRound = this.pickRound.bind(this);
      this.drawCard = this.drawCard.bind(this);
      this.takeCard = this.takeCard.bind(this);
      this.throwAwayCard = this.throwAwayCard.bind(this);
      this.openNextRound = this.openNextRound.bind(this);
      this.getPoints = this.getPoints.bind(this);
      this.playAgain = this.playAgain.bind(this);
      this.openFullScore = this.openFullScore.bind(this);
    }
  
    componentDidMount() {
  
      this.setState({
        name: sessionStorage.getItem('name'),
        opponent: {
          name: sessionStorage.getItem("opponent_name"),
          id: sessionStorage.getItem("opponent_id")
        }
      }, () => {
        if (sessionStorage.getItem("started") === "true") {
          socket.emit("start game", {playerOne: socket.id, playerTwo: this.state.opponent.id, room: sessionStorage.getItem("room")});
        }

        sessionStorage.setItem("started", false);
      })
      let self = this;

      socket.on("game started", (game) => {
        if (socket.id === game.id) {
          self.setState({
            turn: "YOUR TURN",
            turnsLeft: game.turns
          })
        }
      })

      socket.on("game restarted", (game) => {
        if (socket.id === game.id) {
          self.setState({
            turn: "YOUR TURN",
            gameOver: false,
            turnsLeft: game.turns,
            chosenTurn: '3', 
          })
        }
      })

      socket.on("your turn", (hand) => {
        this.setState({
          turn: true,
          drew: false,
          deck: hand.deck, 
          nextCard: hand.nextCard
        })
      })

      socket.on("last turn", (hand) => {
        this.setState({
          lastTurn: true, 
          turn: true,
          drew: false,
          deck: hand.deck, 
          nextCard: hand.nextCard, 
          opponentScore: this.state.opponentScore + hand.winnerScore, 
          opponentHand: hand.winnerHand
        })
      })

      socket.on("finished round", (hand) => {
        let self = this.state;
        if (this.state.wonRound) {
          this.setState({
            opponentScore: self.opponentScore + hand.loserScore, 
            opponentScores: self.opponentScores.concat(self.opponentScore + hand.loserScore),
            playerScores: self.playerScores.concat(!!self.playerScores[self.playerScores.length - 1] ? self.playerScores[self.playerScores.length - 1] : self.playerScore)
          }, () => {
            this.openNextRound();
          })
        }
        else {
          this.setState({
            playerScore: self.playerScore + hand.loserScore,
            opponentScores: self.opponentScores.concat(!!self.opponentScores[self.opponentScores.length - 1] ? self.opponentScores[self.opponentScores.length - 1] : self.opponentScore),
            playerScores: self.playerScores.concat(self.playerScore + hand.loserScore)
          }, () => {
            this.openNextRound();
          })
        }
      })


      socket.on("dealt hand", (hand) => {
        let nextCard = hand.deck.shift();
        this.setState({
          roundStarted: true,
          hand: hand.hand,
          deck: hand.deck,
          turn: hand.turn,
          nextCard: [nextCard],
          turnsLeft: hand.roundsLeft,
          chosenTurn: hand.round,
          rounds: this.state.rounds.concat(hand.round)
        }, () => {
          sessionStorage.setItem("room", hand.room)
        })
      })

      socket.on("player left", () => {
        confirmAlert({
          buttons: [
            {
              label: "Go to Home Page",
              onClick: () => {
                window.location.href = "/";
              }
            },
          ],
          childrenElement: () => (
            <div>
              <h4>Lost connection with {this.state.opponent.name}.</h4>
            </div>
          ),
        });
      })
    }

    handleSelect(event) {
      this.setState({chosenTurn: event.target.value});
    }

    playAgain() {
      this.setState({
        gameOver: false
      }, () => {
        socket.emit("restart game", {playerOne: socket.id, playerTwo: this.state.opponent.id, room: sessionStorage.getItem("room")});
      })
    }

    openFullScore() {
      let rounds = [];
      for (var i = 0; i < this.state.rounds.length; i++) {
        rounds.push(<tr key="uuid()">
          <td>{this.state.rounds[i]}</td>
          <td>{this.state.playerScores[i]}</td>
          <td>{this.state.opponentScores[i]}</td>
      </tr>)
      }

      confirmAlert({
        title: "Scores",
        buttons: [
          {
            label: "Close",
          },
        ],
        childrenElement: () => (
          <div>
            <table cellSpacing="0" cellPadding="0">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>You</th>
                  <th>{this.state.opponent.name}</th>
                </tr>
              </thead>
              <tbody>
                {rounds}
              </tbody>
            </table>
          </div>
        ),
      });
    }

    openNextRound() {
      confirmAlert({
        title: 'Scores',
        buttons: [
          {
            label: 'Next Round',
            onClick: () => this.setUpNextRound()
          },
        ],
        childrenElement: () => (<div>
            <ul className="results">
              <li className="results"><p>You: {this.state.playerScore}</p></li>
              <li className="results"><p>{this.state.opponent.name}: {this.state.opponentScore}</p></li>
            </ul>
          </div> ),
      });
    }

    setUpNextRound() {
      if (this.state.turnsLeft.length === 0) {
        this.setState({
          picked: !this.state.picked,
          roundStarted: false,
          turn: !this.state.picked,
          wonRound: false, 
          chosenTurn: this.state.turnsLeft[0],
          gameOver: true,
          lastTurn: false
        })
      }
      else {
        this.setState({
          picked: !this.state.picked,
          roundStarted: false,
          turn: !this.state.picked,
          wonRound: false, 
          chosenTurn: this.state.turnsLeft[0],
          lastTurn: false
        })
      }
    }

    pickRound() {
      let roundsLeft = this.state.turnsLeft.filter(val => val !== this.state.chosenTurn);
      socket.emit("next round", {room: sessionStorage.getItem("room"), round: this.state.chosenTurn, 
                                roundsLeft: roundsLeft, playerOne: socket.id, playerTwo: this.state.opponent.id, selector: socket.id});
      this.setState({
        turn: '',
        picked: true
      });
    }

    drawCard() {
      
      if (this.state.turn && !this.state.drew) {
        this.moveElement('img.draw-pile');
        this.setState({
          drew: true, 
          take: false
        }, () => {
          let nextCard = this.state.deck.shift();

          this.setState({
            hand: this.state.hand.concat(nextCard)
          })
        })
      }
    }

    takeCard() {
      if (this.state.turn && !this.state.drew) {
        this.setState({
          drew: true, 
          take: true
        }, () => {
          let nextCard = this.state.nextCard.shift();

          this.setState({
            hand: this.state.hand.concat(nextCard)
          }, () => {
            // setTimeout(() => {
            //   // this.state.nextCard.splice(0, 1);
            //   this.setState({
            //     nextCard: this.state.nextCard.slice(1)
            //   })
            // }, 500)
          })
        })
      }
    }

    throwAwayCard(card) {
      
      let ind = this.state.hand.findIndex(cur => cur.suit === card.suit && cur.number === card.number);
      if (this.state.turn && this.state.drew && !this.state.lastTurn) {
        let card = this.state.hand.splice(ind, 1)
        this.setState({
          drew: false,
          turn: false,
          nextCard: [card[0], ...this.state.nextCard]
        }, () => {
          if (this.hasWon()) {
            this.setState({
              lastTurn: false,
              wonRound: true
            })
        
            socket.emit("last turn", { nextPlayer: sessionStorage.getItem("opponent_id"), deck: this.state.deck, nextCard: this.state.nextCard, room: sessionStorage.getItem("room"), winnerScore: 0, winnerHand: this.state.hand });
          }
          else if (!this.state.lastTurn) {
            socket.emit("your turn", { nextPlayer: sessionStorage.getItem("opponent_id"), deck: this.state.deck, nextCard: this.state.nextCard, room: sessionStorage.getItem("room") });
          }
          else {
            this.setState({
              lastTurn: false
            })
          }
        })
      }

      else if (this.state.lastTurn) {
        let card = this.state.hand.splice(ind, 1)
        this.setState({
          drew: false,
          turn: false,
          nextCard: [card[0], ...this.state.nextCard]
        }, () => {
          let points = this.getPoints();
          socket.emit("finished round", { nextPlayer: sessionStorage.getItem("opponent_id"), deck: this.state.deck, nextCard: this.state.nextCard, room: sessionStorage.getItem("room"), loserScore: points}); 
        })
      }
    }

    getPoints() {
      let tempHand = [...this.state.hand];
      
      let nonWild = tempHand.filter(val => !this.wildCard(val)), 
          wild = tempHand.filter(val => this.wildCard(val));
      nonWild.sort((a, b) => {
        if (this.wildCard(b)) {
          return this.cardNums(b.number) - this.cardNums(a.number)
        }
        else {
          return this.cardNums(a.number) - this.cardNums(b.number)
        }
      });
      tempHand = nonWild.concat(wild);
      
      let sets = 0,
        score = 0;
      while (tempHand.length > 0) {
        let card = tempHand[0];
        
        if (this.set(card, tempHand)) {
          let curSet = [...tempHand.filter(val => this.cardSetEquals(val, card))];
          tempHand = tempHand.filter(val => !this.cardSetEquals(val, card));
          if (curSet.length === 2) {
            tempHand.splice(tempHand.findIndex(card => this.wildCard(card)), 1);
          }
          sets++;
        }
        else if (this.straight(card, tempHand)) {
          let curSet = this.getStraight(card, tempHand);
          tempHand = tempHand.filter(card1 => curSet.findIndex(card2 => card1.suit === card2.suit && card1.number === card2.number) < 0);
          if (curSet.length === 2) {
            tempHand.splice(tempHand.findIndex(card => this.wildCard(card)), 1);
          }
          sets++;
        }
        else {
          if (!this.wildCard(tempHand[0]) || sets === 0) {
            score += this.cardNumsScore(tempHand[0].number);

          }
          tempHand.shift();
        }
      }

      return score;
    }

    hasWon() {
    
      let tempHand = [...this.state.hand],
          goneThrough = false,
          won = false,
          i = 0;

      
      let nonWild = tempHand.filter(val => !this.wildCard(val)), 
          wild = tempHand.filter(val => this.wildCard(val));
      nonWild.sort((a, b) => {
        if (this.wildCard(b)) {
          return this.cardNums(b.number) - this.cardNums(a.number)
        }
        else {
          return this.cardNums(a.number) - this.cardNums(b.number)
        }
      });
      tempHand = nonWild.concat(wild);

      let overload = 0;
      
      while (!goneThrough) {
        let card = tempHand[i];

        if (this.set(card, tempHand)) {
          let curSetTemp = [...tempHand.filter(val => this.cardSetEquals(val, card))], 
              curSet = [];
          for (let j = 0; j < curSetTemp.length; j++) {
            let sameSuits = [...tempHand.filter(val => this.cardSuitEquals(val, curSetTemp[j]) && !this.cardSetEquals(val, curSetTemp[j]) && !this.wildCard(val))]
            sameSuits = sameSuits.concat(tempHand.filter(val => this.wildCard(val)));
            if (!this.straight(curSetTemp[j], sameSuits)) {
              curSet.push(curSetTemp[j]);
            }
          }

          for (let j = 0; j < curSet.length; j++) {
            let card = curSet[j];
            let ind = tempHand.findIndex(cur => card.suit === cur.suit && card.number === cur.number)
            tempHand.splice(ind, 1);
          }


          if (curSet.length === 2) {
            let left = [...tempHand.filter(val => this.cardSetEquals(val, card))];
            if (left.length > 0) {
              let ind = tempHand.findIndex(val => this.cardSetEquals(val, card))
              tempHand.splice(ind, 1);
            }
            else {
              tempHand.splice(tempHand.findIndex(card => this.wildCard(card)), 1);
            }
          }

          // goneThrough = true;
          if (tempHand.length === 0) {
            won = true;
            goneThrough = true;
          }
          else if ((tempHand.length > 0 && tempHand.length < 3) || tempHand.every(card => this.wildCard(card))) {
            if (tempHand.every(card => this.wildCard(card))) {
              won = true;
            }
            goneThrough = true;
          }
          
        }
        else if (this.straight(card, tempHand)) {
          let curSet = this.getStraight(card, tempHand);
          
          for (var j = 0; j < curSet.length; j++) {
            let card = curSet[j];
            let ind = tempHand.findIndex(cur => card.suit === cur.suit && card.number === cur.number)
            tempHand.splice(ind, 1);
          }

          if (curSet.length === 2) {
            tempHand.splice(tempHand.findIndex(card => this.wildCard(card)), 1);
          }

          if (tempHand.length === 0) {
            won = true;
            goneThrough = true;
          }
          else if ((tempHand.length > 0 && tempHand.length < 3) || tempHand.every(card => this.wildCard(card))) {
            if (tempHand.every(card => this.wildCard(card))) {
              won = true;
            }
            goneThrough = true;
          }
          
        }
        else {
          goneThrough = true;
        }

        overload++;
        if (overload > 1000) {
          console.log("OVERLOADED", tempHand);
          goneThrough = true;
        }
      }

      return won;
    }

    containsCard(card, arr) {
      return arr.filter(val => card.suit === val.suit && card.number === val.number).length > 0;
    }

    cardSetEquals(c1, c2) {
      return c1.number === c2.number;
    }

    cardSuitEquals(c1, c2) {
      return c1.suit === c2.suit;
    }

    wildCard(card) {
      return card.number === this.state.chosenTurn || card.suit === 'Jo';
    }

    set(cur, cards) {
      let arr = cards.filter(card => this.cardSetEquals(card, cur));
      if (arr.length === 2) {
        return cards.filter(card => this.wildCard(card)).length >= 1;
      }
      else  {
        console.log(arr.length >= 3);
        return arr.length >= 3;
      } 
    }


    getStraight(cur, cards) {
      cards = [...cards]; 
      let wildCards = cards.filter(card => this.wildCard(card));
      let arr = cards.filter(card => this.cardSuitEquals(card, cur) && !this.wildCard(card));
      arr.sort((a, b) => this.cardNums(a.number) - this.cardNums(b.number));

      let finished = false,
          last = arr[0],
          curSet = [last],
          i = 1;
      while (!finished) {
        if (i < arr.length && this.cardNums(arr[i].number) === this.cardNums(last.number) + 1) {
          curSet.push(arr[i]);
          last = arr[i];
          i++;
        }
        else if (i < arr.length && this.cardNums(arr[i].number) !== this.cardNums(last.number) && this.cardNums(arr[i].number) - wildCards.length <= this.cardNums(last.number) + 1) {
          let inc = this.cardNums(arr[i].number) - (this.cardNums(last.number) + 1);
          for (var j = 0; j < inc; j++) {
            curSet.push(wildCards.pop());
          }
          curSet.push(arr[i]);
          last = arr[i];
          i++;
        }
        else {
          finished = true;
        }
      }
      return curSet;
    }

    straight(cur, cards) {
      cards = [...cards]; 
      let arr = cards.filter(card => this.cardSuitEquals(card, cur) && !this.wildCard(card));
      let wildCards = cards.filter(card => this.wildCard(card));
      arr.sort((a, b) => this.cardNums(a.number) - this.cardNums(b.number));
      if (arr.length < 3 && wildCards.length === 0) {
        return false;
      }
      else {
        let highest = 1, 
            current = 1,
            last = arr[0];
        for (var i = 1; i < arr.length; i++) {
          if (this.cardNums(arr[i].number) === this.cardNums(last.number) + 1) {
            current++;
            highest = Math.max(current, highest);
            last = arr[i];
          }
          else if (this.cardNums(arr[i].number) !== this.cardNums(last.number) && this.cardNums(arr[i].number) - wildCards.length <= this.cardNums(last.number) + 1) {
            let inc = this.cardNums(arr[i].number) - this.cardNums(last.number) + 1;
            current += inc;
            highest = Math.max(current, highest);
            last = arr[i];
            for (var j = 0; j < inc; j++) {
              wildCards.pop();
            }
          }
          else if (this.cardNums(arr[i].number) !== this.cardNums(last.number)) {
            current = 0;
          }
        }

        if (highest === 2) {
          return wildCards.length >= 1;
        }
        else {
          return highest >= 3;
        }
        
      }
    }

    cardNums(round) {
      if (!!parseInt(round)) {
        return parseInt(round);
      } else if (round === 'J') {
        return 11;
      } else if (round === 'A') {
        return 1;
      } else if (round === 'Q') {
        return 12;
      } else if (round === 'K') {
        return 13;
      } else {
        return 20;
      }
    }
    cardNumsScore(round) {
      if (!!parseInt(round)) {
        return 5;
      }
      else if (round === 'J' || round === 'Q' || round === 'K') {
        return 10;
      }
      else if (round === 'A') {
        return 15;
      }
      else {
        return 20;
      }
    }

    moveElement(str) {
      // let cards = document.querySelectorAll('img.in-play'),
      //     card = cards[cards.length - 1], 
      //     selectedCard = document.querySelector(str);
      // console.log(selectedCard.getBoundingClientRect(), card.getBoundingClientRect());
      // // let img = document.querySelector('img.draw-pile'),
      // //     sourceX = img.offsetLeft,
      // //     sourceY = img.offsetTop;

      // selectedCard.style.top = selectedCard.getBoundingClientRect().height + 'px';
      // selectedCard.style.left = selectedCard.getBoundingClientRect().left + 'px';

      // // let img2 = document.querySelector('img.draw-pile2'),
      // //     destX = img2.offsetLeft,
      // //     destY = img2.offsetTop;
      // selectedCard.style.top = card.getBoundingClientRect().height + 'px';
      // selectedCard.style.left = card.getBoundingClientRect().left + 'px';

      // img.style.top = destY + 'px';
      // img.style.left = destX + 'px';
  }

    render() {
      let value;
      if (this.state.gameOver) {
        value = (
          <div>
            <h4>GAME OVER</h4>
            {this.state.playerScore < this.state.opponentScore ? <h1>YOU WON</h1> : <h1>YOU LOST</h1>}
            <li className="results"><h4>You: {this.state.playerScore}</h4></li>
            <li className="results"><h4>{this.state.opponent.name}: {this.state.opponentScore}</h4></li>
            <button className="btn btn-primary" onClick={this.playAgain}>Play again</button>
          </div>
        )
      }
      else if (this.state.roundStarted) {

        // TO DO: figure out animations for card drawing based on round- maybe move it to the display hand??
        // another idea: have a "move" log where you can see what each user does for each round. this in addition to seeing the outcome of the user's move.
        // once you get the user's move functionality down (ie you can see what they took), it would be relatively simple to get the animations going for this. just 
        // make each card position: absolute. I want to have at least some animation in there

        // another idea- have this logic in the display hand page. create the position: absolute element once the button is clicked so that it's able to animate. 
        // in addition, when the user clicks the draw card, the component will use document.query selector to get it and then pull it and use 'appendChild' to put it in the correct 
        // element. Then, it'll change the styling to fit with what it needs (should be as simple as removing/adding a class).
        // you can also just put each of the images in a div with the correct styling and then have the images be position: absolute. this would make the above easy as fuck
        value = (
          <div>
            {this.state.turn ? <h1>Your Turn</h1> : <h1>{sessionStorage.getItem("opponent_name")}'s turn</h1>}
            
            <div className="deck">
              <img alt="draw pile" src={process.env.PUBLIC_URL + '/cards/back.png'} onClick={this.drawCard} className="draw-pile"></img>
              {!!this.state.nextCard.length ? 
                <img alt="next card" src={process.env.PUBLIC_URL + '/cards/' + this.state.nextCard[0].number + this.state.nextCard[0].suit + '.svg'} onClick={this.takeCard} className="draw-card"></img> 
                : <div className="draw-card"></div>}
            </div>
            
            <DisplayHand hand={this.state.hand} throwAway={this.throwAwayCard} draw={this.state.take}></DisplayHand>
          </div>
        
        )
      }
      else if (!!this.state.turn && this.state.turnsLeft.length > 0) {
        value = <div>
            <select className="form-select form-select-sm select-form" value={this.state.chosenTurn} onChange={this.handleSelect}>
            {this.state.turnsLeft.map((turn, ind) => <option key={ind} value={turn}>{turn}</option>)}
          </select>
          <br></br>
          <button className="btn btn-primary" onClick={this.pickRound}>Pick round</button>
          </div>
      }
      else if (!this.state.roundStarted) {
        value = <h1>Waiting for {this.state.opponent.name} to pick the round...</h1>
      }
      
      return (
        <div className="App">

          {!!this.state.chosenTurn && this.state.roundStarted && <h4>Round: {this.state.chosenTurn}</h4>}
          <div style={{marginTop: '40px', height: '40px'}}>
            <p style={{float: 'left', marginLeft: '100px'}}>{this.state.name} (You): {this.state.playerScore}</p>
            <a onClick={this.openFullScore} style={{width: '20%', left: '40%', position: 'absolute', cursor: 'pointer', textDecoration: 'underline'}}>Full Score</a>
            <p style={{float: 'right', marginRight: '100px'}}>{this.state.opponent.name}: {this.state.opponentScore}</p>
          </div>
          

          {this.state.lastTurn && 
          <div>
            <h1>{sessionStorage.getItem("opponent_name")} won!</h1>
            <DisplayHand hand={this.state.opponentHand} throwAway={this.throwAwayCard}></DisplayHand>
          </div>
          }

          {this.state.wonRound && <h1>You won this round!</h1>}
          <br></br>
          {value}
        </div>
      );
    }
  }
  export default MindlessPlay;