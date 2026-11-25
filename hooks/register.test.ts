import { expect, mock, test } from 'claude-code/testing'

test('off clears the theme, on sets it again', async ($, on) => {
  const calls: string[] = []
  mock.store(on)
  on('theme.set', () => {
    calls.push('set')

    return { value: { isDrawn: true, requestId: 'r' } }
  })
  on('theme.clear', () => {
    calls.push('clear')

    return { value: undefined as never }
  })

  const run = (args: string) =>
    $.command.run({ command: 'plain-dark', args, origin: 'human', presentation: 'default' } as never)
  await run('off')
  await run('on')

  expect(calls).toEqual(['clear', 'set'])
})
