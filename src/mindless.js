import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.css';
import {socket} from './service/socket';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CheckIcon from '@material-ui/icons/Check';


class Mindless extends Component {
    constructor(props) {
      super(props);
      this.state = {users: [], name: '', selectValue: '', invite: false, inviteGames: [], invitesSent: []};
      this.challengePlayer = this.challengePlayer.bind(this);
      this.accept = this.accept.bind(this);
      this.sentInvite = this.sentInvite.bind(this);
      sessionStorage.setItem("started", false);
    }

    // joinGame(event) {
    //   event.preventDefault();

    //   let opponent = this.state.users.filter(val => val.id === this.state.selectValue)[0];
      
    //   sessionStorage.setItem("opponent_name", opponent.name);
    //   sessionStorage.setItem("opponent_id", opponent.id);
    //   sessionStorage.setItem("started", true);

    //   socket.emit('new game', {"playerOne": socket.id, "playerOne_name": sessionStorage.getItem("name"), "playerTwo": sessionStorage.getItem("opponent_id"), "room": sessionStorage.getItem('name') + '-' + sessionStorage.getItem("opponent_name")})
      
    //   const { history: { push } } = this.props;
    //   socket.on("joined", (game) => {
    //     console.log("JOINED");
    //     sessionStorage.setItem("room", game.room);
    //     push('/play')
    //   })
    // }

    accept(ind) {
      socket.emit("joining", this.state.inviteGames[ind])
      sessionStorage.setItem("room", this.state.inviteGames[ind].room);
      sessionStorage.setItem("opponent_name", this.state.inviteGames[ind].playerOne_name);
      sessionStorage.setItem("opponent_id", this.state.inviteGames[ind].playerOne)
      const { history: { push } } = this.props;
      push('/play')
    }


    challengePlayer(id) {
      let opponent = this.state.users.filter(val => val.id === id)[0];
      
      sessionStorage.setItem("opponent_name", opponent.name);
      sessionStorage.setItem("opponent_id", opponent.id);
      sessionStorage.setItem("started", true);

      this.setState({
        invitesSent: this.state.invitesSent.concat({
          opponent: opponent.id
        })
      })

      socket.emit('new game', {"playerOne": socket.id, "playerOne_name": sessionStorage.getItem("name"), "playerTwo": sessionStorage.getItem("opponent_id"), "room": sessionStorage.getItem('name') + '-' + sessionStorage.getItem("opponent_name")})
      
      const { history: { push } } = this.props;
      socket.on("joined", (game) => {
        sessionStorage.setItem("room", game.room);
        push('/play')
      })
    }

    sentInvite(id) {
      let sent = false;
      this.state.invitesSent.forEach(invite => {
        if (invite.opponent === id) {
          sent = true;
        }
      })
      return sent;
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
        self.setState({
          invite: true,
          inviteGames: this.state.inviteGames.concat(game)
        })
      })
      
    }

    render() {
      return (
        <div className="App">
          <h4>Start a new game!</h4>
          <br></br>

            {!!this.state.invite && 
            this.state.inviteGames.map((game, ind) => (
              <button style={{margin: '20px'}} className="btn btn-success" onClick={() => { this.accept(ind) }}>Accept Invite from {game.playerOne_name}!</button>
            ))
            }

            <TableContainer style={{maxWidth: '740px', margin: '20px auto'}} component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{fontWeight: 'bold', width: '33%'}}>Player Name</TableCell>
                    <TableCell style={{fontWeight: 'bold', width: '0%'}} align="right"></TableCell>
                    <TableCell style={{fontWeight: 'bold', width: '67%'}} align="right">Challenge Player</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.users.map((usr, ind) => (
                    <TableRow key={ind}>
                      <TableCell component="th" scope="row">
                        {usr.name}
                      </TableCell>
                      <TableCell align="right">
                      </TableCell>
                      <TableCell align="right">
                        <div style={{display: 'inline'}}>
                          <p style={{display: 'inline-block', marginRight: '40px'}}>{this.sentInvite(usr.id) ? 'Invite sent' : ''}</p>
                          <button style={{display: 'inline-block'}} 
                                  className={this.sentInvite(usr.id) ? "btn btn-success" : "btn btn-primary"} 
                                  onClick={() => { this.challengePlayer(usr.id) }}
                                  disabled={this.sentInvite(usr.id)}>
                              {this.sentInvite(usr.id) && <CheckIcon/>} Challenge
                          </button>
                        </div>
                        
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </div>
      );
    }
  }
  export default withRouter(Mindless);