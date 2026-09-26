'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MouseEvent, ReactNode } from 'react'

type AuthLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

export default function AuthLink({ href, className, children }: AuthLinkProps) {
  const router = useRouter()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || !document.startViewTransition
    ) {
      return
    }

    event.preventDefault()
    document.startViewTransition(() => router.push(href))
  }

  return <Link className={className} href={href} onClick={handleClick}>{children}</Link>
}
