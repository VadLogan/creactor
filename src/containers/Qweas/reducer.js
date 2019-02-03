
import { handleActions } from "redux-actions";
import { Record } from "immutable";
import {} from "./actions";

const InitialState = Record({}, "QweasReducer")


export default  handleActions({}, new InitialState())
