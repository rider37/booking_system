import React from 'react'

type BottomBarProps = {
  left?: React.ReactNode
  right?: React.ReactNode
}

export const BottomBar: React.FC<BottomBarProps> = ({ left, right }) => {
  return (
    <div className="bottom-bar">
      <div className="bottom-bar__inner">
        <div className="bottom-bar__left">{left}</div>
        <div className="bottom-bar__right">{right}</div>
      </div>
    </div>
  )
}


