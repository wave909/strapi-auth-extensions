const providers = require("./Providers");
const auth = require("./auth");
const grantconfig = require("./grant-config");
const authprovider = require("./auth-provider");
const providersprofile = require("./providers-profile");
const transforms = require("./transforms");
module.exports = {
  providers,
  auth,
  ["auth-provider"]: authprovider,
  ["grant-config"]: grantconfig,
  ["providers-profile"]: providersprofile,
  transforms,
};
