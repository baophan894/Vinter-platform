"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Key, Eye, EyeOff } from "lucide-react"

export default function VapiDebug() {
  const [showKeys, setShowKeys] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'valid' | 'invalid' | 'missing'>('checking')
  
  useEffect(() => {
    checkApiKeys()
  }, [])

  const checkApiKeys = () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
    
    if (!publicKey || !assistantId) {
      setApiStatus('missing')
    } else if (publicKey.startsWith('vapi_pk_') && assistantId.length > 10) {
      setApiStatus('valid')
    } else {
      setApiStatus('invalid')
    }
  }

  const maskKey = (key?: string) => {
    if (!key) return 'Not configured'
    if (key.includes('your_') || key.includes('here')) return 'Not properly configured'
    return showKeys ? key : `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'valid': return 'text-green-600'
      case 'invalid': return 'text-red-600'
      case 'missing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'invalid': 
      case 'missing': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Vapi Configuration Debug
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Public Key:</p>
              <p className="text-sm font-mono">{maskKey(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)}</p>
            </div>
            <Badge variant={apiStatus === 'valid' ? 'default' : 'destructive'}>
              {process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY?.startsWith('vapi_pk_') ? 'Valid Format' : 'Invalid Format'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Assistant ID:</p>
              <p className="text-sm font-mono">{maskKey(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)}</p>
            </div>
            <Badge variant={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID.length > 10 ? 'default' : 'destructive'}>
              {process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID.length > 10 ? 'Valid Length' : 'Invalid Length'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeys(!showKeys)}
          >
            {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKeys ? 'Hide' : 'Show'} API Keys
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkApiKeys}
          >
            Check Again
          </Button>
        </div>

        {apiStatus === 'missing' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Missing API Keys!</strong><br/>
              Please configure NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local file
            </AlertDescription>
          </Alert>
        )}

        {apiStatus === 'invalid' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Invalid API Key format!</strong><br/>
              • Public Key must start with "vapi_pk_"<br/>
              • Assistant ID must have valid length<br/>
              • Make sure you're not using Private Key for Public Key
            </AlertDescription>
          </Alert>
        )}

        {apiStatus === 'valid' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>API Keys are valid!</strong><br/>
              You can now use Vapi AI Video Call.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Note:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Public Key (NEXT_PUBLIC_VAPI_PUBLIC_KEY) starts with "vapi_pk_"</li>
            <li>Private Key (VAPI_PRIVATE_KEY) starts with "vapi_sk_" - NOT for frontend</li>
            <li>Assistant ID can be obtained from Vapi Dashboard after creating Assistant</li>
            <li>Restart server after changing .env.local</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
