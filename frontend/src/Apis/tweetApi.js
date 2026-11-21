import { axiosInstance } from "../helper/helper";
import { endpoints } from "./EndPoints/endpoints";

export const deletePostApi = (id) =>
  axiosInstance.delete(endpoints.deletePost(id)).then((r) => r.data);
