/**
 * 生成外链提醒页 URL
 * @param {string} url - 目标外链
 * @returns {string} 跳转到 /external?url=... 的路径
 */
export function externalLinkUrl(url) {
  // BUG-991: Validate URL to prevent javascript: protocol
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return '#'
  } catch { return '#'
  }
  return `/external?url=${encodeURIComponent(url)}`;
}
