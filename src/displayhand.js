import React, { Component } from 'react';
import './App.css';
import './displayhand.css';
import uuid from 'react-uuid'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


class DisplayHand extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hand: props.hand,
        horizontal: true
      }

      this.handleDrag = this.handleDrag.bind(this);
      this.updateDimensions = this.updateDimensions.bind(this);
    }

    updateDimensions() {
      let factor = window.innerWidth > 850 ? 100 : (window.innerWidth < 675 ? 60 : 80);
      factor = factor * this.state.hand.length;
      if (factor >= (window.innerWidth - 150)) {
        document.querySelectorAll('li').forEach(card => {
          if (!card.classList.contains('playing-card')) {
            card.classList.add('playing-card');
          }
        })
      }
      else {
        document.querySelectorAll('li').forEach(card => {
          if (card.classList.contains('playing-card')) {
            card.classList.remove('playing-card');
          }
        })
      }
    };

    componentDidMount() {
      window.addEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prev) {
      if (prev.hand.length < this.props.hand.length) {
        this.setState({
          hand: this.state.hand.concat(this.props.hand[this.props.hand.length - 1])
        })
      }
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
      let index = this.state.hand.findIndex(cur => cur.suit === card.suit && cur.number === card.number);
      this.state.hand.splice(index, 1);
      this.props.throwAway(card)
    }

  
    render() {

    let cards = this.state.hand.map((card, ind) => {
      let id = uuid();
      return (
        <Draggable key={id} draggableId={id} index={ind}>
        {(provided) => (
          <li className="card" key={id} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <img className="in-play" alt={'card ' + card.number + card.suit} src={process.env.PUBLIC_URL + '/cards/' + card.number + card.suit + '.svg'} onClick={() => { this.throwAway(card) }}></img>
          </li>
        )}
      </Draggable>
      )
    })


      return (
        <div className="App">
          
          <DragDropContext onDragEnd={this.handleDrag}>
            <Droppable droppableId="cards" direction={this.state.horizontal ? 'horizontal' : ''}>
              {(provided) => 
                <ul className="cards" style={{width: this.state.hand.length > 10 ? '90%' : '98%'}} {...provided.droppableProps} ref={provided.innerRef}>
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