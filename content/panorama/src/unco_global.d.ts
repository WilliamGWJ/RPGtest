import React from 'react'
  import ReactPanorama from "@demon673/react-panorama"
  
  declare global{
      const React:typeof React
      const ReactPanorama:typeof ReactPanorama
      const useNetTableKey:typeof ReactPanorama.useNetTableKey
      const render:typeof ReactPanorama.render
      const useGameEvent:typeof ReactPanorama.useGameEvent
      const useNetTableValues:typeof ReactPanorama.useNetTableValues
      const useRegisterForUnhandledEvent:typeof ReactPanorama.useRegisterForUnhandledEvent
      const memo:typeof React.memo
      const useCallback:typeof React.useCallback
      const useContext:typeof React.useContext
      const useDebugValue:typeof React.useDebugValue
      const useEffect:typeof React.useEffect
      const useLayoutEffect:typeof React.useLayoutEffect
      const useReducer:typeof React.useReducer
      const useRef:typeof React.useRef
      const useState:typeof React.useState
  }