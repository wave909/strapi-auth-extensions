// TODO: Consider storing the codes in Redis for persistence during restarts
const links = {}

const crypto = require('crypto')
const uid = require('rand-token').uid
module.exports = (
  {
    strapi
  }
) => {
  const shasum = (string) => {
    let sum = crypto.createHash('sha1').update(string)
    return sum.digest('hex')
  }
  const generateUniqToken = (obj) => {
    let key = uid(8)
    if (obj[shasum(key)]) {
      return generateUniqToken(obj)
    }
    return key
  }

  return {
    generateMagicLink: async ({to}) => {
      let magicLink = generateUniqToken(links)
      links[shasum(magicLink)] = {id: to}
      links[shasum(magicLink)].timeoutId = setTimeout(() => {
        delete codes[to]
      }, 24 * 60 * 60 * 1000) // TODO: Make the TTL configurable
      return Promise.resolve({magicLink, id: to})
    },

    validateMagicLink: async (link) => {
      const hashed = shasum(link)
      let id
      if (hashed in links) {
        id = links[hashed]
      }

      if (id) {
        return Promise.resolve({ok: true, id})
      } else {
        return Promise.resolve({ok: false})
      }
    }
  };
}
