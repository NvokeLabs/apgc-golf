import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendWhatsAppNotification } from '@/utilities/whatsapp/sendWhatsAppNotification'

describe('sendWhatsAppNotification', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  afterEach(() => vi.restoreAllMocks())

  it('no-ops (no fetch, no throw) when env is missing', async () => {
    vi.stubEnv('FONNTE_TOKEN', '')
    vi.stubEnv('FONNTE_TARGET', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const r = await sendWhatsAppNotification('hi')
    expect(r.success).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('POSTs to Fonnte with token + target + message and succeeds on ok', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'tok')
    vi.stubEnv('FONNTE_TARGET', '120363-group')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const r = await sendWhatsAppNotification('halo tim')
    expect(r.success).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.fonnte.com/send')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ Authorization: 'tok' })
    const body = init.body as URLSearchParams
    expect(body.get('target')).toBe('120363-group')
    expect(body.get('message')).toBe('halo tim')
  })

  it('is non-fatal on non-2xx', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'tok')
    vi.stubEnv('FONNTE_TARGET', 'g')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'bad' }),
    )
    const r = await sendWhatsAppNotification('x')
    expect(r.success).toBe(false)
  })

  it('is non-fatal on network error', async () => {
    vi.stubEnv('FONNTE_TOKEN', 'tok')
    vi.stubEnv('FONNTE_TARGET', 'g')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const r = await sendWhatsAppNotification('x')
    expect(r.success).toBe(false)
  })
})
