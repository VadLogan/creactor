const { withPrefix, recognizeComponent } = require("../utils");

const pureFunctional = (Component, prefix) =>
  Buffer.from(`
  import React from 'react';
  import PropTypes from 'prop-types';
  
  import "./styles.scss";
  
  const bc = '${withPrefix(Component, prefix)}'
  
  const ${Component} = (props) => {
      return <${recognizeComponent(
        Component
      )} className={bc}></${recognizeComponent(Component)}>
  }
  
  ${Component}.displayName = '${Component}'
  ${Component}.propTypes = {}
  
  export default ${Component}
  `);

const reactNode = (Component, prefix) => `
  import React, { Component } from 'react';
  import PropTypes from 'prop-types';
  
  import "./styles.scss";
  
  const bc = '${withPrefix(Component, prefix)}'
  
  class ${Component} extends Component {
    static propTypes = {}
  
    static displayName = '${Component}'
    state = {
  
    };
    render(){
      return(
        <div className={bc}></div>
      )
    }
  }
  export default ${Component}
  `;

const reactPureNode = (Component, prefix) => `
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';


import "./styles.scss";

const bc =' ${withPrefix(Component, prefix)}'

class ${Component} extends PureComponent {
  static propTypes = {}

  static displayName = '${Component}'
  state = {

  };
  render(){
    return(
      <div className={bc}></div>
    )
  }
}
export default ${Component}
`;

const styles = (component, prefix) => {
  if (!component) {
    throw new Error("please add component to styles function");
  }
  return Buffer.from(withPrefix(component, prefix) + "{}");
};

const componentIndex = Component =>
  Buffer.from(`
import ${Component} from "./${Component}"

export default ${Component}
`);

const containerIndex = Component => `
import ${Component} from "./${Component}";
import { connect } from "react-redux";
import {createStructuredSelector} from "reselect";
import {} from "./actions";
import {} from "./selectors";

const mapStateToProps = createStructuredSelector({})


const mapDispatchToProps = {}


const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(${Component})
`;

const createSelectors = Component => `
import { createSelector } from "reselect";

const state${Component} = state => state.get("${Component}Reducer")
`;

const createActions = () => `
import { createActions, createAction } from "redux-actions";
`;

const createReducer = Component => `
import { handleActions } from "redux-actions";
import { Record } from "immutable";
import {} from "./actions";

const InitialState = Record({}, "${Component}Reducer")


export default  handleActions({}, new InitialState())
`;

const createSaga = () => `
import { takeEvery, call, put, select } from "redux-saga/effects";
import {action} from "../actions"
import {selectors} from "../selectors"


function* saga({ payload }) {
  try{


  }catch(err){
    console.error(err)
  }
}

export default function* handleSaga() {
  yield takeEvery(action.toString(), saga);
}
`;

const createIndexSaga = () => `
import { all, fork } from "redux-saga/effects";


export default function* saga() {
  yield all([
    fork(),
  ]);
}
`;

const testDefaultFileName = arg => `
import ${arg} from "../index"
`;

const subComponentsIndex = arr =>
  arr.reduce(
    (str, component) =>
      str + `export {default as ${component}} from "./${component}"` + "\r\n",
    ""
  );

module.exports = {
  pureFunctional,
  reactNode,
  reactPureNode,
  styles,
  componentIndex,
  containerIndex,
  createSelectors,
  createActions,
  createReducer,
  createSaga,
  createIndexSaga,
  testDefaultFileName,
  subComponentsIndex
};
