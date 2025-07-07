
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (PWA installed)
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true)
        setIsInstallable(false)
        return true
      }
      
      // Check if running in app context
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true)
        setIsInstallable(false)
        return true
      }
      
      return false
    }

    if (!checkIfInstalled()) {
      // Listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log('beforeinstallprompt event fired')
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setIsInstallable(true)
      }

      // Listen for appinstalled event
      const handleAppInstalled = () => {
        console.log('PWA was installed')
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)

      // For browsers that don't support beforeinstallprompt
      const timer = setTimeout(() => {
        if (!isInstalled && !deferredPrompt) {
          // Check if we can detect PWA capability
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsInstallable(true)
          }
        }
      }, 2000)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
        clearTimeout(timer)
      }
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers without beforeinstallprompt
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        // Safari instructions
        alert('To install this app on Safari:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"')
        return false
      } else {
        // Generic instructions for other browsers
        alert('To install this app:\n1. Look for the install icon in your browser\'s address bar\n2. Or check your browser\'s menu for "Install App" or "Add to Home Screen"')
        return false
      }
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    installApp
  }
}
