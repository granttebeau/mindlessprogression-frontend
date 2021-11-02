import React, { Component } from 'react';
import './App.css';

class HowToPlay extends Component {

    render() {
      return (
        <div className="App">
          <h1>How to Play</h1>
          <p>In a game of Mindless Progression, there are 11 rounds. Each round is associated with a card value from 3 to K (ie, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K) - this card value will equal how many cards are dealt to each player. The card associated with a hand will also count as a wild card for that round, in addition to Jokers. The goal of the game is to get the lowest score. Each one-digit card is worth 5 points, 10 and the face cards are worth 10 points, an ace is worth 15, and an unmatched Joker is worth 20. 
            Your score at the end of the game is the cumulation of how many points you’ve gained each round. Each round, players will take turns drawing a card, either from the discard pile (which will have a face-up card) or from the deck (which will be face down). 
            Then, they must discard one card. The goal of each round is to go out - what this means is that you can group each of the cards in your hand to make minimum combinations of at least three cards. Legal combinations are:</p>
          <ul>
            <li>A group of three or more cards that have the same value or are wild cards. There must be at least two cards that aren’t wild cards. </li>
            <li>A group of three or more cards that are a run of one suit - in other words, 3 or more consecutive cards that have the same suit. This run can contain wild cards, but there must be at least two cards in it that aren’t wild cards. </li>
            <li>
              Examples of hands:
              <ul>
                <li>2H 3H 4H 8D Joker 8S - this hand would go out, because there’s a run of 3 cards (2H 3H 4H) and then also a group of three of the same number with one being a wild card (8D Joker 8S). Thus, since each card is in one and only one of the above possibilities, this player can go out. </li>
                <li>2H 3H 4H 8D Joker 8S KS - this hand wouldn’t go out. Although there is a run and a group of the same values as explained above, there’s an extra King. Thus, each card isn’t in one and only one of the above possibilities, so the player has to play another round. </li>
              </ul>
            </li>
          </ul>
          <p>When a player goes out in a round, they get -5 points. After that, all other players get one more turn. Their score for that round will be the total value of all additional cards that aren’t in a run or in a group of the same value. For example, if the player’s hand was 2H 3H 4H 8D Joker 8S KS after their last turn, they would get 10, since they have a leftover King that’s worth 10 points. </p>
        </div>
      );
    }
  }
  export default HowToPlay;