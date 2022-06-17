module.exports = {
  name: 'twilio.com',
  factory: () => {
    const client = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    return {
      send({to, body}) {
        return client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+${to}`,
          body,
        });
      },
    };
  },
  requiredEnv: [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
  ]
}
