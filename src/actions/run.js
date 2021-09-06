const { spawn } = require('child_process')
const { ConfUtils, Utils } = require('../helpers')

async function run(argv) {
    const [config, passphrase] = await ConfUtils.loadCliConfig()
    const sessions = Utils.lodashGet(config, 'sessions', [])
    const [command, ...args] = argv
    const activeSessions = sessions.filter((s) => new Date(s.expiry) > Date.now())

    // ditch inactive sessions from CLI config to keep it clean and small
    config.sessions = activeSessions
    await ConfUtils.saveCliConfig(config, passphrase)

    if (!activeSessions.length) {
        console.log(`You have no active sessions, please authenticate first through "auth" command`.red)
        process.exit(1)
    }

    const { session } = await Utils.prompts({
        type: 'select',
        name: 'session',
        message: 'Choose an active session to use',
        choices: activeSessions.map(([name, sessionObject]) => ({ title: name, value: sessionObject })),
    })
    const { key, keyId, sessionToken, region } = session
    const env = {
        AWS_ACCESS_KEY_ID: keyId,
        AWS_SECRET_ACCESS_KEY: key,
        AWS_SESSION_TOKEN: sessionToken,
        AWS_DEFAULT_REGION: region,
    }

    spawn(command, args, { stdio: 'inherit', detached: true, shell: true, env })
}

module.exports = { run }
