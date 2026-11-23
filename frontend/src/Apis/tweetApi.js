import { axiosInstance } from "../helper/helper";
import { endpoints } from "./EndPoints/endpoints";

export const getPostsApi = () =>
  axiosInstance.get(endpoints.posts).then((r) => r.data);

export const createPostApi = (data) =>
  axiosInstance.post(endpoints.posts, data).then((r) => r.data);

export const likePostApi = (id, userId) =>
  axiosInstance.post(endpoints.like(id), { userId }).then((r) => r.data);

export const retweetPostApi = (id, userId) =>
  axiosInstance.post(endpoints.retweet(id), { userId }).then((r) => r.data);

export const deletePostApi = (id) =>
  axiosInstance.delete(endpoints.deletePost(id)).then((r) => r.data);

// Translates tweet text and audio captions into the user's saved language (max 25 ids per call).
export const translateTweetsApi = (tweetIds) =>
  axiosInstance.post(endpoints.translateTweets, { tweetIds }).then((r) => r.data);

// Aliases for tweet naming
export const getTweetsApi = getPostsApi;
export const postTweetApi = createPostApi;
export const likeTweetApi = likePostApi;
export const retweetTweetApi = retweetPostApi;
export const deleteTweetApi = deletePostApi;
