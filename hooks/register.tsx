import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

const COMMAND = 'plain-dark'
const OFF_KEY = 'off'

// Near-black neutral surfaces. Colors only: no scene, no shader, nothing for the GPU to animate.
const { theme, problems } = makeColors({
  label: 'Plain dark',
  only: 'dark',
  roles: { accent: '#a8a8a8', danger: '#9a6bd1', success: '#7d9f74', warning: '#b8955a', pro: '#9488b0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0c0c0c',
        'surface-1': '#121212',
        'surface-2': '#181818',
        'surface-3': '#1e1e1e',
        'text-primary': '#ededed',
        'text-secondary': '#c2c2c2',
        'text-muted': '#989898',
      },
    },
  },
})

const LOOK: ThemeSetArgs = { colors: theme }

async function show($: EngineInterface): Promise<string | undefined> {
  const set = await $.theme.set(LOOK)

  return set.isDrawn ? undefined : set.reason
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Plain dark theme. "off" removes it, "on" brings it back.',
    })

    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    if ((await $.store.get(OFF_KEY)) !== true) {
      await show($)
    }

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = e.args.trim().toLowerCase()

    if (word === 'off') {
      await $.store.set(OFF_KEY, true)
      await $.theme.clear()

      return { text: 'Plain dark is off. /plain-dark on brings it back.' }
    }

    if (word !== '' && word !== 'on') {
      return { text: 'Use /plain-dark on or /plain-dark off.' }
    }

    await $.store.delete(OFF_KEY)
    const reason = await show($)

    return { text: reason === undefined ? 'Plain dark is on.' : `Plain dark is set, but not drawn: ${reason}` }
  })
}
