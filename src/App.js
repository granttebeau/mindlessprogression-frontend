import React, {useState} from 'react'
import './App.css';
import Mindless from './mindless';
import MindlessPlay from './mindlessplay';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {socket} from './service/socket';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/play">
            <MindlessPlay />
          </Route>
          <Route path="/">
            <MindlessProgression />
          </Route>
        </Switch>
      </div>
    </Router>
  )
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
