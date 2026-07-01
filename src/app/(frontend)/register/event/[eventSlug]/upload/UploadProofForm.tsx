'use client'

import { useActionState } from 'react'
import { submitTransferProof, type UploadProofState } from './actions'
import { Button } from '@/components/ui/button'

const INITIAL: UploadProofState = { status: 'idle' }

export function UploadProofForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(submitTransferProof, INITIAL)

  if (state.status === 'success') {
    return (
      <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-4 text-green-800">
        <p className="font-semibold">Proof received — pending review</p>
        <p className="mt-1 text-sm">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="proof-file" className="mb-1 block text-sm font-medium text-[#0b3d2e]">
          Transfer proof (JPG, PNG or PDF, max 10MB)
        </label>
        <input
          id="proof-file"
          name="file"
          type="file"
          required
          accept="image/jpeg,image/png,application/pdf"
          className="block w-full text-sm text-[#636364] file:mr-4 file:rounded-md file:border-0 file:bg-[#0b3d2e] file:px-4 file:py-2 file:text-white"
        />
      </div>

      {state.status === 'error' && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full font-semibold">
        {pending ? 'Uploading…' : 'Submit transfer proof'}
      </Button>
    </form>
  )
}
