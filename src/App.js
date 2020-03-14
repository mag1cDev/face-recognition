import React, { Component } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Nav from './comps/nav/Nav';
import Logo from './comps/logo/Logo';
import ImageLinkForm from './comps/form/Form';
import Rank from './comps/rank/Rank';
import FaceRecog from './comps/face/FaceRecog';
import SignIn from './comps/signin/SignIn';
import Register from './comps/register/Register';

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imgUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    password: '',
    entries: 0,
    joined: ''
  }
}

const appEndpoint = 'https://iseeyou-app.herokuapp.com/';

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calcFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      "topRow": clarifaiFace.top_row * height,
      "leftCol": clarifaiFace.left_col * width,
      "bottomRow": height - (clarifaiFace.bottom_row * height),
      "rightCol": width - (clarifaiFace.right_col * width)
    }
  }

  displayFaceBox = (box) => {
    if (box) {console.log('Face Detected!')}
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onFormSubmit = (event) => {
    event.preventDefault();
    this.setState({imgUrl: this.state.input});
      fetch(`${appEndpoint}imageurl`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(apiresp => apiresp.json())
      .then(response => {
        if (response) {
          fetch(`${appEndpoint}image`, {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(resp => resp.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
            .catch(console.log)
          }
        this.displayFaceBox(this.calcFaceLocation(response))
      })
      .catch(err => console.log(err, 'Error fetching image src...'));
  }

  onRouteChange = (route) => {
    if (route === 'signin') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, box, imgUrl, route, user } = this.state;
    return (
      <div className="App">
        <Particles params={particlesOptions} className="particles"/>
        <Nav isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'
          ? <div>
            <Logo />
            <Rank name={user.name} entries={user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onFormSubmit={this.onFormSubmit}/>
            <FaceRecog box={box} imgUrl={imgUrl}/>
          </div>
          : (
            route === 'signin'
              ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    );
  }
}

export default App;
