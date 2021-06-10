import React, {useState} from 'react'
import './App.css';
import Mindless from './mindless';
import MindlessPlay from './mindlessplay';
import HowToPlay from './howtoplay';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function App() {
  return (
    <div className="app-body">
      <Navbar expand="lg">
        <Navbar.Brand href="/">Mindless Progression</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end" style={{ width: "100%" }}>
            <Nav.Link href="/">New Game</Nav.Link>
            <Nav.Link href="/how-to-play">How to Play</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Router>
        <div className="router-body">
          <Switch>
            <Route path="/play">
              <MindlessPlay />
            </Route>
            <Route path="/how-to-play">
              <HowToPlay />
            </Route>
            <Route path="/">
              <MindlessProgression />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

function MindlessProgression() {
  let rendered;
  const [name, setName] = useState();
  let  [,setState]=useState();
  if (sessionStorage.getItem("name") !== null) {
    rendered = <Mindless></Mindless>
  }
  else {
    rendered = <div>
      <h1>Enter name:</h1>
      <form onSubmit={e => {handleSubmit(e)}}>
        <input 
            name='name' 
            type='text'
            onChange={e => setName(e.target.value)}
          />
          <input 
          className='submitButton'
          type='submit' 
          value='Submit' 
        />
      </form>
    </div>
  }

  const handleSubmit= (e) => {
    e.preventDefault();
    sessionStorage.setItem("name", name);
    setState({});
    window.location.href = "/";
  }

  return (
    <div className="App">
      {rendered}
    </div>
  );
}

export default App;
