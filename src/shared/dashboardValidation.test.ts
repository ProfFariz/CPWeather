import { describe, expect, it } from 'vitest'
import { buildMockDashboardPayload } from '../mockData.ts'
import {
  isDashboardErrorPayload,
  isDashboardPayload,
} from './dashboardValidation.ts'

describe('dashboard runtime validation', () => {
  it('accepts the current shared dashboard payload shape', () => {
    const payload = buildMockDashboardPayload('tapah')

    expect(isDashboardPayload(payload)).toBe(true)
  })

  it('rejects a payload that is missing required current-condition fields', () => {
    const payload = buildMockDashboardPayload('tapah') as unknown as Record<string, unknown>
    const snapshot = payload.snapshot as Record<string, unknown>

    delete snapshot.currentSummary

    expect(isDashboardPayload(payload)).toBe(false)
  })

  it('accepts known dashboard error payloads', () => {
    expect(
      isDashboardErrorPayload({
        error: {
          code: 'INVALID_LOCATION',
          message: 'Unknown location "x".',
        },
        meta: {
          servedAt: new Date().toISOString(),
        },
      }),
    ).toBe(true)
  })
})
