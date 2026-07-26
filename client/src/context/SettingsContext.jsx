import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getPublicSettings } from '../services/settingsService.js'
import { defaultSettings } from '../utils/settingsDefaults.js'
import SettingsContext from './settingsContextCore.js'

const mergeSettings = (settings) => ({
  ...defaultSettings,
  ...(settings && typeof settings === 'object' ? settings : {}),
})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [settingsError, setSettingsError] = useState('')

  const refreshSettings = useCallback(async () => {
    setSettingsError('')

    try {
      const nextSettings = await getPublicSettings()
      setSettings(mergeSettings(nextSettings))
      return mergeSettings(nextSettings)
    } catch (error) {
      setSettingsError(error.message)
      setSettings((currentSettings) => mergeSettings(currentSettings))
      return null
    } finally {
      setIsLoadingSettings(false)
    }
  }, [])

  const applySettings = useCallback((nextSettings) => {
    setSettings(mergeSettings(nextSettings))
    setSettingsError('')
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      setSettingsError('')

      try {
        const nextSettings = await getPublicSettings()

        if (isMounted) {
          setSettings(mergeSettings(nextSettings))
        }
      } catch (error) {
        if (isMounted) {
          setSettingsError(error.message)
          setSettings(defaultSettings)
        }
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false)
        }
      }
    }

    loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      applySettings,
      isLoadingSettings,
      refreshSettings,
      settings,
      settingsError,
    }),
    [applySettings, isLoadingSettings, refreshSettings, settings, settingsError],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
