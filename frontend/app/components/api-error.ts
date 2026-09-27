type ApiError = {
  detail?: unknown
}

export function getApiErrorMessage(data: ApiError, fallback: string): string {
  if (typeof data.detail === 'string') return data.detail

  if (Array.isArray(data.detail)) {
    const messages = data.detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') {
          return item.msg
        }
        return null
      })
      .filter((message): message is string => Boolean(message))

    if (messages.length > 0) return messages.join(' ')
  }

  return fallback
}
