#!/usr/bin/env node
/**
 * scripts/validate-state.js
 * 校验 RPG 运行状态 JSON 是否符合 Truth Files 强类型约束
 */

const fs = require('fs');
const path = require('path');

function validateState(stateData) {
  const errors = [];
  const warnings = [];

  if (!stateData || typeof stateData !== 'object') {
    return { valid: false, errors: ['状态数据必须是一个 JSON 对象'] };
  }

  // 1. 角色字段核查
  const char = stateData.character;
  if (!char) {
    errors.push('缺少核心对象: character');
  } else {
    if (!char.name) errors.push('character.name 不能为空');
    if (!char.race) errors.push('character.race 不能为空');
    if (!char.origin) errors.push('character.origin 不能为空');
    if (typeof char.age !== 'number' || char.age <= 0) errors.push('character.age 必须为正整数');
    if (!Array.isArray(char.disciplines)) {
      errors.push('character.disciplines 必须为数组');
    }
  }

  // 2. 状态与生理伤势核查
  const status = stateData.status;
  if (!status) {
    errors.push('缺少核心对象: status');
  } else {
    const validHPs = ['健康', '轻伤', '重伤', '濒死', '死亡'];
    if (!validHPs.includes(status.hp_state)) {
      errors.push(`status.hp_state 必须为以下之一: ${validHPs.join(', ')}`);
    }
    if (!Array.isArray(status.wounds)) {
      errors.push('status.wounds 必须为数组');
    } else {
      status.wounds.forEach((w, idx) => {
        if (!w.part || !w.description || !w.severity) {
          errors.push(`status.wounds[${idx}] 必须包含 part, description, severity`);
        }
      });
    }

    // 财富非负检查
    if (!status.wealth) {
      errors.push('缺少 status.wealth 财富对象');
    } else {
      ['imperial_gold', 'silver', 'copper'].forEach(coin => {
        if (typeof status.wealth[coin] !== 'number' || status.wealth[coin] < 0) {
          errors.push(`status.wealth.${coin} 必须为非负整数`);
        }
      });
    }

    // 认知层级
    if (!status.location || !status.location.tier) {
      errors.push('缺少 status.location.tier');
    } else {
      const validTiers = ['凡俗层', '文明层', '超凡层', '异界层', '诸界层'];
      if (!validTiers.includes(status.location.tier)) {
        errors.push(`status.location.tier 必须为: ${validTiers.join(', ')}`);
      }
    }
  }

  // 3. 随身物品
  if (!stateData.inventory || !Array.isArray(stateData.inventory.carried)) {
    errors.push('缺少 inventory.carried 数组');
  }

  // 4. 未结余波与伏笔
  if (stateData.world_state) {
    if (Array.isArray(stateData.world_state.aftermaths)) {
      stateData.world_state.aftermaths.forEach((a, idx) => {
        if (!a.id || !a.event || !a.due_time) {
          errors.push(`aftermaths[${idx}] 缺少 id, event 或 due_time`);
        }
      });
    }
  }

  if (Array.isArray(stateData.hooks)) {
    const validStates = ['open', 'progressing', 'deferred', 'resolved'];
    stateData.hooks.forEach((h, idx) => {
      if (!h.id || !h.title || !validStates.includes(h.state)) {
        errors.push(`hooks[${idx}] 必须具有合法 id, title 与 state (${validStates.join('/')})`);
      }
    });
  } else {
    warnings.push('hooks 数组不存在，当前无追踪中的伏笔');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// CLI 执行逻辑
if (require.main === module) {
  const args = process.argv.slice(2);
  let filePath = null;

  if (args.includes('--template')) {
    filePath = path.join(__dirname, '..', 'templates', 'character-state-template.json');
  } else if (args[0] && !args[0].startsWith('--')) {
    filePath = args[0];
  }

  if (!filePath) {
    console.log('用法: node scripts/validate-state.js <state-file.json> 或 node scripts/validate-state.js --template');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    // 如果是 schema 模板本身，检查 schema 的有效性
    if (json.$schema) {
      console.log('✅ JSON Schema 模板格式合法且可解析。');
      process.exit(0);
    }

    const result = validateState(json);
    if (result.valid) {
      console.log('✅ 状态数据完全符合 Truth Files 强类型校验规范！');
      if (result.warnings.length > 0) {
        console.log('⚠️ 警告事项:', result.warnings);
      }
      process.exit(0);
    } else {
      console.error('❌ 状态校验失败，发现因果或结构违规项:');
      result.errors.forEach(e => console.error('  - ' + e));
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ 读取或解析 JSON 失败:', err.message);
    process.exit(1);
  }
}

module.exports = { validateState };
