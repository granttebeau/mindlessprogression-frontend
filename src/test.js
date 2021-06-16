import React, { Component } from 'react';
import './App.css';


class Test extends Component {
    constructor(props) {
      super(props);
    }

    moveElement() {
        let img = document.querySelector('img.draw-pile'),
            sourceX = img.offsetLeft,
            sourceY = img.offsetTop;

        img.style.top = sourceY + 'px';
        img.style.left = sourceX + 'px';

        let img2 = document.querySelector('img.draw-pile2'),
            destX = img2.offsetLeft,
            destY = img2.offsetTop;


        img.style.top = destY + 'px';
        img.style.left = destX + 'px';
    }

    render() {
      return (
        <div className="App">
          <h1>Test</h1>
            <img className="draw-pile" style={{position: 'absolute', top: '20px', left: '20px', transition: 'left 1s, top 1s'}} alt="draw pile" src={process.env.PUBLIC_URL + '/cards/back.png'} ></img>

          <button onClick={this.moveElement}>Move</button>
          <div className="second-div" style={{width: '200px', height: '200px', border: '5px solid red', marginTop: '100px'}}>
          <img className="draw-pile2" alt="draw pile" src={process.env.PUBLIC_URL + '/cards/2C.svg'} ></img>

          </div>
        </div>
      );
    }
  }
  export default Test;