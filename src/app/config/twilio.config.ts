
import client from "twilio";
import env from "./env";


export const twilio =  client(env.ACCOUNT_SID, env.AUTH_TOKEN);