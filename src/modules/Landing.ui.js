import React from 'react'
import * as Animatable from 'react-native-animatable'
import { View, Image } from 'react-native'
import { connect } from 'react-redux'
import { Actions } from 'react-native-router-flux'
import Disclaimer from './Disclaimer/Disclaimer.ui'
import Loader from './Loader/Loader.ui'
import WarningModal from './WarningModal/WarningModal.ui'
import ErrorModal from './ErrorModal/ErrorModal.ui'
import Login from './Login/Login.ui'
import LoginWithPin from './Login/LoginWithPin.ui'
import TemplateView from './tpl/View.ui'
import abcctx from '../lib/abcContext'
import { closeUserList } from './Login/Login.action'

import { hideWhiteOverlay } from './Landing.action'

import { showDisclaimer } from './Disclaimer/Disclaimer.action'
import { selectUserToLogin, setCachedUsers } from './CachedUsers/CachedUsers.action'

import style from './Style'

global.randomBytes = require('react-native-randombytes').randomBytes
// synchronous API
// uses SJCL
var rand = global.randomBytes(4)
console.log('SYNC RANDOM BYTES', rand.toString('hex'))

// asynchronous API
// uses iOS-side SecRandomCopyBytes
global.randomBytes(4, (err, bytes) => {
  if (err) console.error(err)
  console.log('RANDOM BYTES', bytes.toString('hex'))
})

class HomeComponent extends TemplateView {

  componentDidUpdate () {
    if (this.props.whiteOverlayVisible) {
      var self = this
      this.refs.whiteOverlay.fadeIn(1000).then(endState => {
        setTimeout(function () {
          self.refs.whiteOverlay.fadeOut(1000).then(endState => {
            self.props.dispatch(hideWhiteOverlay())
          })
        }, 1000)
      }).catch(e => {
        console.error(e)
      })
      setTimeout(() => {
        Actions.signup()
      }, 700)
    }
  }

  componentWillMount () {
    super.componentWillMount()
    const dispatch = this.props.dispatch
    abcctx(ctx => {
      const cachedUsers = ctx.listUsernames()
      const lastUser = global.localStorage.getItem('lastUser')

      dispatch(setCachedUsers(cachedUsers))
      if (lastUser) {
        dispatch(selectUserToLogin(lastUser))
      }
      const disclaimerAccepted = global.localStorage.getItem('disclaimerAccepted')
      if (!disclaimerAccepted) dispatch(showDisclaimer())
    })
  }

  renderWhiteTransition () {
    if (this.props.whiteOverlayVisible) {
      return (<Animatable.View ref='whiteOverlay' style={style.whiteTransitionFade} />)
    } else {
      return null
    }
  }

  renderMainComponent = () => {
    if (this.props.pin) return <LoginWithPin />
    if (!this.props.pin) return <Login />
  }
  handleViewPress = () => {
    console.log('the fuck?')
    this.props.dispatch(closeUserList())
  }

  renderDisclaimerComponent = () => {
    if (this.props.disclaimerAccepted) return null
    else {
      return (<Disclaimer />)
    }
  }

  render () {
    return (
      <Image onStartShouldSetResponder={this.handleViewPress} source={require('../img/background.jpg')} resizeMode='cover' style={style.backgroundImage}>
        <View style={style.logoContainer}>
          <Image source={require('../img/logo.png')} style={style.logoImage} />
        </View>
        {this.renderMainComponent()}
        <Loader />
        <WarningModal />
        <ErrorModal />
        { this.renderDisclaimerComponent() }
        { this.renderWhiteTransition() }
      </Image>
    )
  }

}

export default connect(state => ({

  selectedUserToLogin: state.cachedUsers.selectedUserToLogin,
  pin: state.login.viewPIN,
  disclaimerAccepted: state.disclaimerAccepted,
  whiteOverlayVisible: state.whiteOverlayVisible

}))(HomeComponent)
