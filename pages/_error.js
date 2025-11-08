import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GoogleGenerativeAI } from '@google/genai';

const MODEL_ID = 'gemini-2.5-flash-image';

function Error({ statusCode }) {
  return (
    <>
      <Head>
        <title>Error {statusCode} - Merchify</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            {statusCode || 'Error'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {statusCode === 404
              ? 'This page could not be found.'
              : 'An error occurred on the server.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error

