const FALLBACK_MESSAGES = {
  network: 'Unable to connect to the server. Please try again.',
  timeout: 'The request took too long. Please try again.',
  unexpected: 'Something went wrong. Please try again.',
}

export const normalizeApiError = (error) => {
  if (error?.code === 'ECONNABORTED') {
    return {
      status: null,
      message: FALLBACK_MESSAGES.timeout,
      isNetworkError: false,
      isTimeout: true,
    }
  }

  if (!error?.response) {
    return {
      status: null,
      message: FALLBACK_MESSAGES.network,
      isNetworkError: true,
      isTimeout: false,
    }
  }

  const safeMessage =
    typeof error.response.data?.message === 'string'
      ? error.response.data.message
      : FALLBACK_MESSAGES.unexpected

  return {
    status: error.response.status,
    message: safeMessage,
    isNetworkError: false,
    isTimeout: false,
  }
}
