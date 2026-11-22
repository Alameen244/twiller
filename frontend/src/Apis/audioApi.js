import { axiosInstance } from "../helper/helper";
import { endpoints } from "./EndPoints/endpoints";

export const requestAudioOtpApi = () =>
  axiosInstance.post(endpoints.audioOtpRequest).then((r) => r.data);

export const verifyAudioOtpApi = (code) =>
  axiosInstance.post(endpoints.audioOtpVerify, { code }).then((r) => r.data);

// Sends the audio as multipart/form-data (field "audio" + optional text "content").
// onProgress receives 0-100 for the browser -> our server part only.
export const uploadAudioTweetApi = ({ file, content, onProgress, signal }) => {
  const formData = new FormData();
  formData.append("audio", file);
  if (content) formData.append("content", content);

  return axiosInstance
    .post(endpoints.audioTweet, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0, // large files on a slow connection must not time out
      signal,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    })
    .then((r) => r.data);
};

// Turns any API error into { code, message } for toasts and the dialog.
export const getAudioApiError = (error) => {
  const data = error?.response?.data;
  if (data?.message || data?.error) {
    return { code: data.code || null, message: data.message || data.error };
  }
  if (error?.code === "ERR_CANCELED") {
    return { code: "CANCELLED", message: "Upload cancelled." };
  }
  if (error?.response?.status === 413) {
    return { code: "AUDIO_TOO_LARGE", message: "Audio file is too large. The maximum size is 100 MB." };
  }
  return { code: null, message: "Something went wrong. Please check your connection and try again." };
};
