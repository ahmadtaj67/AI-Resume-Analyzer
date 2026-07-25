export const getSafeRedirectPath = (from, fallbackPath = '/dashboard') => {
  if (typeof from !== 'string') {
    return fallbackPath
  }

  const trimmedFrom = from.trim()

  if (
    !trimmedFrom.startsWith('/') ||
    trimmedFrom.startsWith('//') ||
    trimmedFrom.includes('://') ||
    trimmedFrom.toLowerCase().startsWith('javascript:')
  ) {
    return fallbackPath
  }

  return trimmedFrom
}
