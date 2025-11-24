// Saga actions
export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const INCREMENT_ASYNC = 'INCREMENT_ASYNC';
export const DECREMENT_ASYNC = 'DECREMENT_ASYNC';

// Action creators
export const fetchUserRequest = (userId: string) => ({
  type: FETCH_USER_REQUEST,
  payload: { userId },
});

export const fetchUserSuccess = (user: any) => ({
  type: FETCH_USER_SUCCESS,
  payload: { user },
});

export const fetchUserFailure = (error: string) => ({
  type: FETCH_USER_FAILURE,
  payload: { error },
});

export const incrementAsync = () => ({
  type: INCREMENT_ASYNC,
});

export const decrementAsync = () => ({
  type: DECREMENT_ASYNC,
});
