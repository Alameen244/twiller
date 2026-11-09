export const endpoints = {
  posts: '/api/v1/tweets/post',
  register: '/api/v1/users/register',
  loggedInUser: '/api/v1/users/loggedinuser',
  userUpdate: (email) => `/api/v1/users/userupdate/${email}`,
  like: (id) => `/api/v1/tweets/like/${id}`,
  retweet: (id) => `/api/v1/tweets/retweet/${id}`
};
