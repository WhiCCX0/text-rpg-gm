#!/usr/bin/env node
/**
 * test/run-tests.js
 * 工业级研发管线自动化门禁验证套件
 * 运行所有规则引用、状态机校验与去AI味逻辑测试，输出真实 Exit Code 0
 */

const fs = require('fs');
const path = require('path');
const { validateState } = require('../scripts/validate-state');
const { analyzeText } = require('../scripts/de-ai-scan');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

console.log('====================================================');
console.log('🚀 《剑火纪元 · text-rpg-gm》工业级研发管线自动化门禁测试');
console.log('====================================================\n');

// 1. 结构与参考资产完整性测试
console.log('📦 [测试组 1] 核心拓扑与参考规范资产完整性 (全量 15 卷设定与D&D 5e有机融合)');
const requiredReferences = [
  'literary-pipeline-contract.md',
  'world-rules.md',
  'history-and-eras.md',
  'powers-and-factions.md',
  'gm-dossier.md',
  'nations-and-realms.md',
  'planes-and-cosmology.md',
  'pantheon-and-cults.md',
  'ecology-and-bestiary.md',
  'daily-life-and-economy.md',
  'legends-and-relics.md',
  'martial-and-classes.md',
  'arcane-schools-and-reagents.md',
  'srd-bestiary-and-planes.md',
  'world-setting.md'
];

requiredReferences.forEach(file => {
  const filePath = path.join(__dirname, '..', 'references', file);
  const exists = fs.existsSync(filePath);
  const size = exists ? fs.statSync(filePath).size : 0;
  assert(exists && size > 500, `参考文件 references/${file} 存在且非空 (${size} bytes)`);
});

// 2. 状态模版与 Schema 规范性测试
console.log('\n📐 [测试组 2] Truth Files 状态模版与 Schema 测试');
const schemaPath = path.join(__dirname, '..', 'templates', 'character-state-template.json');
const mdSavePath = path.join(__dirname, '..', 'templates', 'markdown-save-template.md');

assert(fs.existsSync(schemaPath), 'JSON Schema 模板存在');
let schemaJson = null;
try {
  schemaJson = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  assert(schemaJson && schemaJson.$schema, 'JSON Schema 格式合法且声明了规范头');
} catch (e) {
  assert(false, 'JSON Schema 无法解析: ' + e.message);
}

assert(fs.existsSync(mdSavePath) && fs.statSync(mdSavePath).size > 200, 'Markdown 存档投影模版存在且内容充实');

// 3. 状态校验器逻辑与因果守恒测试
console.log('\n🛡️ [测试组 3] 状态校验器 (validate-state.js) 规则测试');
const validMockState = {
  character: {
    name: '艾德',
    race: '人类',
    origin: '骑士家庭',
    age: 19,
    disciplines: [{ name: '军团剑术', stage: '熟练', debt: '无' }]
  },
  status: {
    hp_state: '轻伤',
    wounds: [{ part: '左小臂', description: '轻微骨裂', severity: '轻微' }],
    wealth: { imperial_gold: 2, silver: 40, copper: 50 },
    location: { region: '灰枝镇', spot: '旅店', tier: '凡俗层' },
    time: { era: '剑火纪', year: 3, month: '初雪月', time_of_day: '傍晚' }
  },
  inventory: {
    equipped: ['优质长剑', '皮甲'],
    carried: [{ name: '黑面包', quantity: 2, condition: '干燥' }]
  },
  relationships: {
    npcs: [{ name: '老班德', attitude: '亲善', voiceprint: '粗鲁短促', known_bounds: '仅知锻造' }],
    factions: [{ name: '边境领主', reputation: '中立' }]
  },
  world_state: {
    evolution_tracks: { war: '相持' },
    aftermaths: [{ id: 'aft-1', event: '失踪学徒调查', due_time: '3天后', consequence: '被卫兵怀疑' }]
  },
  hooks: [
    { id: 'hook-1', title: '铁匠铺异响', state: 'open', trigger_condition: '深夜探访' }
  ]
};

const validResult = validateState(validMockState);
assert(validResult.valid === true, '合规状态数据通过 Truth Files 严格校验');

const invalidMockState = {
  character: { name: '无种族者' }, // 缺少 race, origin, age
  status: { hp_state: '超人状态' } // 非法状态
};
const invalidResult = validateState(invalidMockState);
assert(invalidResult.valid === false && invalidResult.errors.length >= 3, '违规状态数据被成功拦截且报错明晰');

// 4. 文学创作管线去AI味与骨力文风扫描器测试
console.log('\n🖋️ [测试组 4] 文学创作管线 3-Pass 去AI味与骨力扫描器测试');
const badSlopText = '骑士宛如猎豹般悄然拔剑，不仅如此更是展现出了强大的气魄。在这一刻，空气仿佛凝固了。';
const badResult = analyzeText(badSlopText);
assert(badResult.passed === false, '成功检出并拦截高频 AI 浮夸词（宛如/悄然/展现出了/在这一刻/空气仿佛凝固了）');

const goodProseText = '铁靴踏碎积雪。粗麻斗篷在冻风里猎猎作响。他拔出磨损的断剑，剑柄上的粗麻布浸透了发黑的油污，对面桥头上的三个披甲斥候压低长矛，铁锋直指他的咽喉。';
const goodResult = analyzeText(goodProseText);
assert(goodResult.passed === true, '冷钢视听化动作线（Show, Don\'t Tell）顺利通过终审门禁');

// 测试总结
console.log('\n====================================================');
console.log(`📊 门禁测试结果: ${passedTests} / ${totalTests} 项通过 (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 全部测试通过！交付硬门禁核验达成：Exit Code 0。\n');
  process.exit(0);
} else {
  console.error('💥 存在未通过的门禁项，请排查！\n');
  process.exit(1);
}
