//bun only

const fs = require('fs')
const cp = require('child_process')
const os = require('os')

import { file } from 'bun'

import windowsExecutable from './builds/epic-software.exe' with { type: 'file' }
import linuxExecutable from './builds/epic-software' with { type: 'file' }
import systemdUnit from './epic-software.service' with { type: 'file' }

let configPath;
if (process.platform == 'win32') {
    configPath = os.homedir() + '/AppData/Local/epic-software'
} else if (process.platform == 'linux') {
    configPath = os.homedir() + '/.local/share/epic-software'
} else {
    configPath = os.homedir() + '/.epic-software' //you also leave me no choice
}

let installPath = configPath + '/bin'

if (fs.existsSync(configPath)) fs.rmSync(configPath, { recursive: true, force: true })
fs.mkdirSync(installPath, { recursive: true })

async function install() {
    console.log('epic-software install started')

    if (process.platform == 'win32') {
        let buffer = Buffer.from(await file(windowsExecutable).arrayBuffer())
        fs.writeFileSync(`${installPath}/epic-software.exe`, buffer)
    } else if (process.platform == 'linux') {
        let buffer = Buffer.from(await file(linuxExecutable).arrayBuffer())
        fs.writeFileSync(`${installPath}/epic-software`, buffer)
        cp.execSync(`chmod +x "${installPath}/epic-software"`)

        cp.execSync('systemctl --user enable epic-software')
    }

    console.log('installed executable')

    if (process.platform == 'win32') {
        console.log('creating open on startup')
        let startupFolder = `${os.homedir()}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`
        let winPath = installPath.replaceAll('/', '\\')
        let batchFile = `cd "${winPath}"\r\npowershell Start-Process -WindowStyle hidden '${winPath}\\epic-software.exe'`
        fs.writeFileSync(`${startupFolder}/epic-software.bat`, batchFile)
    } else if (process.platform == 'linux') {
        console.log('creating systemd service')

        let unit = await file(systemdUnit).text()
        unit = unit.replace('{{PATH}}', `${installPath}/epic-software`)

        fs.mkdirSync(`${os.homedir()}/.config/systemd/user`, { recursive: true })
        fs.writeFileSync(`${os.homedir()}/.config/systemd/user/epic-software.service`, unit)

        cp.execSync('systemctl --user enable epic-software')
    }

    console.log('install complete')

    console.log('starting epic-software...')
    if (process.platform == 'win32') {
        let startupFolder = `${os.homedir()}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup`
        cp.execFileSync(`${startupFolder}/epic-software.bat`)
    } else if (process.platform == 'linux') {
        cp.execSync('systemctl --user start epic-software')
    }
}

install()