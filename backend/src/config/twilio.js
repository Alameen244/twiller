import "dotenv/config";
import twilio from "twilio";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,TWILIO_VERIFY_SERVICE_SID } = process.env;
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  throw new Error("Missing TWILIO_* values in backend .env");
}

export const verifyService = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  .verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
