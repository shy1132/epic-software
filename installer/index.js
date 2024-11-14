//bun only

const fs = require('fs')
const cp = require('child_process')
const os = require('os')

import { file } from 'bun'

import windowsExecutable from './builds/auto-awesome-wallpapers.exe' with { type: 'file' }
import linuxExecutable from './builds/auto-awesome-wallpapers' with { type: 'file' }
import systemdUnit from './auto-awesome-wallpapers.service' with { type: 'file' }

let configPath;
if (process.platform == 'win32') {
    configPath = os.homedir() + '/AppData/Local/auto-awesome-wallpapers'
} else if (process.platform == 'linux') {
    configPath = os.homedir() + '/.local/share/auto-awesome-wallpapers'
} else {
    configPath = os.homedir() + '/.auto-awesome-wallpapers' //you also leave me no choice
}

let installPath = configPath + '/bin';

if (fs.existsSync(configPath)) fs.rmSync(configPath, { recursive: true, force: true })
fs.mkdirSync(installPath, { recursive: true })

async function install() {
    console.log('auto-awesome-wallpaper install started')

    if (process.platform == 'win32') {
        let buffer = Buffer.from(await file(windowsExecutable).arrayBuffer())
        fs.writeFileSync(`${installPath}/auto-awesome-wallpapers.exe`, buffer)
    } else if (process.platform == 'linux') {
        let buffer = Buffer.from(await file(linuxExecutable).arrayBuffer())
        fs.writeFileSync(`${installPath}/auto-awesome-wallpapers`, buffer)
        cp.execSync(`chmod +x "${installPath}/auto-awesome-wallpapers"`)

        cp.execSync('systemctl --user enable auto-awesome-wallpapers')
    }

    console.log('installed executable')

    if (process.platform == 'win32') {
        console.log('creating open on startup')
        let startupFolder = `${os.homedir()}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`
        let batchFile = `cd "${installPath}"\r\npowershell Start-Process -WindowStyle hidden "${installPath}\\auto-awesome-wallpapers.exe"`
        fs.writeFileSync(`${startupFolder}/auto-awesome-wallpapers.bat`, batchFile)
    } else if (process.platform == 'linux') {
        console.log('creating systemd service')

        let unit = await file(systemdUnit).text()
        unit = unit.replace('{{PATH}}', `${installPath}/auto-awesome-wallpapers`)

        fs.mkdirSync(`${os.homedir()}/.config/systemd/user`, { recursive: true })
        fs.writeFileSync(`${os.homedir()}/.config/systemd/user/auto-awesome-wallpapers.service`, unit)

        cp.execSync('systemctl --user enable auto-awesome-wallpapers')
    }

    console.log('install complete')

    console.log('starting auto-awesome-wallpapers...')
    if (process.platform == 'win32') {
        let startupFolder = `${os.homedir()}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`
        cp.execFileSync(`${startupFolder}/auto-awesome-wallpapers.bat`)
    } else if (process.platform == 'linux') {
        cp.execSync('systemctl --user start auto-awesome-wallpapers')
    }
}

install()