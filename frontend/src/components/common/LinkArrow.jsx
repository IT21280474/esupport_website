import { cx } from '../../lib/format'
import Icon from './Icon'
import SmartLink from './SmartLink'

const CLASSES =
  'group/link inline-flex items-center gap-2.5 pb-1.5 text-[.78rem] font-bold uppercase tracking-[.14em] ' +
  'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-left-bottom bg-no-repeat ' +
  'transition-[background-size] duration-500 ease-brand hover:bg-[length:100%_1px]'

/** Underline-on-hover text link with an arrow (prototype .link-arrow). */
export default function LinkArrow({ to, children, className, icon = 'arrow', as, ...props }) {
  const content = (
    <>
      {children}
      <Icon name={icon} className="size-5 transition-transform duration-250 ease-brand group-hover/link:translate-x-1" />
    </>
  )

  // Inside a card that is itself a link, render a span styled the same way
  if (as === 'span' || !to) {
    return (
      <span className={cx(CLASSES, className)} {...props}>
        {content}
      </span>
    )
  }

  return (
    <SmartLink to={to} className={cx(CLASSES, className)} {...props}>
      {content}
    </SmartLink>
  )
}
