'use client'
import * as React from 'react'

import { getUserProfile } from '@/lib/actions/profile.actions'

export function LiveAvatars() {
  React.useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await getUserProfile()
      console.log('User Profile fetched in LiveAvatars:', userProfile)
    }
    fetchProfile()
  }, [])
  return (
    <div>
      <p>Live Avatars will appear here.</p>
    </div>
  )
}
