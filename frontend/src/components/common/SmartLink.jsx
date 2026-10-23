import { Link } from 'react-router'
import { isInternalPath } from '../../lib/format'

/**
 * Renders a router <Link> for in-app paths and a plain <a> for everything
 * else (hash links, tel:, mailto:, external sites — which open in a new tab).
 */
export default function SmartLink({ to, children, external, preventScrollReset, ...props }) {
  if (!to) return <span {...props}>{children}</span>

  if (isInternalPath(to) && !external) {
    return (
      <Link to={to} preventScrollReset={preventScrollReset} {...props}>
        {children}
      </Link>
    )
  }

  const opensNewTab = external || /^https?:\/\//i.test(to)
  return (
    <a href={to} {...(opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
      {children}
    </a>
  )
}
