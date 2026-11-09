import axios from 'axios';
import { endpoints } from './EndPoints/endpoints';

const imageClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const uploadSingleImage = async (file, folder) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  return imageClient.post(endpoints.uploadSingleImage, formData).then((r) => r.data);
};

export const uploadMultipleImages = async (files, folder) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  formData.append('folder', folder);

  return imageClient.post(endpoints.uploadMultipleImages, formData).then((r) => r.data);
};
