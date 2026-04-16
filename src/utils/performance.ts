/**
 * 性能监测工具
 * 用于测量和报告应用性能指标
 */

// Web Vitals 数据接口
export interface MetricsData {
  // 首次内容绘制 (FCP) - 页面开始显示内容的时间
  fcp?: number;
  // 最大内容绘制 (LCP) - 最大元素完成渲染的时间
  lcp?: number;
  // 首次输入延迟 (FID) - 用户交互和处理之间的延迟
  fid?: number;
  // 累积布局偏移 (CLS) - 布局稳定性
  cls?: number;
  // 首次字节时间 (TTFB) - 从请求开始到收到第一个字节的时间
  ttfb?: number;
}

/**
 * 报告 Web Vitals 指标
 * @param onMetric 回调函数，在获取到指标时调用
 */
export function reportWebVitals(onMetric?: (metric: MetricsData) => void) {
  // 检查 PerformanceObserver 支持
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  const metrics: MetricsData = {};

  // 观察 Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const lastEntry = list.getEntries().pop() as any;
      if (lastEntry) {
        metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('LCP:', metrics.lcp);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP observation failed', e);
  }

  // 观察 First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const lastEntry = list.getEntries().pop();
      if (lastEntry && 'processingStart' in lastEntry) {
        const fid = (lastEntry as PerformanceEventTiming).processingStart - lastEntry.startTime;
        metrics.fid = fid;
        console.log('FID:', metrics.fid);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('FID observation failed', e);
  }

  // 观察 Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!('hadRecentInput' in entry) || !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          metrics.cls = clsValue;
          console.log('CLS:', metrics.cls);
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('CLS observation failed', e);
  }

  // 观察 First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const lastEntry = list.getEntries().pop() as any;
      if (lastEntry) {
        metrics.fcp = lastEntry.startTime;
        console.log('FCP:', metrics.fcp);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    console.warn('FCP observation failed', e);
  }

  // Time To First Byte (TTFB)
  if ('PerformanceNavigationTiming' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        metrics.ttfb = perfData.responseStart - perfData.requestStart;
        console.log('TTFB:', metrics.ttfb);
      }
      if (onMetric) {
        onMetric(metrics);
      }
    });
  }
}

/**
 * 获取资源加载时间
 */
export function getResourceMetrics() {
  const resources = performance.getEntriesByType('resource');
  return resources.map((resource) => ({
    name: resource.name,
    duration: resource.duration,
    size: (resource as PerformanceResourceTiming).transferSize || 0,
  }));
}

/**
 * 记录自定义性能指标
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  /**
   * 标记时间点
   */
  mark(name: string) {
    this.marks.set(name, performance.now());
    if (performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * 测量两个时间点之间的时间差
   */
  measure(name: string, startMark: string, endMark: string) {
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);

    if (startTime !== undefined && endTime !== undefined) {
      const duration = endTime - startTime;
      console.log(`${name}: ${duration.toFixed(2)}ms`);

      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
        } catch (e) {
          console.warn('Measure failed', e);
        }
      }

      return duration;
    }

    return null;
  }

  /**
   * 清除标记
   */
  clear(name: string) {
    this.marks.delete(name);
    if (performance.clearMarks) {
      performance.clearMarks(name);
    }
  }

  /**
   * 获取所有标记
   */
  getMarks() {
    return Array.from(this.marks.entries()).map(([name, time]) => ({
      name,
      time: time.toFixed(2),
    }));
  }
}

/**
 * 监测页面性能
 */
export function monitorPagePerformance() {
  if (typeof window === 'undefined') return;

  // 页面加载完成
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page load time:', pageLoadTime, 'ms');
  });

  // 长任务检测
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('Long task detected:', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task observation not supported', e);
    }
  }
}
