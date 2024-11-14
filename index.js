const Twitter = require('./twitter.js')
const wallpaper = require('./wallpaper.js')
const config = require('./config.json')

let client = new Twitter()
let lastSrc = null;

async function loop() {
    try {
        let user = await client.get(`/1.1/users/show.json?screen_name=${encodeURIComponent(config.user)}`)

        let status = user.status;
        let media = status.entities.media[0]
        if (!media) return;
    
        let src = media.media_url_https;
        if (src === lastSrc) return;

        let res = await fetch(src)
        let buffer = Buffer.from(await res.arrayBuffer())

        await wallpaper.change(buffer)

        console.log(`set wallpaper to https://twitter.com/${encodeURIComponent(config.user)}/status/${status.id_str}`)

        lastSrc = src;
    } catch (err) {
        console.error('failed!', err)
    }
}

loop()
setInterval(loop, 300000)