import type { Resume, ResumeContent } from '@/types';

/**
 * 导出简历为 JSON 文件
 * @param resume 简历对象
 * @returns 是否下载成功
 */
export function exportResumeAsJSON(resume: Resume) {
  try {
    // 处理 content 可能是字符串的情况
    const content: ResumeContent =
      typeof resume.content === 'string'
        ? JSON.parse(resume.content)
        : resume.content;

    // 创建可下载的对象,只保留必要字段
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      resume: {
        id: resume.id,
        title: resume.title,
        template_id: resume.template_id,
        content,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // 生成文件名: 简历标题_日期.json (清理非法字符)
    const safeTitle = (resume.title || 'resume')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 50);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${safeTitle}_${dateStr}.json`;

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放 URL 对象
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return { success: true, fileName };
  } catch (error: any) {
    console.error('Export JSON failed:', error);
    return {
      success: false,
      error: error.message || '导出 JSON 失败',
    };
  }
}

/**
 * 触发 JSON 文件下载 (通用工具)
 */
export function downloadJSON(data: unknown, fileName: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
