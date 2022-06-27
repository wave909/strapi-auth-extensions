const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];
const emailRegExp =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const { sanitizeEntity } = { sanitizeEntity: (ent) => ent };
const bcrypt = require("bcryptjs");

const _ = require("lodash");
module.exports = ({ strapi }) => {
  const formatFirstStepResponse = async (user, populate = undefined) => {
    if (user.two_step_auth) {
      const token = strapi.plugins["users-permissions"].services.jwt.issue({
        auth_id: user.id,
      });
      return { token };
    } else {
      return await formatSecondStepResponse(user, populate);
    }
  };
  const formatSecondStepResponse = async (user, populate = ["*"]) => {
    console.log(populate)

    return {
      token: await strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
      }),
      user: sanitizeEntity(
          await strapi.db.query("plugin::users-permissions.user").findOne(
              {where: {id: (user.toJSON ? user.toJSON() : user).id}, populate },
          ),
          {
            model: strapi.db.query(
                "plugin::users-permissions.role",
                "users-permissions"
            ).model,
          }
      ),
    };
  };
  const getProvidersUser = async (provider, owner, query) => {
    let user, _error;
    try {
      [user, _error] = await strapi.plugins[
          "auth-ext"
          ].services.providers.connect(provider, owner, query);
    } catch ([_user, error]) {
      throw error === "array" ? error[0] : error;
    }
    return user;
  };
  const getProvidersProfile = async (provider, owner, query) => {
    let profile;
    try {
      await strapi.plugins[owner].services.providers.getProfile(
          provider,
          query,
          (err, _profile) => {
            if (err) {
              console.log(err[0].messages)
              return [null, err];
            }
            profile = _profile;
            console.log({_profile})
          }
      );
    } catch ([_profile, error]) {
      return ctx.badRequest(null, error === "array" ? error[0] : error);
    }
    return profile;
  };
  const validateLocalAuthInputs = async (params) => {
    // The identifier is required.
    if (!params.identifier) {
      throw formatError({
        id: "Auth.form.error.email.provide",
        message: "Please provide your username or your e-mail.",
      });
    }

    if (!params.password) {
      throw formatError({
        id: "Auth.form.error.password.provide",
        message: "Please provide your password.",
      });
    }

    // The password is required.
  };
  const validateLocalRegisterInputs = async (params) => {
    // The identifier is required.
    if (!params.email) {
      throw formatError({
        id: "Auth.form.error.email.provide",
        message: "Please provide your username or your e-mail.",
      });
    }

    // The password is required.
    if (!params.password) {
      throw formatError({
        id: "Auth.form.error.password.provide",
        message: "Please provide your password.",
      });
    }
  };
  const getLocalUser = async (params) => {
    const provider = params.provider || "local";
    await validateLocalAuthInputs(params);
    const query = { provider };
    // Check if the provided identifier is an email or not.
    const isEmail = emailRegExp.test(params.identifier);
    // Set the identifier to the appropriate query field.
    if (isEmail) {
      query.email = params.identifier.toLowerCase();
    } else {
      query.username = params.identifier;
    }
    // Check if the user exists.
    const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: query });
    return user;
  };
  const validateUsersAuth = async (user, params, settings) => {
    if (!user) {
      throw formatError({
        id: "Auth.form.error.invalid",
        message: "Identifier or password invalid.",
      });
    }

    if (_.get(settings, "email_confirmation") && user.confirmed !== true) {
      throw formatError({
        id: "Auth.form.error.confirmed",
        message: "Your account email is not confirmed",
      });
    }

    if (user.blocked === true) {
      throw formatError({
        id: "Auth.form.error.blocked",
        message: "Your account has been blocked by an administrator",
      });
    }

    // The user never authenticated with the `local` provider.
    if (!user.password) {
      throw formatError({
        id: "Auth.form.error.password.local",
        message:
            "This user never set a local password, please login with the provider used during account creation.",
      });
    }

    const validPassword = await strapi
        .service("plugin::users-permissions.user")
        .validatePassword(params.password, user.password);

    if (!validPassword) {
      throw formatError({
        id: "Auth.form.error.invalid",
        message: "Identifier or password invalid.",
      });
    }
  };
  const verifyFirstStepTokenAndGetUserId = async (token) => {
    if (!token) {
      return ctx.badRequest(null, {
        id: "Auth.step.token.require",
        message: "Token is required for second step",
      });
    }
    const verifiedToken = await strapi.plugins[
        "users-permissions"
        ].services.jwt.verify(token);
    if (!(verifiedToken && verifiedToken.auth_id)) {
      throw formatError({
        id: "Multifactor.step.token.invalid",
        message: "Invalid first step token",
      });
    } else {
      return verifiedToken.auth_id;
    }
  };
  const verifyProvider = async (settings, _provider) => {
    const provider = _provider === "local" ? "email" : _provider;
    if (!_.get(settings, [provider, "enabled"])) {
      throw formatError({
        id: "provider.disabled",
        message: "This provider is disabled.",
      });
    }
  };

  return {
    async firstStepCallback(ctx) {
      try {
        const provider = ctx.params.provider;
        const owner = ctx.params.pluginOwner;
        const params = ctx.request.body;
        const store = await strapi.store({
          environment: "",
          type: "plugin",
          name: "users-permissions",
        });
        const providersSettings =
            (await strapi
                .store({
                  environment: "",
                  type: "plugin",
                  name: "auth-ext",
                  key: "providers",
                })
                .get()) || {};
        let query;
        await verifyProvider(providersSettings[owner] || {}, provider);
        let data
        if (owner !== "auth-ext" || provider !== "email") {
          const providersProfile = await getProvidersProfile(provider, owner, {
            ...ctx.query,
            providerArgs: ctx.request.body.providerArgs || {},
            profileToRegister: ctx.request.body.profileToRegister || {},
            allow_register: _.get(providersSettings[owner], [
              provider,
              "register enabled",
            ]),
          });
          data= {...providersProfile,provider}
          query = {
            $or: [
              {
                provider,
                email: providersProfile.email,
                username: providersProfile.username,
              },
              {
                second_provider: provider,
                second_email: providersProfile.email,
                second_username: providersProfile.username,
              },
            ],
          };
        } else {
          await validateLocalAuthInputs(params);
          const isEmail = emailRegExp.test(params.identifier);
          console.log({params})
          data={
            provider,
            ...(isEmail
                ? { email: params.identifier,username: params.identifier }
                : { username: params.identifier,email: params.identifier+"disabled@wave909.com" }),
            password:params.password
          }

          query = {
            $or: [
              {
                provider,
                ...(isEmail
                    ? { email: params.identifier }
                    : { username: params.identifier }),
              },
              {
                second_provider: provider,
                ...(isEmail
                    ? { second_email: params.identifier }
                    : {
                      second_username: params.identifier,
                    }),
              },
            ],
          };
        }

        let user = await strapi
            .query("plugin::users-permissions.user")
            .findOne({ where: query });
        console.log(user,query)
        if (!user) {
          if (_.get(providersSettings[owner], [provider, "register enabled"])) {
            console.log(data)
            user = await strapi
                .query("plugin::users-permissions.user")
                .create({ data ,populate:ctx.query.populate});
          } else {
            return ctx.badRequest(null, "error");
          }
        }

        if (owner === "auth-ext" && provider === "email") {
          await validateUsersAuth(
              user,
              params,
              await store.get({ key: "advanced" })
          );
        }
        return await formatFirstStepResponse(user, ctx.query.populate);
      } catch (e) {
        console.log(e[0] ? e[0].messages : e.details);
        return ctx.badRequest(null, e.message);
      }
    },
    async secondStepCallback(ctx) {
      try {
        const provider = ctx.params.provider || "local";
        const params = ctx.request.body;
        const token = params.token;
        const owner = ctx.params.pluginOwner || "local";

        const store = await strapi.store({
          environment: "",
          type: "plugin",
          name: "users-permissions",
        });

        const providersSettings =
            (await strapi
                .store({
                  environment: "",
                  type: "plugin",
                  name: "auth-ext",
                  key: "providers-second",
                })
                .get()) || {};
        await verifyProvider(providersSettings[owner] || {}, provider);
        const userId = await verifyFirstStepTokenAndGetUserId(token);
        let user = await strapi
            .query("plugin::users-permissions.user")
            .findOne({ where: { id: userId } });

        if (!user.second_provider) {
          if (
              provider === "local" ||
              (owner === "auth-ext" && provider === "email")
          ) {
            await validateLocalAuthInputs(params);
            const isEmail = emailRegExp.test(params.identifier);
            const data = {
              second_provider: provider,
              password: params.password,
            };
            if (isEmail) {
              data.second_email = params.identifier.toLowerCase();
            } else {
              data.second_username = params.identifier;
            }

            user = await strapi
                .service("plugin::users-permissions.user")
                .edit(userId, data);
          } else {
            const profile = await getProvidersProfile(provider, owner, {
              ...ctx.query,
              providerArgs:ctx.request.body.providerArgs,
              _second_step: true,
            });
            const data = {
              second_provider: provider,
              second_email: profile.email,
              second_username: profile.username,
            };
            user = await strapi
                .service("plugin::users-permissions.user")
                .edit(userId, { data });
          }
        }

        if (
            provider === "local" ||
            (owner === "auth-ext" && provider === "email")
        ) {
          await validateLocalAuthInputs(params);
          const isEmail = emailRegExp.test(params.identifier);
          const query = {
            $or: [
              {
                second_provider: provider,
                id: userId,
                ...(isEmail
                    ? {
                      second_email: params.identifier.toLowerCase(),
                    }
                    : {
                      second_username: params.identifier,
                    }),
              },
              {
                provider: provider,
                id: userId,

                ...(isEmail
                    ? {
                      email: params.identifier.toLowerCase(),
                    }
                    : {
                      username: params.identifier,
                    }),
              },
            ],
          };
          user = await strapi
              .query("plugin::users-permissions.user")
              .findOne({ where: query });
          await validateUsersAuth(
              user,
              params,
              await store.get({ key: "advanced" })
          );
        } else {
          const profile = await getProvidersProfile(provider, owner, {
            ...ctx.query,
            providerArgs:ctx.request.body.providerArgs,
            _second_step: true,
          });
          const query = {
            $or: [
              {
                second_provider: provider,
                id: userId,
                second_email: profile.email,
                second_username: profile.username,
              },
              {
                provider: provider,
                id: userId,
                email: profile.email,
                username: profile.username,
              },
            ],
          };
          user = await strapi
              .query("plugin::users-permissions.user")
              .findOne({ where: query });
          console.log(query.$or,{user})

          if (!user) {

            return ctx.badRequest(
                null,
                formatError({
                  id: "Invalid.provider",
                  message: "Invalid auth data",
                })
            );
          }
        }
        return formatSecondStepResponse(user,ctx.query.populate);
      } catch (e) {
        console.log(e);
        return ctx.badRequest(null, e);
      }
    },
    async connectSecondProvider(ctx) {
      const provider = ctx.params.provider || "local";
      const params = ctx.request.body;
      const token = params.token;
      const userId = await verifyFirstStepTokenAndGetUserId(token);
      let updateData = { second_provider: provider };
      if (provider === "local") {
        await validateLocalRegisterInputs(params);
        updateData = {
          ...updateData,
          second_email: params.email,
          second_username: params.username,
          password: params.password,
        };
      } else {
        let profile = getProvidersProfile(provider, ctx.query);
        updateData = {
          ...updateData,
          second_email: profile.email,
          second_username: profile.username,
        };
      }
      const user = await strapi.query("plugin::users-permissions.user").update({
        where: { id: userId },
        data: updateData,
      });
      if (!user) {
        return ctx.badRequest(
            null,
            formatError({ id: "Token.invalid", message: "User doesn`t exist" })
        );
      }
      return await formatSecondStepResponse(newUser);
    },
  };
};
