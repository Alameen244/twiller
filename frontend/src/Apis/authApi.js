import { endpoints } from "./EndPoints/endpoints";
import { axiosInstance } from "../helper/helper";

export const getLoggedInUser = (email) =>
    axiosInstance.get(endpoints.loggedInUser,
        {
            params: { email }
        })
        .then((r) => r.data);
export const registerUser = (payload) =>
    axiosInstance.post(endpoints.register, payload)
        .then((r) => r.data);
export const updateUser = (email, payload) =>
    axiosInstance.patch(endpoints.userUpdate(email)
        , payload)
        .then((r) => r.data);
export const sendPhoneOtpApi = (phoneNumber) =>
    axiosInstance.post(endpoints.phoneSendOtp, { phoneNumber }).then((r) => r.data);
export const confirmPhoneOtpApi = (phoneNumber, code) =>
    axiosInstance.post(endpoints.phoneVerifyOtp, { phoneNumber, code }).then((r) => r.data);
