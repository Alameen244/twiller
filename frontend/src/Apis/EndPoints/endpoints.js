export const endpoints = {
  //auth
  register: '/api/v1/users/register',
  loggedInUser: '/api/v1/users/loggedinuser',
  phoneSendOtp: '/api/v1/users/phone/send-otp',
  phoneVerifyOtp: '/api/v1/users/phone/verify-otp',
  userUpdate: (email) => `/api/v1/users/userupdate/${email}`,
  forgotPasswordRequest: '/api/v1/users/forgot-password/request',
  forgotPasswordReset: '/api/v1/users/forgot-password/reset',

  //language
  languageRequestOtp: '/api/v1/users/language/request-otp',
  languageVerifyOtp: '/api/v1/users/language/verify-otp',

  //login session
  loginSession: '/api/v1/users/login-session',
  loginSessionVerify: '/api/v1/users/login-session/verify',
  loginSessionResend: '/api/v1/users/login-session/resend-otp',
  loginHistory: '/api/v1/users/login-history',

  //post
  posts: '/api/v1/tweets/post',
  like: (id) => `/api/v1/tweets/like/${id}`,
  retweet: (id) => `/api/v1/tweets/retweet/${id}`,
  deletePost: (id) => `/api/v1/tweets/${id}`,
  translateTweets: '/api/v1/tweets/translate',

  //comment
  comments: (tweetId) => `/api/v1/comments/${tweetId}`,
  deleteComment: (commentId) => `/api/v1/comments/${commentId}`,
  translateComments: '/api/v1/comments/translate',

  //image
  uploadSingleImage: '/api/v1/image/uploadSingle',
  uploadMultipleImages: '/api/v1/image/uploadMultiple',

  //subscription
  subscriptionPlans: '/api/v1/subscriptions/plans',
  subscriptionMe: '/api/v1/subscriptions/me',
  subscriptionOrder: '/api/v1/subscriptions/order',
  subscriptionVerify: '/api/v1/subscriptions/verify',

  //audio tweet
  audioOtpRequest: '/api/v1/tweets/audio/otp/request',
  audioOtpVerify: '/api/v1/tweets/audio/otp/verify',
  audioTweet: '/api/v1/tweets/audio',

  //notifications
  notifications: '/api/v1/notifications',
  notificationsUnreadCount: '/api/v1/notifications/unread-count',
  notificationsReadAll: '/api/v1/notifications/read-all',
  notificationsPreference: '/api/v1/notifications/preference',
};
