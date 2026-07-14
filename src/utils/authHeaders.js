export function getActiveToken() {
  try {
    const accounts = JSON.parse(localStorage.getItem('abdl_accounts') || '[]')
    const activeId = localStorage.getItem('abdl_active_account')
    return accounts.find(account => String(account.id) === activeId)?.token || ''
  } catch {
    return ''
  }
}

export function withAuthHeader(headers = {}) {
  const token = getActiveToken()
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers
}
