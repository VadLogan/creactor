
  import React, { Component } from 'react';
  import PropTypes from 'prop-types';
  
  import "./styles.scss";
  
  const bc = '.your-app-uniq-prefix-qweas'
  
  class Qweas extends Component {
    static propTypes = {}
  
    static displayName = 'Qweas'
    state = {
  
    };
    render(){
      return(
        <div className={bc}></div>
      )
    }
  }
  export default Qweas
  