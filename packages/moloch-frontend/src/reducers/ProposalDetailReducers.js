const INITIAL_STATE = {
    items: {
      assets: [],
      voters: [],

    },
    isFetching: false,
    error: undefined
  };
  
  function ProposalDetailReducers(state = INITIAL_STATE, action) {
    switch (action.type) {
      case 'FETCH_PROPOSAL_DETAIL_REQUEST':
        // This time, you may want to display loader in the UI.
        return Object.assign({}, state, {
          isFetching: true
        });
      case 'FETCH_PROPOSAL_DETAIL_SUCCESS':
        // Adding derived members to state
        return Object.assign({}, state, {
          isFetching: false,
          items: action.items
        });
      case 'FETCH_PROPOSAL_DETAIL_FAILURE':
        // Providing error message to state, to be able display it in UI.
        return Object.assign({}, state, {
          isFetching: false,
          error: action.error
        });
      default:
        return state;
    }
  }
  
  export default ProposalDetailReducers;