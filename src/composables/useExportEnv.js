import { ref, computed } from 'vue';

export function useExportEnv() {
  const env = ref({
    platform: 'desktop',
    browser: 'unknown',
    features: {
      download: false,
      print: false,
      share: false,
      clipboard: false,
      fileSaver: false
    }
  });

  function detectPlatform() {
    const ua = navigator.userAgent || '';

    // 微信检测（最高优先级）
    if (/MicroMessenger/i.test(ua)) {
      return {
        platform: 'mobile',
        browser: 'wechat'
      };
    }

    // UC 浏览器
    if (/UCBrowser/i.test(ua)) {
      return { platform: 'mobile', browser: 'uc' };
    }

    // QQ 浏览器
    if (/MQQBrowser/i.test(ua) || (/QQ/i.test(ua) && /Mobile/i.test(ua))) {
      return { platform: 'mobile', browser: 'qq' };
    }

    // 百度浏览器
    if (/baidubrowser/i.test(ua) || /baidu/i.test(ua)) {
      return { platform: 'mobile', browser: 'baidu' };
    }

    // 桌面端浏览器检测
    // Edge (Chromium-based)
    if (/Edg|Edge/i.test(ua)) {
      return { platform: 'desktop', browser: 'edge' };
    }

    // Chrome (排除 Edge 和 Opera)
    if (/Chrome|CriOS/i.test(ua)) {
      return { platform: 'desktop', browser: 'chrome' };
    }

    // Firefox
    if (/Firefox|FxiOS/i.test(ua)) {
      return { platform: 'desktop', browser: 'firefox' };
    }

    // Safari (桌面端 - 排除移动设备)
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/iPhone|iPad|iPod|Android/i.test(ua)) {
      return { platform: 'desktop', browser: 'safari' };
    }

    // Safari (移动端 - iPhone/iPad)
    if (/Safari/i.test(ua) && /iPhone|iPad|iPod/i.test(ua)) {
      return { platform: 'mobile', browser: 'safari' };
    }

    // 移动端通用检测
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
      return { platform: 'mobile', browser: 'mobile' };
    }

    // 默认桌面端
    return { platform: 'desktop', browser: 'desktop' };
  }

  function detectFeatures() {
    // download 属性检测
    const downloadTest = document.createElement('a');
    const hasDownload = 'download' in downloadTest;

    // print 检测
    const hasPrint = typeof window.print === 'function';

    // Share API 检测
    const hasShare = 'share' in navigator && typeof navigator.share === 'function';

    // Clipboard API
    const hasClipboard = 'clipboard' in navigator && typeof navigator.clipboard === 'object';

    // FileSaver
    const hasFileSaver = typeof window.saveAs === 'function';

    return {
      download: hasDownload,
      print: hasPrint,
      share: hasShare,
      clipboard: hasClipboard,
      fileSaver: hasFileSaver
    };
  }

  function init() {
    const platformInfo = detectPlatform();
    const features = detectFeatures();
    env.value = {
      ...platformInfo,
      features
    };
  }

  // Auto-initialize when composable is called
  init();

  // Computed helpers
  const isWechat = computed(() => env.value.browser === 'wechat');
  const isMobile = computed(() => env.value.platform === 'mobile');
  const isDesktop = computed(() => env.value.platform === 'desktop');
  const isSupported = computed(() => true);

  return {
    env,
    isWechat,
    isMobile,
    isDesktop,
    isSupported,
    detectPlatform,
    detectFeatures,
    init
  };
}
