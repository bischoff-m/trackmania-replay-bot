import { api } from '@global/api'
import { ActionIcon, Input, Title, Transition } from '@mantine/core'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function AppSettings() {
  const [inputValue, setInputValue] = useState<string | null>(null)
  const [inputState, setInputState] = useState<
    'saved' | 'loading' | 'dirty' | 'error'
  >('saved')

  useEffect(() => {
    if (inputValue !== null) return
    api.getSettings().then((settings) => {
      setInputValue(settings.trackmaniaRoot)
      if (settings.trackmaniaRoot === '') setInputState('error')
    })
  })

  return (
    <>
      <Title order={2}>General Settings</Title>
      <Input.Wrapper label='Trackmania Documents Folder'>
        <div className='flex items-center'>
          <Input
            styles={{ input: { fontFamily: 'monospace' } }}
            placeholder='C:/Users/<username>/Documents/Trackmania'
            value={inputValue ?? ''}
            onChange={(e) => {
              setInputValue(e.currentTarget.value)
              setInputState('dirty')
            }}
            error={inputState === 'error'}
            className='flex-grow'
          />
          <Transition
            mounted={inputState !== 'saved'}
            transition={{
              in: { opacity: 1, transform: 'scaleX(1)' },
              out: { opacity: 0, transform: 'scaleX(0)' },
              common: { transformOrigin: 'right' },
              transitionProperty: 'transform, opacity',
            }}
            duration={200}
            timingFunction='ease'
          >
            {(transitionStyle) => (
              <ActionIcon
                variant='subtle'
                color='blue'
                aria-label='Save'
                ml='xs'
                style={transitionStyle}
                loading={inputState === 'loading'}
                onClick={() => {
                  let value = inputValue
                  if (value === null) return
                  value = value.trim()
                  value = value.replace(/\\\\/g, '/')
                  value = value.replace(/\\/g, '/')
                  value = value.replace(/\/\//g, '/')

                  if (
                    !value
                      .toLowerCase()
                      .match(/^\w\:(?:\/[a-z_\-\s0-9\.]+)+\/{0,1}$/)
                  ) {
                    setInputState('error')
                    return
                  }
                  setInputValue(value)
                  setInputState('loading')
                  api
                    .setSettings({ trackmaniaRoot: value })
                    .then(() => {
                      setInputState('saved')
                    })
                    .catch(() => {
                      console.error('Failed to save settings')
                      setInputState('error')
                    })
                }}
              >
                <IconDeviceFloppy />
              </ActionIcon>
            )}
          </Transition>
        </div>
      </Input.Wrapper>
    </>
  )
}
