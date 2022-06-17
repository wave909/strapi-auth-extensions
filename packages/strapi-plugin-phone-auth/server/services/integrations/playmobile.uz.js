module.exports = {
  name: 'playmobile.uz',
  factory: () => {
    const fetch = require('isomorphic-fetch')

    const messageId = Date.now().toString()

    return {
      send({to, body}) {
        return fetch(`${process.env.PLAYMOBILE_UZ_BASE_URL}/send`, {
          method: 'POST',
          body: JSON.stringify({
            messages: [{
              recipient: to,
              "message-id": messageId,
              sms: {
                originator: process.env['PLAYMOBILE_UZ_ORIGINATOR'],
                content: {
                  "text": body
                }
              }
            }]
          }),
          headers: {
            'Authorization': `Basic ${process.env['PLAYMOBILE_UZ_TOKEN']}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        })
          .then(res => {
            if (!res.ok) {
              return res.json().then(data => {
                throw new Error(`Couldn't send the SMS: error ${data["error-code"]}, ${data["error-description"]}`)
              })
            } else {
              return {
                sid: messageId
              };
            }
          })

      },
    };
  },
  requiredEnv: ['PLAYMOBILE_UZ_TOKEN', 'PLAYMOBILE_UZ_BASE_URL', 'PLAYMOBILE_UZ_ORIGINATOR']
}
