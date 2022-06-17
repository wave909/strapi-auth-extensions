const _ = require('lodash');

const integrations = {};

const noopService = {
  async send({to, body}) {
    console.log(to, body);
    throw new Error("No SMS provider configured");
  },
};

;[
  require("./integrations/twilio.com"),
  require("./integrations/sms.ru"),
  require("./integrations/playmobile.uz")
]
  .filter(({requiredEnv}) => requiredEnv.every(key => Boolean(process.env[key])))
  .forEach(({name, factory}) => {
    integrations[name] = factory()
  })

// TODO: Compare configuration data with installed requirements to provide meaningful warnings on startup
//  ("You're trying to configure an integrations that doesn't have the required packages" and vice versa")
// Then we can get rid of lazyStorage
if (Object.keys(integrations).length > 1) {
  throw new Error(
    "Not implemented: multiple SMS providers are not supported yet"
  );
}

// TODO: Provider selection logic (injected methods and regex for country codes)
const chooseProvider = ({to}) => {
  return Object.values(integrations)[0] || noopService;
};

// TODO: Consider storing the codes in Redis for persistence during restarts
const codes = {};
const debugNumbers = (process.env.PHONE_AUTH_DEBUG_NUMBER || '').split(" ");
const useDebugNumber = Boolean(process.env.PHONE_AUTH_DEBUG);
const useCallAPI = Boolean(process.env.PHONE_AUTH_CALL)

module.exports = ({strapi}) => ({
  callForCode: (params) =>
    chooseProvider(params) && chooseProvider(params).call(params),
  sendSms: (params) =>
    chooseProvider(params) && chooseProvider(params).send(params),
  sendTemplatedSms: ({to, template, data}) =>
    strapi.plugins["phone-auth"].services.sms.sendSms({to, body: _.template(template)(data)})
  ,
  sendCode: async ({to, locale}) => {
    if (useDebugNumber) {
      if (debugNumbers.find((it) => it === to)) {
        const token = strapi.plugins["users-permissions"].services.jwt.issue({
          request: MOCK_REQUEST_TOKEN,
        });
        return Promise.resolve({
          sid: MOCK_REQUEST_TOKEN,
          token
        });
      }
    }

    let code, sid;
    if (useCallAPI) {
      const response = await strapi.plugins["phone-auth"].services.sms.callForCode({to});
      code = response.code;
      sid = response.sid;
    } else {
      code = generateVerificationCode(4, {type: "string"});
      const templates = strapi.plugins["phone-auth"].templates["auth-code"];
      const response = await strapi.plugins["phone-auth"].services.sms.sendTemplatedSms({
        to,
        template: (locale && templates[locale]) || templates["en"] || "Your code: <%= CODE %>",
        data: {
          CODE: code
        }
      }); // TODO: Alert on low balance
      sid = response.sid;
    }

    // TODO: Should we store multiple valid codes?
    if (codes[to]) {
      clearTimeout(codes[to].timeoutId);
      delete codes[to];
    }

    const token = strapi.plugins["users-permissions"].services.jwt.issue({
      request: sid,
    });

    codes[to] = {
      code,
      token,
      sid,
      timeoutId: setTimeout(() => {
        delete codes[to];
      }, 5 * 60 * 1000), // TODO: Make the TTL configurable
    };

    return {sid, token}
  },
  validateCode: ({to, code, sid}) => {
    if (useDebugNumber && debugNumbers.find((it) => it === to) && code === MOCK_CORRECT_CODE) {
      return Promise.resolve({ok: true, status: "OK"});
    }

    if (!codes[to] || codes[to].sid !== sid) {
      return Promise.resolve({ok: false, status: "Incorrect token"});
    }
    if (codes[to].code !== code) {
      return Promise.resolve({ok: false, status: "Incorrect code"});
    }
    clearTimeout(codes[to].timeoutId);
    delete codes[to];

    return Promise.resolve({ok: true, status: "OK"});
  },
});

const MOCK_CORRECT_CODE = "1234";
const MOCK_REQUEST_TOKEN = "mock token";

// https://github.com/kevinbpalmer/generate-sms-verification-code
// fixme: Check for cryptographic security https://tools.ietf.org/html/rfc6238
// https://github.com/jaredhanson/passport-totp
const generateVerificationCode = (length, options) => {
  if (isNaN(length)) {
    throw new TypeError(
      "Length must be a number",
      "generate-sms-verification-code/index.js",
      3
    );
  }
  if (length < 1) {
    throw new RangeError(
      "Length must be at least 1",
      "generate-sms-verification-code/index.js",
      6
    );
  }
  let possible = "0123456789";
  let string = "";
  for (let i = 0; i < length; i++) {
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (options) {
    if (options.type === "number") {
      return parseFloat(string);
    }
  }

  return string;
};
