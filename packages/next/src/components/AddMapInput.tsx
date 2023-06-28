import { Button, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'

export default function AddMapInput({
  onSubmit,
  validate,
}: {
  onSubmit: (mapID: string) => Promise<void>
  validate?: (value: string) => string | null
}) {
  const [iconState, setIconState] = useState<'empty' | 'loading' | 'typing'>(
    'typing'
  )
  const form = useForm({
    initialValues: {
      search: 'bqADnHDhKOfimntdyJnyu_ltVhj',
    },
    validate: {
      search: validate,
    },
  })
  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (iconState === 'loading') return
        setIconState('loading')
        onSubmit(values.search).then(() => {
          form.reset()
          setIconState('empty')
        })
      })}
    >
      <TextInput
        {...form.getInputProps('search')}
        placeholder='Map ID (for example bqADnHDhKOfimntdyJnyu_ltVhj)'
        className='flex-1'
        classNames={{
          rightSection: 'justify-end',
        }}
        rightSection={
          <Button
            type='submit'
            variant='light'
            size='sm'
            mr='0.3rem'
            compact
            loading={iconState === 'loading'}
          >
            ↳ Add
          </Button>
        }
        onChange={(event) => {
          if (iconState === 'loading') return
          if (iconState === 'empty' && event.currentTarget.value !== '')
            setIconState('typing')
          else if (iconState === 'typing' && event.currentTarget.value === '')
            setIconState('empty')

          form.setFieldValue('search', event.currentTarget.value)
        }}
      />
    </form>
  )
}
