# 剑火纪元 · 文本角色扮演主持人技能 (text-rpg-gm)

> **工业级 Agent Skill**：让 AI 作为专业游戏主持人（GM），为玩家运行硬核、沉浸且具有历史厚重感的《剑火纪元 · 西方幻想人生模拟器》。
> **全新升级**：原生内嵌**文学创作管线（Creative Writing Pipeline）**与 **Truth Files 双轨状态持久化引擎**，彻底消灭 AI 塑料味、设定遗忘与因果漂移。

---

## 目录拓扑与架构设计

```text
text-rpg-gm/
├── SKILL.md                              # GM 核心运行协议（大写规范，内嵌4阶文学管线与终审门禁）
├── references/                           # 宏大世界设定与文学契约（全量 15 卷模块化参考库，D&D 5e有机融入）
│   ├── literary-pipeline-contract.md    # 文学创作管线执行契约（冷钢骨力文风、3-Pass去AI味黑名单）
│   ├── world-rules.md                   # 卷一：世界基本规则、七律、魔潮与三界地理
│   ├── history-and-eras.md              # 卷二：七纪元历史、时代状态对照表、演化八线
│   ├── powers-and-factions.md           # 卷三~五：九大种族、五道法统、元素谱系与超凡六道
│   ├── nations-and-realms.md            # 全大陆诸国志：灰岩十一邦、埃瑟加德高塔、自由港等七大国度与边疆走廊
│   ├── planes-and-cosmology.md          # 位面宇宙志：原初以太、星界神尸、妖精原野、深渊十二裂口深度志
│   ├── pantheon-and-cults.md            # 万神殿与异端：九大主神圣约价签、五大异端派系、四大跨国隐秘结社
│   ├── ecology-and-bestiary.md          # 魔兽解剖手记：12类极端视听魔兽生境、习性弱点与剥离材料市价
│   ├── daily-life-and-economy.md        # 市井风土手册：五大阶层饮食谱系、货币咬铅剪边、物价白皮书与民俗禁忌
│   ├── legends-and-relics.md            # 传奇与圣器账簿：十二席当代活传奇深度档案、六道失落器物代价谱系
│   ├── martial-and-classes.md           # 战术武道与精通：2024八大武器精通视听动作线、十二道统流派与衍生种族
│   ├── arcane-schools-and-reagents.md   # 奥术与构材法理：八大学派微观物理、V/S/M白皮书与施法生理枯竭机制
│   ├── srd-bestiary-and-planes.md       # 经典魔怪与深渊：夺心魔/眼魔异怪深渊化、魔鬼vs恶魔血战、真龙谱系
│   ├── gm-dossier.md                    # 卷六：【GM内档】封锁清单、劫级暗线与十二席名录（绝对保密）
│   └── world-setting.md                 # 完整设定集母本（保留全量索引，100%保真）
├── templates/                            # 规范化模版与 Schema
│   ├── character-state-template.json    # Truth Files 强类型 JSON 状态机 Schema
│   └── markdown-save-template.md        # 人类友好的双轨 Markdown 存档与状态投影
├── scripts/                              # 自动化工程工具链
│   ├── validate-state.js                # 状态合规性与因果守恒校验器
│   └── de-ai-scan.js                    # 3-Pass 去AI味与骨力句长方差扫描器
├── test/                                 # 工业级自动化门禁测试
│   └── run-tests.js                     # 完整性与规则测试套件（交付硬门禁 Exit Code 0）
└── README.md                             # 技能说明文档
```

---

## 核心设计要点与管线融合

### 1. 文学创作管线底层驱动 (Creative Writing Pipeline)
GM 在每一轮叙事中，绝不调用大模型泛化、均质的默认语调，而是强制执行 4 阶叙事流水线：
- **阶段 1：状态与信息边界编译**（仅描写角色视野能察觉的物理细节，拒绝上帝视角泄露）；
- **阶段 2：戏剧节拍与因果松绑**（打破单向整洁的模板因果，引入真实世界的阻力与偶发杂音）；
- **阶段 3：场景视听化与冷钢骨力正文**（100% 视听化动作线 Show, Don't Tell；强动词前置；感官通感下潜；消灭“进行了/展现了”等公文寄生动词；意象溯源检验消灭中式成语）；
- **阶段 4：3-Pass 去AI味终审门禁**（删除段末鸡汤升华；拉开句子长度方差（极差 > 15 字）；20+ 高频 AI 禁用词 0 容忍）。

### 2. Truth Files 双轨状态持久化 (State Engine)
- **JSON 权威状态源**：通过 `character-state-template.json` 强类型定义角色的生理伤势、货币、装备磨损、NPC好感度与伏笔生命周期（`open` / `progressing` / `deferred` / `resolved`）。
- **Markdown 友好投影**：通过 `/状态` 或 `/存档` 向玩家呈现结构清晰的面板。
- **状态守恒律**：伤势不愈合不消失，物品不捡拾不出现，彻底杜绝长剧情下的状态漂移。

### 3. 世界惯性与明码标价
- **不代替玩家**：玩家输入是意图声明而非完成声明，GM 展开物理过程与世界反应，决定权永远在玩家手中。
- **世界有惯性**：身份阻力、未结余波延后追讨；NPC 有日程，大事件不因玩家缺席而暂停。
- **明码标价**：魔法、神恩、政治与机缘全部带有代价；【GM 内档】按解锁途径逐步揭示。

---

## 使用方法

将整个目录作为 Skill 安装到支持 Agent Skills 规范的平台（如 Antigravity, Claude, Qoder 等），或直接作为上下文载入。

开局唤醒词示例：
> “开一局” / “来玩文字RPG” / “运行剑火纪元”

GM 将自动读取设定集并输出**《剑火纪元》建局表单**（包含时代、种族、身份、经历细化与世界参数等）。

### 常用元指令

| 指令 | 响应机制与功能 |
|---|---|
| `/状态` | 基于 Truth Files 导出当前角色属性、伤势部位、财富与已知线索 |
| `/回忆` | 梳理近期未结事务与活跃伏笔追踪看板 |
| `/跳过` | 快速跨过过渡期，保留时间标记与一项演化结果 |
| `/展开` | 对当前物理场景进行更深度的冷钢感官刻画 |
| `/重述` | 换一种叙述视角重写当前片段，不改变既成事实 |
| `/暂停` | 暂停世界推演，局外研讨规则与设定 |
| `/存档` | 输出符合规范的完整状态快照 |
| `/续局` | 载入快照并恢复内部状态机 |
| `/月报` | 依据演化八线输出最新的世界宏观动态与情报来源 |

---

## 终端自动化工具与门禁测试

本项目配备工业级跨平台 Node.js 脚本工具链，可通过 PowerShell 7 或原生 CMD 执行：

```bash
# 1. 运行全局自动化门禁测试（Exit Code 0 交付门禁）
node test/run-tests.js

# 2. 校验指定状态 JSON 文件或 Schema 模板
node scripts/validate-state.js --template
node scripts/validate-state.js path/to/save.json

# 3. 对任意叙事文本执行 3-Pass 去AI味与句长方差扫描
node scripts/de-ai-scan.js --test
node scripts/de-ai-scan.js "待扫描的叙事段落内容..."
```
