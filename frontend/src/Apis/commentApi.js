import { axiosInstance } from "../helper/helper";
import { endpoints } from "./EndPoints/endpoints";

export const getCommentsApi = (tweetId) =>
  axiosInstance.get(endpoints.comments(tweetId)).then((r) => r.data);

export const createCommentApi = (tweetId, content) =>
  axiosInstance.post(endpoints.comments(tweetId), { content }).then((r) => r.data);

export const deleteCommentApi = (commentId) =>
  axiosInstance.delete(endpoints.deleteComment(commentId)).then((r) => r.data);

export const translateCommentsApi = (commentIds) =>
  axiosInstance.post(endpoints.translateComments, { commentIds }).then((r) => r.data);
