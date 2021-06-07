import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import './App.css';
import {socket} from './service/socket';
import DisplayHand from './displayhand';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css


class MindlessPlay extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        name: '', 
        opponent: {name: ''}, 
        turn: '', 
        chosenTurn: '8', 
        turnsLeft: [], 
        roundStarted: false, 
        drew: false, 
        deck: [], 
        hand: [], 
        nextCard: [],
        lastTurn: false,
        wonRound: false,
        picked: false, 
        playerScore: 0,
        opponentScore: 0
      };

      this.handleSelect = this.handleSelect.bind(this);
      this.pickRound = this.pickRound.bind(this);
      this.drawCard = this.drawCard.bind(this);
      this.takeCard = this.takeCard.bind(this);
      this.throwAwayCard = this.throwAwayCard.bind(this);
      this.openNextRound = this.openNextRound.bind(this);
      this.getPoints = this.getPoints.bind(this);
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
          opponentScore: this.state.opponentScore + hand.winnerScore
        })
      })

      socket.on("finished round", (hand) => {
        if (this.state.wonRound) {
          this.setState({
            opponentScore: this.state.opponentScore + hand.loserScore
          }, () => {
            this.openNextRound();
          })
        }
        else {
          this.setState({
            playerScore: this.state.playerScore + hand.loserScore
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
          chosenTurn: hand.round
        }, () => {
          sessionStorage.setItem("room", hand.room)
        })
      })
    }

    home() {
      window.location.href = "/";
    }

    handleSelect(event) {
      this.setState({chosenTurn: event.target.value});
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
              <li className="results"><h4>You: {this.state.playerScore}</h4></li>
              <li className="results"><h4>{this.state.opponent.name}: {this.state.opponentScore}</h4></li>
            </ul>
          </div> ),
      });
    }

    setUpNextRound() {
        this.setState({
          picked: !this.state.picked,
          roundStarted: false,
          turn: !this.state.picked,
          wonRound: false, 
          chosenTurn: this.state.turnsLeft[0]
        }, () => {
          console.log(this.state);
        })
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
        this.setState({
          drew: true
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
          drew: true
        }, () => {
          let nextCard = this.state.nextCard.shift();

          this.setState({
            hand: this.state.hand.concat(nextCard)
          })
        })
      }
    }

    throwAwayCard(ind) {
      
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
        
            socket.emit("last turn", { nextPlayer: sessionStorage.getItem("opponent_id"), deck: this.state.deck, nextCard: this.state.nextCard, room: sessionStorage.getItem("room"), winnerScore: 0 });
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
          nextCard: [card[0], ...this.state.nextCard],
          lastTurn: false
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

    // TO DO: once the game is won, show the other person's cards
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
      
      while (!goneThrough) {
        let card = tempHand[i];
        // TO DO: need to consider other cards-ie, if i have 9 10 J, and then three Js
        // could potentially only separate them out by 3s, and then if the additional cards belong to a set of three, add them to that
        
        if (this.set(card, tempHand)) {
          let curSet = [...tempHand.filter(val => this.cardSetEquals(val, card))];
          tempHand = tempHand.filter(val => !this.cardSetEquals(val, card));
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
        else if (this.straight(card, tempHand)) {
          let curSet = this.getStraight(card, tempHand);
          tempHand = tempHand.filter(card1 => curSet.findIndex(card2 => card1.suit === card2.suit && card1.number === card2.number) < 0);
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
        else if (i < arr.length && this.cardNums(arr[i].number) - wildCards.length <= this.cardNums(last.number) + 1) {
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
      let arr = cards.filter(card => this.cardSuitEquals(card, cur));
      let wildCards = cards.filter(card => this.wildCard(card));
      arr.sort((a, b) => this.cardNums(a.number) - this.cardNums(b.number));

      if (arr.length < 3 && wildCards.length === 0) {
        return false;
      }
      else {
        let highest = 1, 
            current = 1,
            last = arr[0];
        for (var i = 1; i < arr.length; i++ ) {
          if (this.cardNums(arr[i].number) === this.cardNums(last.number) + 1) {
            current++;
            highest = Math.max(current, highest);
            last = arr[i];
          }
          else if (this.cardNums(arr[i].number) - wildCards.length <= this.cardNums(last.number) + 1) {
            let inc = this.cardNums(arr[i].number) - this.cardNums(last.number) + 1;
            current += inc;
            highest = Math.max(current, highest);
            last = arr[i];
            for (var i = 0; i < inc; i++) {
              wildCards.pop();
            }
          }
          else if (this.cardNums(arr[i].number) !== this.cardNums(last.number)) {
            current = 0;
          }
        }

        if (highest === 2) {
          return wildCards.length;
        }
        else {
          return highest >= 3;
        }
        
      }
    }

    cardNums(round) {
      if (!!parseInt(round)) {
        return parseInt(round);
      }
      else if (round === 'J') {
        return 11;
      }
      else if (round === 'A') {
        return 1;
      }
      else if (round === 'Q') {
        return 12;
      }
      else if (round === 'K') {
        return 13;
      }
      else {
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

    render() {
      let value;
      if (this.state.roundStarted) {

        value = (
          <div>
            {this.state.turn ? <h1>Your Turn</h1> : <h1>{sessionStorage.getItem("opponent_name")}'s turn</h1>}
            <div className="deck">
              <img src={process.env.PUBLIC_URL + '/cards/back.png'} onClick={this.drawCard}></img>
              {!!this.state.nextCard.length ? 
                <img src={'http://localhost:3000/cards/' + this.state.nextCard[0].number + this.state.nextCard[0].suit + '.svg'} onClick={this.takeCard}></img> 
                : <div></div>}
            </div>
            
            <DisplayHand hand={this.state.hand} throwAway={this.throwAwayCard}></DisplayHand>
          </div>
        
        )
      }
      else if (!!this.state.turn && this.state.turnsLeft.length > 1) {
        value = <div>
            <select value={this.state.chosenTurn} onChange={this.handleSelect}>
            {this.state.turnsLeft.map((turn, ind) => <option key={ind} value={turn}>{turn}</option>)}
          </select>
          <button onClick={this.pickRound}>Pick round</button>
          </div>
      }
      else {
        value = <h1>Not your turn</h1>
      }
      
      return (
        <div className="App">
          <a onClick={this.home} style={{cursor: 'pointer'}}>Home</a>
          <h1>Play Mindless Progression</h1>
          <p>Name: {this.state.name}</p>
          <p>Opponent: {this.state.opponent.name}</p>

          {this.state.wonRound && <h1>You won this round!</h1>}

          <p>{this.state.turn}</p>

          {value}
        </div>
      );
    }
  }
  export default MindlessPlay;