'use client';

import { useEffect, useState } from 'react';

/**
 * 客户端挂载检测
 *
 * 解决 SSR/CSR 不一致问题 (hydration error)
 * 用法:
 * const mounted = useMounted();
 * if (!mounted) return <Skeleton />;
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
