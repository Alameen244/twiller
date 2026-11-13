export const endpoints = {
  //auth
  posts: '/api/v1/tweets/post',
  register: '/api/v1/users/register',
  loggedInUser: '/api/v1/users/loggedinuser',
  phoneSendOtp: '/api/v1/users/phone/send-otp',
  phoneVerifyOtp: '/api/v1/users/phone/verify-otp',
  userUpdate: (email) => `/api/v1/users/userupdate/${email}`,

  //post
  like: (id) => `/api/v1/tweets/like/${id}`,
  retweet: (id) => `/api/v1/tweets/retweet/${id}`,

  //image
  uploadSingleImage: '/api/v1/image/uploadSingle',
  uploadMultipleImages: '/api/v1/image/uploadMultiple',


};
