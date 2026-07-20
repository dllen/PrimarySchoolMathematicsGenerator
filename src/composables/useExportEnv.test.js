import { describe, it, expect, beforeEach } from 'vitest';
import { useExportEnv } from './useExportEnv.js';

describe('useExportEnv', () => {
  beforeEach(() => {
    // 重置 navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true
    });
  });

  it('should detect desktop Chrome', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const { env, detectPlatform, detectFeatures, init } = useExportEnv();
    init(); // Re-initialize with new UA

    const platformInfo = detectPlatform();
    const features = detectFeatures();

    expect(platformInfo.platform).toBe('desktop');
    expect(platformInfo.browser).toBe('chrome');
    expect(features.download).toBe(true);
    expect(features.print).toBe(true);
  });

  it('should detect WeChat browser', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.38.2400(0x2800383F) Process/appbrand0'
    });

    const { env, detectPlatform, init } = useExportEnv();
    init(); // Re-initialize with new UA

    const platformInfo = detectPlatform();

    expect(platformInfo.platform).toBe('mobile');
    expect(platformInfo.browser).toBe('wechat');
  });

  it('should detect UC browser', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; U; Android 13; zh-CN; UC Browser) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/15.0.1284.1008 Mobile Safari/534.30'
    });

    const { env, detectPlatform, init } = useExportEnv();
    init(); // Re-initialize with new UA

    const platformInfo = detectPlatform();

    expect(platformInfo.platform).toBe('mobile');
    expect(platformInfo.browser).toBe('uc');
  });

  it('should detect QQ browser', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/110.0.0.0 Mobile Safari/537.36 V1_AND_SQ_8.9.9_3322_YYB_D QQ/8.9.9.8915 NetType/WIFI WebP/0.3.0 Pixel/1080 StatusBarHeight/75 SimpleUISwitch/0 QQTheme/1000'
    });

    const { env, detectPlatform, init } = useExportEnv();
    init(); // Re-initialize with new UA

    const platformInfo = detectPlatform();

    expect(env.value.platform).toBe('mobile');
    expect(env.value.browser).toBe('qq');
  });

  it('should detect iOS Safari', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });

    const { env, detectPlatform, init } = useExportEnv();
    init(); // Re-initialize with new UA

    const platformInfo = detectPlatform();

    expect(env.value.platform).toBe('mobile');
    expect(env.value.browser).toBe('safari');
  });

  it('should provide isWechat computed', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'MicroMessenger/8.0.0'
    });

    const { isWechat, isMobile, isDesktop, init } = useExportEnv();
    init(); // Re-initialize with new UA

    expect(isWechat.value).toBe(true);
    expect(isMobile.value).toBe(true);
    expect(isDesktop.value).toBe(false);
  });
});
