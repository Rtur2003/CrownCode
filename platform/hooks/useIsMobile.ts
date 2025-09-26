import { useState, useEffect } from 'react'

/**
 * Custom hook to detect if the current device is mobile
 * Uses window.innerWidth and matches the Tailwind CSS breakpoint (768px)
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Initial check
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < breakpoint)
      }
    }

    // Check on mount
    checkIsMobile()

    // Add event listener for window resize
    const handleResize = () => {
      checkIsMobile()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to detect touch device
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }
  }, [])

  return isTouchDevice
}

/**
 * Hook to get device type
 */
export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
}

export const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenWidth: 1024,
    screenHeight: 768,
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        const height = window.innerHeight

        const isTouchDevice =
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-ignore
          navigator.msMaxTouchPoints > 0

        setDeviceInfo({
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
          isTouchDevice,
          screenWidth: width,
          screenHeight: height,
        })
      }
    }

    // Initial check
    updateDeviceInfo()

    // Add event listener
    window.addEventListener('resize', updateDeviceInfo)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

export default useIsMobile