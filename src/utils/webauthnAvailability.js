export function shouldOfferWebAuthn({ secure, available }) {
  return secure && available
}
