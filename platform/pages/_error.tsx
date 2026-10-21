/**
 * Custom error page: shown for server errors and for requests Next.js can't route.
 * Same frame as the rest of the site, with a way to retry and a way home.
 */

import React from 'react'
import type { NextPage, NextPageContext } from 'next'
import Link from 'next/link'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'

interface ErrorProps {
  statusCode?: number
  title?: string
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode, title }: ErrorProps) => {
  const { t } = useLanguage()
  const E = t.errorPage
  const isServerError = Boolean(statusCode && statusCode >= 500)
  const isClientError = Boolean(statusCode && statusCode >= 400 && statusCode < 500)

  const heading = title
    ?? (statusCode === 404 ? E.titles.notFound : isServerError ? E.titles.serverError : isClientError ? E.titles.clientError : E.titles.default)
  const message = statusCode === 404 ? E.messages.notFound
    : isServerError ? E.messages.serverError
    : isClientError ? E.messages.clientError
    : E.messages.default

  return (
    <MainLayout title={`${statusCode || 'Error'}: ${heading}`} description={message} noIndex>
      <WorldPage world="kognita" planet={false} title={statusCode ? String(statusCode) : 'Error'} lead={message}>
        <section className={world.section} aria-label={heading}>
          <div className={world.sectionHead} />
          <div className={world.sectionBody}>
            <div className={world.actions}>
              <button type="button" className={world.primary} onClick={() => window.location.reload()}>{E.actions.refresh}</button>
              <Link href="/" className={world.link}>{E.actions.home}</Link>
            </div>
            {isServerError && (
              <p className={world.privacy}>
                {E.helpPrefix}{' '}
                <a className={world.link} href="https://github.com/Rtur2003?tab=repositories" target="_blank" rel="noopener noreferrer">GitHub</a>
                {E.helpSuffix}
              </p>
            )}
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return statusCode !== undefined ? { statusCode } : {}
}

export default ErrorPage
