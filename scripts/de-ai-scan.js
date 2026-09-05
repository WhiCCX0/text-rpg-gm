#!/usr/bin/env node
/**
 * scripts/de-ai-scan.js
 * 3-Pass 全维去 AI 味与骨力行文自动化扫描器
 * 检查项：
 *  1. 绝对禁用黑名单（20+ 高频浮夸修饰/转折/中式穿帮）
 *  2. 句子长度方差（极差是否 > 15 字，破除等长节拍器）
 *  3. 公文寄生动词（进行了/做出了/展现了）与心理咨询腔（我理解你/别灰心）
 */

const fs = require('fs');
const path = require('path');

const BLACKLIST = [
  // 浮夸修饰与伪文采
  '宛如', '悄然', '如同一把利刃', '无形的大网', '空气仿佛凝固了',
  '嘴角勾起一抹若有若无的冷笑', '眼中闪过一丝不易察觉', '殊不知', '顷刻间', '刹那间', '在这一刻',
  // 机械转折与递进
  '不仅如此', '与此同时', '毋庸置疑', '显而易见', '总而言之', '从某种意义上来说', '不得不承认的是',
  // 伪升华与鸡汤
  '不仅是.*更是', '这不是.*而是', '命运的齿轮开始转动', '生命的长河', '岁月的尘埃',
  // 心理咨询伪善腔
  '我理解你', '抱抱你', '温柔面对自己', '放过自己', '别太苛责自己',
  // 中式穿帮
  '江湖', '丞相', '金銮殿', '龙椅'
];

const PARASITIC_VERBS = [
  '进行了', '做出了', '展现出了', '呈现出', '散发着一股'
];

function analyzeText(text) {
  const issues = [];
  const warnings = [];

  if (!text || typeof text !== 'string') {
    return { passed: false, issues: ['输入文本为空'] };
  }

  // 1. 黑名单扫描 (Pass 3)
  BLACKLIST.forEach(pattern => {
    const regex = new RegExp(pattern, 'g');
    const matches = text.match(regex);
    if (matches) {
      issues.push(`命中绝对禁用黑名单模式 [${pattern}]共 ${matches.length} 次`);
    }
  });

  // 2. 公文弱动词筛查 (Pass 3)
  PARASITIC_VERBS.forEach(v => {
    if (text.includes(v)) {
      issues.push(`发现公文弱动词 [${v}]，建议升级为具体前置强动词`);
    }
  });

  // 3. 句长方差与节奏分析 (Pass 2)
  // 以句号、感叹号、问号、分号或换行分句
  const rawSentences = text.split(/[。！？!?\n;；]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('1.') && !s.startsWith('2.') && !s.startsWith('3.') && !s.startsWith('4.'));

  if (rawSentences.length >= 3) {
    const lengths = rawSentences.map(s => s.length);
    const minLen = Math.min(...lengths);
    const maxLen = Math.max(...lengths);
    const diff = maxLen - minLen;
    const avg = (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1);

    if (diff < 15) {
      warnings.push(`句子长度极差过小 (${diff} 字，最短 ${minLen} 字，最长 ${maxLen} 字)，可能存在机械等长节拍器问题，建议拉开长短句对比 (极差宜 > 15 字)`);
    }
  }

  // 4. 段末总结升华检查 (Pass 1)
  const paragraphs = text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0);
  paragraphs.forEach((p, idx) => {
    const lastSentence = p.split(/[。！？!?]/).filter(s => s.trim().length > 0).pop();
    if (lastSentence && (lastSentence.includes('永远改变') || lastSentence.includes('未知的旅程') || lastSentence.includes('注定'))) {
      issues.push(`第 ${idx + 1} 段末尾疑似存在叙述者越界升华说教: "${lastSentence}"`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    warnings,
    sentenceStats: rawSentences.length >= 3 ? { count: rawSentences.length } : null
  };
}

// CLI 执行逻辑
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    console.log('🧪 正在执行去 AI 味扫描器自检测试...\n');
    const dirtyText = `宛如一阵疾风，骑士不仅如此更是做出了严厉的警告。在这一刻，命运的齿轮开始转动。这注定是一场永远改变你的旅程。`;
    const cleanText = `铁靴踏碎积雪。寒风撕扯着粗麻斗篷，冰粒拍打在冻裂的颊骨上。他握紧断剑，掌心皮肉被粗糙的铜柄磨得生疼，石桥对面的灰影并未挪动分毫。五步。`;

    console.log('--- 测试 1：违规文本测试 ---');
    const r1 = analyzeText(dirtyText);
    console.log('预期失败，实际结果:', r1.passed ? '❌ 未拦截' : '✅ 成功拦截');
    r1.issues.forEach(i => console.log('  - ' + i));

    console.log('\n--- 测试 2：冷钢视听骨力文本测试 ---');
    const r2 = analyzeText(cleanText);
    console.log('预期通过，实际结果:', r2.passed ? '✅ 顺利通过' : '❌ 误报拦截');
    if (!r2.passed) r2.issues.forEach(i => console.log('  - ' + i));

    process.exit(r1.passed === false && r2.passed === true ? 0 : 1);
  }

  const target = args[0];
  if (!target) {
    console.log('用法: node scripts/de-ai-scan.js "<文本内容>" 或 node scripts/de-ai-scan.js <文件/目录路径> 或 node scripts/de-ai-scan.js --test');
    process.exit(1);
  }

  const scanFile = (filePath) => {
    // 规则元契约文件本身包含黑名单词表与违规案例，跳过规则定义文件本身的自检
    if (path.basename(filePath) === 'literary-pipeline-contract.md') {
      console.log(`ℹ️ [跳过契约定义] ${filePath}（规则元契约规范）`);
      return true;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const res = analyzeText(content);
    if (!res.passed) {
      console.error(`❌ [违规未通过] ${filePath}:`);
      res.issues.forEach(i => console.error('   - ' + i));
      return false;
    } else {
      console.log(`✅ [通过核验] ${filePath}`);
      return true;
    }
  };

  if (fs.existsSync(target)) {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      console.log(`🔍 正在全量递归扫描目录: ${target} ...\n`);
      const getFiles = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const fullPath = path.join(dir, file);
          const s = fs.statSync(fullPath);
          if (s.isDirectory()) {
            results = results.concat(getFiles(fullPath));
          } else if (file.endsWith('.md')) {
            results.push(fullPath);
          }
        });
        return results;
      };

      const mdFiles = getFiles(target);
      let allPassed = true;
      for (const f of mdFiles) {
        if (!scanFile(f)) {
          allPassed = false;
        }
      }
      if (!allPassed) {
        console.error('\n❌ 存在违背文学创作管线的文档，门禁拦截！');
        process.exit(1);
      } else {
        console.log('\n🎉 目录下所有 Markdown 资产去AI味终审核验 100% 通过！');
        process.exit(0);
      }
    } else {
      const ok = scanFile(target);
      process.exit(ok ? 0 : 1);
    }
  } else {
    // 纯文本传参扫描
    const textToScan = args.join(' ');
    const result = analyzeText(textToScan);
    if (result.passed) {
      console.log('✅ 去AI味核验通过：0 命中黑名单词库，无公文弱动词，符合冷钢骨力文风规范！');
      if (result.warnings.length > 0) {
        console.log('💡 风格建议:');
        result.warnings.forEach(w => console.log('  - ' + w));
      }
      process.exit(0);
    } else {
      console.error('❌ 发现违背文学创作管线的 AI 味或修辞问题:');
      result.issues.forEach(i => console.error('  - ' + i));
      process.exit(1);
    }
  }
}

module.exports = { analyzeText };
