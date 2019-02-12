const url = "http://127.0.0.1:3001";

export function fetchMembers() {
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "FETCH_MEMBERS_REQUEST"
    });
    return (
      fetch(url + "/members", {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "FETCH_MEMBERS_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "FETCH_MEMBERS_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function fetchProposals(params) {
  var queryParams = Object.keys(params)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "FETCH_PROPOSALS_REQUEST"
    });
    return (
      fetch(url + "/periods/getfiltered?" + queryParams, {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        // .then(response => response.json().then(body => ({ response, body })))
        .then(response => {
          if (response.status !== 204) {
            return response.json().then(body => ({ response, body }));
          } else {
            return dispatch({
              type: "FETCH_PROPOSALS_SUCCESS",
              body: {}
            });
          }
        })
        .then(({ response, body }) => {
          if (response) {
            if (!response.ok) {
              // If request was failed, dispatching FAILURE action.
              return dispatch({
                type: "FETCH_PROPOSALS_FAILURE",
                error: body.error
              });
            } else {
              // When everything is ok, dispatching SUCCESS action.
              return dispatch({
                type: "FETCH_PROPOSALS_SUCCESS",
                items: body
              });
            }
          } else {
            return;
          }
        })
    );
  };
}

export function fetchMemberDetail(id) {
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "FETCH_MEMBER_DETAIL_REQUEST"
    });
    return (
      fetch(url + "/members/" + id, {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "FETCH_MEMBER_DETAIL_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "FETCH_MEMBER_DETAIL_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function fetchProposalDetail(id) {
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "FETCH_PROPOSAL_DETAIL_REQUEST"
    });
    return (
      fetch(url + "/projects/" + id, {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "FETCH_PROPOSAL_DETAIL_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "FETCH_PROPOSAL_DETAIL_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function postEvents(data) {
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "POST_EVENTS_REQUEST"
    });
    return (
      fetch(url + "/events", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: data
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "POST_EVENTS_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "POST_EVENTS_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function fetchConfigFounders() {
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "FETCH_FOUNDERS_REQUEST"
    });
    return (
      fetch(url + "/configs/getfounders", {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "FETCH_FOUNDERS_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "FETCH_FOUNDERS_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function getAssetData() {
  // var queryParams = Object.keys(params)
  //     .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
  //     .join('&');
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "GET_ASSET_DATA_REQUEST"
    });
    return (
      fetch(url + "/assets/getETHData", {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "GET_ASSET_DATA_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "GET_ASSET_DATA_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function getAssetAmount() {
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "GET_ASSET_DATA_REQUEST"
    });
    return (
      fetch(url + "/assets/getETHAmount", {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "GET_ASSET_AMOUNT_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "GET_ASSET_AMOUNT_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}

export function fetchMembersWithShares() {
  // Instead of plain objects, we are returning function.
  return function(dispatch) {
    // Dispatching REQUEST action, which tells our app, that we are started requesting members.
    dispatch({
      type: "FETCH_MEMBERS_WITH_SHARES_REQUEST"
    });
    return (
      fetch(url + "/members/getMembersWithShares", {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      })
        // Here, we are getting json body(in our case it will contain `members` or `error` prop, depending on request was failed or not) from server response
        // And providing `response` and `body` variables to the next chain.
        .then(response => response.json().then(body => ({ response, body })))
        .then(({ response, body }) => {
          if (!response.ok) {
            // If request was failed, dispatching FAILURE action.
            return dispatch({
              type: "FETCH_MEMBERS_WITH_SHARES_FAILURE",
              error: body.error
            });
          } else {
            // When everything is ok, dispatching SUCCESS action.
            return dispatch({
              type: "FETCH_MEMBERS_WITH_SHARES_SUCCESS",
              items: body
            });
          }
        })
    );
  };
}
