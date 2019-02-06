import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import allReducers from '../reducers/';

export const store = createStore(allReducers, applyMiddleware(thunk));
