
import Qweas from "./Qweas";
import { connect } from "react-redux";
import {createStructuredSelector} from "reselect";
import {} from "./actions";
import {} from "./selectors";

const mapStateToProps = createStructuredSelector({})


const mapDispatchToProps = {}


const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(Qweas)
