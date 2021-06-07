import React, { Component } from 'react';
import './App.css';
import './displayhand.css';
import uuid from 'react-uuid'



class DisplayHand extends Component {
    constructor(props) {
      super(props);
    }

  
    componentDidMount() {
    }

  
    render() {
      let cards = this.props.hand.map((card, ind) =>
      <li className="card" key={uuid()}>
        {/* {card.number + card.suit} */}
        <img src={'http://localhost:3000/cards/' + card.number + card.suit + '.svg'} onClick={() => { this.props.throwAway(ind) }}></img>
      </li>
    );
      return (
        <div className="App">
          <ul className="cards">
            {cards}
          </ul>
        </div>
      );
    }
  }
  export default DisplayHand;