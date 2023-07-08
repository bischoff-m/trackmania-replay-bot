import { Button, clsx } from '@mantine/core'
import { MouseEventHandler } from 'react'

export default function SaveButton({
  isActive,
  onClick,
}: {
  isActive: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}) {
  return (
    <div
      className={clsx(
        'fixed',
        'w-full',
        'h-full',
        'flex',
        'justify-center',
        'items-end',
        'z-10',
        'pointer-events-none'
      )}
    >
      <Button
        type='submit'
        form='composition-form'
        variant='filled'
        style={{
          pointerEvents: 'auto',
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
