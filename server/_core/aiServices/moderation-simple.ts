/**
 * 简化版内容审核 - 关键词过滤
 * 比AI审核更快、更可靠
 */

// 敏感词列表（可根据需要扩展）
const SENSITIVE_KEYWORDS = [
  // 暴力血腥（过度描述）
  '残忍杀害', '血流成河', '尸横遍野', '惨无人道',

  // 现代政治敏感
  '台独', '藏独', '疆独', '港独',
  '法轮功', '六四', '天安门事件',

  // 色情低俗
  '色情', '裸体', '性爱', '淫秽',

  // 歧视性内容
  '种族歧视', '性别歧视', '地域歧视',

  // 虚假信息
  '伪造历史', '篡改史实',
];

// 警告词列表（出现会警告但不阻止）
const WARNING_KEYWORDS = [
  '战争', '屠杀', '死亡', '征服',
  '叛乱', '起义', '革命', '政变',
];

export interface ModerationResult {
  safe: boolean;
  issues: string[];
  warnings: string[];
  message: string;
}

/**
 * 简单关键词审核
 */
export function moderateContentSimple(script: string): ModerationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 检查敏感词
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (script.includes(keyword)) {
      issues.push(`包含敏感词: ${keyword}`);
    }
  }

  // 检查警告词
  for (const keyword of WARNING_KEYWORDS) {
    if (script.includes(keyword)) {
      warnings.push(`包含警告词: ${keyword}`);
    }
  }

  const safe = issues.length === 0;

  return {
    safe,
    issues,
    warnings,
    message: safe
      ? (warnings.length > 0
          ? `审核通过（${warnings.length}个警告）`
          : '内容安全审核通过')
      : `发现${issues.length}个问题`
  };
}

/**
 * 历史内容专用审核（更宽松）
 */
export function moderateHistoricalContent(script: string): ModerationResult {
  const issues: string[] = [];

  // 历史内容只检查最严重的敏感词
  const strictKeywords = [
    '台独', '藏独', '疆独', '港独',
    '法轮功', '六四',
    '色情', '裸体', '性爱',
  ];

  for (const keyword of strictKeywords) {
    if (script.includes(keyword)) {
      issues.push(`包含敏感词: ${keyword}`);
    }
  }

  // 历史战争描述是正常的，不需要警告
  const safe = issues.length === 0;

  return {
    safe,
    issues,
    warnings: [],
    message: safe ? '历史内容审核通过' : `发现${issues.length}个敏感问题`
  };
}
