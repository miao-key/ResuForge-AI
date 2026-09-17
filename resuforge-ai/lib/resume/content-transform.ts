import type { ResumeContent, Section, SectionField, CustomField } from '@/types';

/**
 * 将新的 sections 结构转换为旧格式（向后兼容）
 */
export function convertToLegacyFormat(content: ResumeContent) {
  // 如果是旧格式，直接返回
  if (content.education || content.workExperience || content.projects || content.skills) {
    return content;
  }

  const sections = content.sections || [];
  
  const result = {
    ...content,
    education: [] as any[],
    workExperience: [] as any[],
    projects: [] as any[],
    skills: [] as any[],
  };

  sections.forEach(section => {
    section.items.forEach(item => {
      const fields = getFieldsMap(item.fields);
      const customFields = getCustomFieldsMap(item.customFields);

      if (section.title === '教育经历') {
        result.education.push({
          id: item.id,
          school: fields.school || '',
          degree: fields.degree || '',
          major: fields.major || '',
          startDate: fields.startDate || '',
          endDate: fields.endDate || '',
          gpa: fields.gpa || '',
          description: fields.description || '',
        });
      } else if (section.title === '工作经历') {
        result.workExperience.push({
          id: item.id,
          company: fields.company || '',
          position: fields.position || '',
          startDate: fields.startDate || '',
          endDate: fields.endDate || '',
          current: fields.current === 'true' || fields.current === '是',
          description: fields.description || '',
        });
      } else if (section.title === '项目经历') {
        result.projects.push({
          id: item.id,
          name: fields.name || '',
          role: fields.role || '',
          startDate: fields.startDate || '',
          endDate: fields.endDate || '',
          description: fields.description || '',
          technologies: fields.technologies ? fields.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
          url: fields.url || '',
        });
      } else if (section.title === '专业技能') {
        const description = fields.description || '';
        // 兼容旧数据：如果没有 description，则拼接 category/items/level 作为描述
        let finalDescription = description;
        if (!finalDescription) {
          const legacyParts: string[] = [];
          if (fields.category) legacyParts.push(`【${fields.category}】`);
          if (fields.items) legacyParts.push(fields.items.split(',').map((t: string) => t.trim()).filter(Boolean).join('、'));
          if (fields.level) legacyParts.push(`熟练程度：${fields.level}`);
          finalDescription = legacyParts.join('，');
        }
        result.skills.push({
          id: item.id,
          description: finalDescription,
        });
      }
    });
  });

  return result;
}

// 将字段数组转换为 key-value 对象
function getFieldsMap(fields: SectionField[]): Record<string, string> {
  const map: Record<string, string> = {};
  fields.forEach(field => {
    map[field.key] = field.value || '';
  });
  return map;
}

// 将自定义字段数组转换为 key-value 对象
function getCustomFieldsMap(fields: CustomField[]): Record<string, string> {
  const map: Record<string, string> = {};
  fields.forEach(field => {
    map[field.label] = field.value || '';
  });
  return map;
}

/**
 * 获取字段值
 */
export function getFieldValue(
  item: { fields: SectionField[]; customFields: CustomField[] },
  key: string
): string {
  const field = item.fields.find(f => f.key === key);
  return field?.value || '';
}

/**
 * 获取自定义字段值
 */
export function getCustomFieldValue(
  item: { fields: SectionField[]; customFields: CustomField[] },
  label: string
): string {
  const field = item.customFields.find(f => f.label === label);
  return field?.value || '';
}

/**
 * 检查菜单是否有内容
 */
export function sectionHasContent(section: Section): boolean {
  return section.items.some(item => {
    const hasFieldValue = item.fields.some(f => f.value && f.value.trim());
    const hasCustomValue = item.customFields.some(f => f.value && f.value.trim());
    return hasFieldValue || hasCustomValue;
  });
}

/**
 * 获取菜单的展示字段
 */
export function getSectionDisplayFields(section: Section): { label: string; key: string }[] {
  if (section.isBuiltIn) {
    switch (section.title) {
      case '教育经历':
        return [
          { label: '学校', key: 'school' },
          { label: '学历', key: 'degree' },
          { label: '专业', key: 'major' },
        ];
      case '工作经历':
        return [
          { label: '公司', key: 'company' },
          { label: '职位', key: 'position' },
        ];
      case '项目经历':
        return [
          { label: '项目', key: 'name' },
          { label: '角色', key: 'role' },
        ];
      case '专业技能':
        return [
          { label: '技能描述', key: 'description' },
        ];
      default:
        return section.items[0]?.fields.slice(0, 2).map(f => ({ label: f.label, key: f.key })) || [];
    }
  }
  
  // 自定义菜单：返回前两个自定义字段
  return section.items[0]?.customFields.slice(0, 2).map(f => ({ label: f.label, key: f.id })) || [];
}
