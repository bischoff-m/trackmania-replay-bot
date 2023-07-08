import { Button } from '@mantine/core'
import { MouseEventHandler } from 'react'

export default function SaveButton({
  isActive,
  onClick,
}: {
  isActive: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <div className='fixed w-full h-full flex justify-center items-end'>
      <Button
        type='submit'
        form='composition-form'
        variant='filled'
        style={{
          position: 'absolute',
          transform: isActive ? 'translateY(-30%)' : 'translateY(150%)',
          transition: 'transform 0.2s ease',
        }}
        onClick={onClick}
      >
        Save
      </Button>
    </div>
  )
}
