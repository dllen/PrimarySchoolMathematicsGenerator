import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('初始状态读取 window.innerWidth', async () => {
    global.innerWidth = 500
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isMobile } = useBreakpoint()
    expect(isMobile.value).toBe(true)
  })

  it('innerWidth=1200 时 isMobile=false', async () => {
    global.innerWidth = 1200
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isMobile } = useBreakpoint()
    expect(isMobile.value).toBe(false)
  })

  it('innerWidth=800 时 isTablet=true', async () => {
    global.innerWidth = 800
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isTablet } = useBreakpoint()
    expect(isTablet.value).toBe(true)
  })

  it('innerWidth=1500 时 isDesktop=true', async () => {
    global.innerWidth = 1500
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isDesktop } = useBreakpoint()
    expect(isDesktop.value).toBe(true)
  })

  it('innerWidth=639 边界仍是 mobile', async () => {
    global.innerWidth = 639
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isMobile, isTablet } = useBreakpoint()
    expect(isMobile.value).toBe(true)
    expect(isTablet.value).toBe(false)
  })

  it('innerWidth=640 是 tablet 起点的下限', async () => {
    global.innerWidth = 640
    const { useBreakpoint } = await import('./useBreakpoint.js')
    const { isMobile, isTablet, isDesktop } = useBreakpoint()
    expect(isMobile.value).toBe(false)
    expect(isTablet.value).toBe(true)
    expect(isDesktop.value).toBe(false)
  })
})
