
  import React from 'react';
  import PropTypes from 'prop-types';
  
  import "./styles.scss";
  
  const bc = '.your-app-uniq-prefix-qweas'
  
  const Qweas = (props) => {
      return <div className={bc}></div>
  }
  
  Qweas.displayName = 'Qweas'
  Qweas.propTypes = {}
  
  export default Qweas
  