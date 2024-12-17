const fs = require('fs')
const cp = require('child_process')
const os = require('os')
const path = require('path')
const exec = require('util').promisify(cp.exec)

let storeDir;
if (process.platform == 'win32') {
    storeDir = os.homedir() + '/AppData/Local/epic-software'
} else if (process.platform == 'linux') {
    storeDir = os.homedir() + '/.local/share/epic-software'
} else {
    storeDir = os.homedir() + '/.epic-software' //you leave me no choice
}

fs.mkdirSync(storeDir, { recursive: true })

async function change(buffer) {
    let filePath = path.join(storeDir, 'awesomewallpaper.jpg')
    await fs.promises.writeFile(filePath, buffer)

    let safishPath = filePath.replaceAll('"', '\\"').replaceAll('\'', '\\\'')

    if (process.platform == 'win32') { //untested, should work
        await exec(`reg add "HKCU\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d "${safishPath}" /f`)
        await exec('RUNDLL32.EXE user32.dll, UpdatePerUserSystemParameters')
    } else if (process.platform == 'linux') {
        if (process.env.XDG_SESSION_DESKTOP == 'KDE') { //works
            let script = `
            desktops().forEach((d) => {
                d.currentConfigGroup = [
                    'Wallpaper',
                    'org.kde.image',
                    'General',
                ]
                d.writeConfig('Image', 'file://${safishPath}')
                d.reloadConfig()
            })
            `

            await exec(`dbus-send --session --dest=org.kde.plasmashell --type=method_call /PlasmaShell org.kde.PlasmaShell.evaluateScript string:"${script}"`)
        } else if (process.env.XDG_SESSION_DESKTOP == 'gnome') { //untested, should work
            await exec(`gsettings set org.gnome.desktop.background picture-uri "file://${safishPath}"`)
        } else if (process.env.XDG_SESSION_DESKTOP == 'cinnamon') { //works
            await exec(`gsettings set org.cinnamon.desktop.background picture-uri "file://${safishPath}"`)
        } else if (process.env.XDG_SESSION_DESKTOP == 'mate') { //works
            await exec(`gsettings set org.mate.background picture-filename "${safishPath}"`)
        } else if (process.env.XDG_SESSION_DESKTOP == 'xfce') { //works
            let list = (await exec('xfconf-query -c xfce4-desktop --list')).stdout;
            list = list.split('\n')

            for (let item of list) {
                if (item.endsWith('/last-image') || item.endsWith('/last-single-image')) {
                    await exec(`xfconf-query -c xfce4-desktop -p ${item} -s "${safishPath}"`)
                }
            }
        }
    }
}

module.exports.change = change;