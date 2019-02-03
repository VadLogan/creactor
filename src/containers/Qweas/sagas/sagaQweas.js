
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
