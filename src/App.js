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
import axios from 'axios';
import Test from './test'

function App() {
  return (
    <div className="app-body">
      <Navbar expand="md">
        <Navbar.Brand href="/">Mindless Progression</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        {!!sessionStorage.getItem('name') && <p className="header-name">Name: {sessionStorage.getItem('name')} </p>}
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
            {/* <Route path="/test">
              <Test />
            </Route> */}
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
  const [invalidName, setInvalidName] = useState(false);
  let  [,setState]=useState();
  if (sessionStorage.getItem("name") !== null) {
    rendered = <Mindless></Mindless>
  }
  else {
    // TO DO: have a way to edit name
    rendered = <div style={{marginTop: '15%'}}>
      <h4>Enter your name to get started!</h4>
      <form onSubmit={e => {handleSubmit(e)}}>
        <div className="input-group mb-3">
        <input 
            name='name' 
            type='text'
            placeholder="Your Name"
            onChange={e => {
              setName(e.target.value)
              setInvalidName(false);
            }
            }
            style={{margin: '0 auto'}}
          />
        </div>
        {invalidName && <p style={{color: 'red'}}>Name already taken, try again</p>}
          <input 
          className='submitButton'
          type='submit' 
          value='Start Playing' 
          className="btn btn-primary"
        />
      </form>
      <br></br>
    </div>
  }

  const handleSubmit= (e) => {
    e.preventDefault();
    let url = process.env.NODE_ENV === "development" ? '/api/users' : 'https://mindlessprogression-backend.herokuapp.com/api/users';
    axios.get(url).then(res => {
      if (res.data.filter(val => name === val).length > 0) {
        setInvalidName(true);
      } 
      else {
        sessionStorage.setItem("name", name);
        setState({});
        window.location.href = "/";
      }
    })
  
  }

  return (
    <div className="App">
      {rendered}
    </div>
  );
}

export default App;
