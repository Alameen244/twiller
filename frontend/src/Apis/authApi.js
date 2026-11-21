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
// Forgot password (logged-out flow)
// payload: { method: 'email', email } or { method: 'phone', phoneNumber }
export const forgotPasswordRequestApi = (payload) =>
    axiosInstance.post(endpoints.forgotPasswordRequest, payload).then((r) => r.data);
// payload: same as above plus { code, newPassword }
export const forgotPasswordResetApi = (payload) =>
    axiosInstance.post(endpoints.forgotPasswordReset, payload).then((r) => r.data);


// Login session (device info, Chrome email OTP, mobile time window)
// screenWidth lets the backend label non-mobile devices as laptop or desktop.

// Brave's user-agent is identical to Chrome's, so the browser itself has to tell us.
const detectBrave = async () => {
    try {
        return Boolean(navigator.brave && (await navigator.brave.isBrave()));
    } catch {
        return false;
    }
};
export const startLoginSessionApi = async () =>
    axiosInstance
        .post(endpoints.loginSession, { screenWidth: window.screen.width, isBrave: await detectBrave() })
        .then((r) => r.data);
export const verifyLoginSessionApi = (sessionId, code) =>
    axiosInstance.post(endpoints.loginSessionVerify, { sessionId, code }).then((r) => r.data);
export const resendLoginOtpApi = (sessionId) =>
    axiosInstance.post(endpoints.loginSessionResend, { sessionId }).then((r) => r.data);
export const getLoginHistoryApi = () =>
    axiosInstance.get(endpoints.loginHistory).then((r) => r.data);
