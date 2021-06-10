import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import './App.css';
import {socket} from './service/socket';


class Mindless extends Component {
    constructor(props) {
      super(props);
      this.state = {users: [], name: '', selectValue: '', invite: false, inviteGame: {}};
      this.handleChange = this.handleChange.bind(this);
      this.handleSelect = this.handleSelect.bind(this);
      this.joinGame = this.joinGame.bind(this);
      this.accept = this.accept.bind(this);
      sessionStorage.setItem("started", false);
    }

    joinGame(event) {
      event.preventDefault();

      let opponent = this.state.users.filter(val => val.id === this.state.selectValue)[0];
      
      sessionStorage.setItem("opponent_name", opponent.name);
      sessionStorage.setItem("opponent_id", opponent.id);
      sessionStorage.setItem("started", true);

      socket.emit('new game', {"playerOne": socket.id, "playerOne_name": sessionStorage.getItem("name"), "playerTwo": sessionStorage.getItem("opponent_id"), "room": sessionStorage.getItem('name') + '-' + sessionStorage.getItem("opponent_name")})
      
      const { history: { push } } = this.props;
      socket.on("joined", (game) => {
        sessionStorage.setItem("room", game.room);
        push('/play')
      })
    }

    accept() {
      socket.emit("joining", this.state.inviteGame)
      sessionStorage.setItem("room", this.state.inviteGame.room);
      sessionStorage.setItem("opponent_name", this.state.inviteGame.playerOne_name);
      sessionStorage.setItem("opponent_id", this.state.inviteGame.playerOne)
    }
  
    handleChange(event) {
      this.setState({msgValue: event.target.value});
    }

    handleSelect(event) {
      this.setState({selectValue: event.target.value});
    }

  
    componentDidMount() {
      this.setState({
        name: sessionStorage.getItem('name')
      })
      let self = this;

      socket.on('connect', () => {
        socket.emit('new user', {"name": sessionStorage.getItem('name'), "id": socket.id})
      });

      socket.on('new user', (usr) => {
        self.setState({
          users: usr.filter(val => val.name !== sessionStorage.getItem("name")),
          selectValue: usr.length > 1 ? usr.filter(val => val.name !== sessionStorage.getItem("name"))[0].id : ""
        })
      })

      socket.on("join game", (game) => {
        console.log(game);
        self.setState({
          invite: true,
          inviteGame: game
        })
      })
      
    }

  
    render() {
      return (
        <div className="App">
          <p>Name: {this.state.name}</p>
        
          <br></br>
          <p>Select Opponent:</p>
          <select className="form-select form-select-sm select-form" value={this.state.selectValue} onChange={this.handleSelect}>
            {this.state.users.map((usr, ind) => <option key={ind} value={usr.id}>{usr.name}</option>)}
          </select>
            {!!this.state.selectValue && <Link to={'/play'} onClick={this.joinGame}>Join Game</Link>}
            <br></br>
            {!!this.state.invite ? <Link to={'/play'} onClick={this.accept}>Accept Invite from {this.state.inviteGame.playerOne_name}</Link> : <span></span>}
        </div>
      );
    }
  }
  export default withRouter(Mindless);