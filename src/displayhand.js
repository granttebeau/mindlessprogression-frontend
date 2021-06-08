import React, { Component } from 'react';
import './App.css';
import './displayhand.css';
import uuid from 'react-uuid'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


class DisplayHand extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hand: props.hand
      }

      this.handleDrag = this.handleDrag.bind(this);
    }

    componentDidUpdate(prev) {
      if (prev.hand.length < this.props.hand.length) {
        this.setState({
          hand: this.state.hand.concat(this.props.hand[this.props.hand.length - 1])
        })
      }
      
      // if (prevProps.text !== this.props.text) {
      //   this.updateAndNotify();
      // }
    }
  
    componentDidMount() {
    }

    reorder(list, startIndex, endIndex) {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
    
      return result;
    };

    handleDrag(result) {
      if (!result.destination) {
        return;
      }
  
      const hand = this.reorder(
        this.state.hand,
        result.source.index,
        result.destination.index
      );
  
      this.setState({
        hand: hand,
      });
    }

    throwAway(card) {
      console.log("THROW AWAY", card);
      //empHand.findIndex(card => this.wildCard(card))
      let index = this.state.hand.findIndex(cur => cur.suit === card.suit && cur.number === card.number);
      this.state.hand.splice(index, 1);
      // this.setState({
      //   hand: this.state.hand.splice
      // })
      console.log(this.state);
      this.props.throwAway(card)
    }

  
    render() {

    let cards = this.state.hand.map((card, ind) => {
      let id = uuid();
      return (
        <Draggable key={id} draggableId={id} index={ind}>
        {(provided) => (
          <li className="card" key={id} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          {/* {card.number + card.suit} */}
          <img src={process.env.PUBLIC_URL + '/cards/' + card.number + card.suit + '.svg'} onClick={() => { this.throwAway(card) }}></img>
        </li>
        )}
      </Draggable>
      )
    })
      return (
        <div className="App">
          <DragDropContext onDragEnd={this.handleDrag}>
            <Droppable droppableId="cards" direction="horizontal">
              {(provided) => 
                <ul className="cards" {...provided.droppableProps} ref={provided.innerRef}>
                  {cards}
                  {provided.placeholder}
                </ul>
                }
            </Droppable>
          </DragDropContext>
        </div>
      );
    }
  }
  export default DisplayHand;