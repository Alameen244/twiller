import { endpoints } from './EndPoints/endpoints';
import { axiosInstance } from "../helper/helper";

export const uploadSingleImage = async (file, folder = "POST") => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  return axiosInstance
    .post(endpoints.uploadSingleImage, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const uploadMultipleImages = async (files, folder = "POST") => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  formData.append('folder', folder);

  return axiosInstance
    .post(endpoints.uploadMultipleImages, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
