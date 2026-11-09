import client from './client'; import { endpoints } from './EndPoints/endpoints';
export const getLoggedInUser = (email) => client.get(endpoints.loggedInUser, { params: { email } }).then((r) => r.data);
export const registerUser = (payload) => client.post(endpoints.register, payload).then((r) => r.data);
export const updateUser = (email, payload) => client.patch(endpoints.userUpdate(email), payload).then((r) => r.data);

