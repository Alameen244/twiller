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

const detectDeviceType = async () => {
    try {
        const ua = navigator.userAgent || "";
        const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
        const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
        if (isMobile || isTablet) return "mobile";

        // Check Battery API: laptops have batteries, desktop PCs do not.
        // If discharging, or dischargingTime is finite: definitely a laptop.
        if (typeof navigator.getBattery === "function") {
            try {
                const battery = await navigator.getBattery();
                if (!battery.charging || (battery.dischargingTime !== Infinity && !Number.isNaN(battery.dischargingTime))) {
                    return "laptop";
                }
            } catch {
                // Battery API query failed or blocked
            }
        }

        // Check screen resolution (using physical pixels so OS DPI scaling e.g. 125% doesn't shrink width)
        const dpr = window.devicePixelRatio || 1;
        const physicalWidth = Math.round((window.screen?.width || window.innerWidth || 0) * dpr);
        const cssWidth = window.screen?.width || window.innerWidth || 0;

        // Standard desktop monitors are physically >= 1800 or CSS >= 1500 (e.g. 1080p scaled to 1536 CSS px)
        if (physicalWidth >= 1800 || cssWidth >= 1500) {
            return "desktop";
        }

        return "laptop";
    } catch {
        return "desktop";
    }
};

export const startLoginSessionApi = async () => {
    const isBrave = await detectBrave();
    const dpr = window.devicePixelRatio || 1;
    // Calculate physical screen width to avoid display-scaling misclassification
    const physicalWidth = Math.round((window.screen?.width || window.innerWidth || 0) * dpr);
    const deviceType = await detectDeviceType();

    return axiosInstance
        .post(endpoints.loginSession, {
            screenWidth: physicalWidth || window.screen.width,
            deviceType,
            isBrave,
        })
        .then((r) => r.data);
};
export const verifyLoginSessionApi = (sessionId, code) =>
    axiosInstance.post(endpoints.loginSessionVerify, { sessionId, code }).then((r) => r.data);
export const resendLoginOtpApi = (sessionId) =>
    axiosInstance.post(endpoints.loginSessionResend, { sessionId }).then((r) => r.data);
export const getLoginHistoryApi = () =>
    axiosInstance.get(endpoints.loginHistory).then((r) => r.data);
