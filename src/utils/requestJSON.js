export async function requestJSON(url, options = {}, fetcher = fetch) {
  const response = await fetcher(url, options)
  let data = null

  try {
    data = await response.json()
  } catch {
    if (response.ok) throw new Error('服务器响应异常')
  }

  if (!response.ok) throw new Error(data?.error || `请求失败 (${response.status})`)
  return data
}
