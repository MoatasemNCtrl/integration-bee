'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function DemoSignIn() {
  const [email, setEmail] = useState('demo@example.com')
  const [name, setName] = useState('Demo User')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        name,
        redirect: false,
      })

      if (result?.ok) {
        // Refresh session and redirect
        await getSession()
        router.push('/')
        router.refresh()
      } else {
        console.error('Demo sign-in failed:', result?.error)
      }
    } catch (error) {
      console.error('Demo sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Demo Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter demo credentials to test the authentication system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDemoSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Demo User"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In with Demo Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is a demo authentication system for testing purposes.
              <br />
              For production, configure Google OAuth in the environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
