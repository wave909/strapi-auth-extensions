module.exports = {
  name: 'sms.ru',
  factory: () => {
    const {SMSRu} = require("@wave909/node-sms-ru");
    const smsRu = new SMSRu(process.env.SMS_RU_TOKEN);

    return {
      send({to, body, from = process.env.SMS_RU_FROM}) {
        return smsRu
          .sendSms({
            from,
            to,
            msg: body,
          })
          .then(({status_code, sms}) => {
            if (status_code !== 100) throw new Error("Coulnd't send the SMS");
            if (sms[to].status_code !== 100)
              throw new Error(
                `Couldn't send the SMS: ${sms[to] && sms[to].status_text}.`
              );

            return {
              sid: sms[to].sms_id,
            };
          });
      },
      call({to}) {
        return smsRu
          .codeCall({
            to
          })
          .then(({status, status_text, code, call_id}) => {
            if (status !== "OK") throw new Error(`Couldn't make the call: ${status_text}`)

            return {
              sid: call_id,
              code: code.toString()
            }
          })
      }
    };
  },
  requiredEnv: [
    'SMS_RU_TOKEN',
    // 'SMS_RU_FROM' fixme: check for this variable when PHONE_AUTH_CALL is not set
  ]
}
