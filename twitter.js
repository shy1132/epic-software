const tls = require('node:tls')
const util = require('./util.js')
const config = require('./config.json')

let bearerToken = 'Bearer AAAAAAAAAAAAAAAAAAAAAG5LOQEAAAAAbEKsIYYIhrfOQqm4H8u7xcahRkU%3Dz98HKmzbeXdKqBfUDmElcqYl0cmmKY9KdS2UoNIz3Phapgsowi'

class Client {
    constructor() {
        this.cookie = null;
        this.guestToken = null;
        this.authenticated = false;
        this.authInterval = null;
    }

    async authenticate() {
        try {
            let res = await fetch('https://api.x.com/1.1/guest/activate.json', {
                headers: {
                    'Authorization': bearerToken,
                    'User-Agent': config.userAgent
                },
                method: 'POST'
            })

            let data = await res.text()

            if (data.startsWith('{') && res.ok) {
                let json = JSON.parse(data)
                this.guestToken = json.guest_token;
                this.cookie = res.headers.getSetCookie().map(c => c.split(';')[0]).join('; ') + `; gt=${json.guest_token}`;
                this.authenticated = true;
            } else {
                this.authenticated = false;
                throw `${res.status} ${res.statusText}: ${data}`
            }

            this.authInterval = setInterval(() => this.authenticate(), 3600000)
        } catch (err) {
            throw new Error(`failed to authenticate! ${err}`);
        }
    }

    async get(endpoint) {
        if (!this.authenticated) await this.authenticate()

        let url;
        if (!endpoint.startsWith('https://')) {
            url = (new URL(`https://api.x.com/${endpoint}`)).href
        } else {
            url = (new URL(endpoint)).href;
        }

        let headers = {
            'Accept-Language': 'en',
            'Authorization': bearerToken,
            'Cookie': this.cookie,
            'x-guest-token': this.guestToken,
            'User-Agent': config.userAgent
        }

        let res = await fetch(url, { headers })
        let data = await res.json()
        return data;
    }
}

const ORIGINAL_CIPHERS = tls.DEFAULT_CIPHERS;
const TOP_N_SHUFFLE = 8;
function randomizeCiphers() { //thank you cobalt
    do {
        let cipherList = ORIGINAL_CIPHERS.split(':')
        let shuffled = util.shuffleArray(cipherList.slice(0, TOP_N_SHUFFLE))
        let retained = cipherList.slice(TOP_N_SHUFFLE)

        tls.DEFAULT_CIPHERS = [ ...shuffled, ...retained ].join(':')
    } while (tls.DEFAULT_CIPHERS === ORIGINAL_CIPHERS)
}

randomizeCiphers()
setInterval(randomizeCiphers, 1800000)

module.exports = Client;