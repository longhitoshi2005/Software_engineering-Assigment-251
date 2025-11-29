"use client"

import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { setAccessToken } from '../lib/api'

export default function TokenLoader() {
  useEffect(() => {
    try {
      const t = Cookies.get('access_token')
      if (t) setAccessToken(t)
    } catch (e) {
      // ignore
    }
  }, [])

  return null
}
