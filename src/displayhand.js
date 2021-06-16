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
        horizontal: true,
        extraCard: false
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
          hand: this.state.hand.concat(this.props.hand[this.props.hand.length - 1]), 
          extraCard: true
        }, () => {
          let inPlay = document.querySelectorAll('.in-play');
          let empty = inPlay[inPlay.length - 1];
          let card = this.state.hand[this.state.hand.length - 1];

          let url = process.env.NODE_ENV === "development" ? "http://localhost:3000/cards/" + card.number + card.suit + '.svg' : "http://mindlessprogression.com/cards/" + card.number + card.suit + '.svg';
          let newCard = new Image();
          newCard.src = url;
          newCard.classList.add('in-play-image-new');
          newCard.alt = 'card ' + card.number + card.suit;
          // console.log(newCard);
          newCard.onload = (e) => {
            this.animate(newCard).then(res => {
              setTimeout(() => {
                this.setState({
                  extraCard: false
                })
              }, 500)
            })
          }

          let drawCard;
          if (this.props.draw) {
            drawCard = document.querySelector('.draw-card');
          }
          else {
            drawCard = document.querySelector('.draw-pile');
          }

          newCard.style.top = '-' + (empty.getBoundingClientRect().y - drawCard.getBoundingClientRect().y) + 'px';
          newCard.style.left = '-' + (empty.getBoundingClientRect().left - drawCard.getBoundingClientRect().left) + 'px';
          empty.appendChild(newCard);
        
          // this.animate(newCard).then(res => {
          //   setTimeout(() => {
          //     this.setState({
          //       extraCard: false
          //     })
          //   }, 500)
          // })

        })
      }
    }

    animate(card) {
      return new Promise(resolve => {
        setTimeout(() => {
          card.style.top = '0px';
          card.style.left = '0px';
          resolve("animate");
        }, 1)
      })
      
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
      let inPlay = Array.from(document.querySelectorAll('.in-play img'));
      let index;
      if (inPlay.length !== this.state.hand.length) {
        inPlay.splice(0, this.state.hand.length);
        index = this.state.hand.findIndex(cur => cur.suit === card.suit && cur.number === card.number) - 1;
      }
      else {
        index = this.state.hand.findIndex(cur => cur.suit === card.suit && cur.number === card.number);
      }
      
      let thrownCard = inPlay[index];
      let drawCard = document.querySelector('.draw-card');

      thrownCard.style.top = (drawCard.getBoundingClientRect().y - thrownCard.getBoundingClientRect().y) + 'px';
      thrownCard.style.left = (drawCard.getBoundingClientRect().left - thrownCard.getBoundingClientRect().left) + 'px';

      setTimeout(() => {
        this.state.hand.splice(index, 1);
        this.props.throwAway(card)
      }, 500)
    
    }

  
    render() {
    let maxInd = this.state.hand.length - 1;
    let cards = this.state.hand.map((card, ind) => {
      let id = uuid();
      return (
        <Draggable key={id} draggableId={id} index={ind}>
        {(provided) => (
          <li className="card" key={id} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <div className="in-play" onClick={() => { this.throwAway(card) }}>
              {
                (ind < maxInd || (!this.state.extraCard && maxInd === ind)) && 
                <img className="in-play-image" alt={'card ' + card.number + card.suit} src={process.env.PUBLIC_URL + '/cards/' + card.number + card.suit + '.svg'}></img>
              }
            </div>
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