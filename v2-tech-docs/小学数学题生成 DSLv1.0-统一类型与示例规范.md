# 小学数学题生成 DSL v1.0

## 1. 设计目标

Math DSL 用于统一描述：

- 小学 1~6 年级应用题
- 小学奥数题
- 基础计算题
- 几何题
- 逻辑题
- 题目生成参数
- 数学约束
- 自动求解
- 难度
- 题目文本模板

核心原则：

```text
DSL 描述数学问题
        ↓
Generator 生成参数
        ↓
Constraint 验证
        ↓
Solver 求解
        ↓
Renderer 生成自然语言
```

**DSL 不负责保存具体某一道题，而是负责描述“如何生成这一类题”。**

---

# 2. 顶层结构

统一 ProblemTemplate：

```typescript
interface ProblemTemplate {
  id: string;
  version: string;

  metadata: ProblemMetadata;

  variables: Record<string, Variable>;

  expressions?: Record<string, Expression>;

  constraints?: Constraint[];

  answer: AnswerDefinition;

  solution?: SolutionDefinition;

  generator?: GeneratorDefinition;

  renderer: RendererDefinition;

  difficulty?: DifficultyDefinition;

  tags?: string[];
}
```

对应 JSON：

```json
{
  "id": "G3_PRICE_001",
  "version": "1.0",

  "metadata": {},

  "variables": {},

  "expressions": {},

  "constraints": [],

  "answer": {},

  "solution": {},

  "generator": {},

  "renderer": {},

  "difficulty": {},

  "tags": []
}
```

---

# 3. Metadata

```typescript
interface ProblemMetadata {
  name: string;

  type:
    | "arithmetic"
    | "word_problem"
    | "olympiad"
    | "geometry"
    | "logic";

  grade: 1 | 2 | 3 | 4 | 5 | 6;

  semester?: 1 | 2;

  topic: string;

  knowledgePoints: string[];

  language?: "zh-CN";

  source?: string;
}
```

示例：

```json
{
  "name": "单价数量总价",
  "type": "word_problem",
  "grade": 3,
  "semester": 1,
  "topic": "price",
  "knowledgePoints": [
    "multiplication",
    "price"
  ],
  "language": "zh-CN"
}
```

---

# 4. Problem Type

统一使用：

```text
arithmetic      基础计算题
word_problem    应用题
olympiad        奥数题
geometry        几何题
logic           逻辑题
```

不要出现：

```text
math_word
application
application_problem
word
olympiad_problem
```

多个名称描述同一类型。

---

# 5. Variable 类型

统一变量：

```typescript
type Variable =
  | IntegerVariable
  | DecimalVariable
  | FractionVariable
  | StringVariable
  | EnumVariable
  | DerivedVariable;
```

---

## 5.1 Integer

整数。

```json
{
  "type": "integer",
  "min": 1,
  "max": 100
}
```

例如：

```json
{
  "quantity": {
    "type": "integer",
    "min": 2,
    "max": 10
  }
}
```

---

## 5.2 Decimal

```json
{
  "type": "decimal",
  "min": 0.1,
  "max": 100,
  "scale": 1
}
```

`scale` 表示小数位数。

---

## 5.3 Fraction

```json
{
  "type": "fraction",
  "numerator": {
    "min": 1,
    "max": 9
  },
  "denominator": {
    "min": 2,
    "max": 10
  },
  "simplified": true
}
```

---

## 5.4 String

用于人物、物品、场景等。

```json
{
  "name": {
    "type": "string",
    "values": [
      "小明",
      "小红",
      "小华"
    ]
  }
}
```

---

## 5.5 Enum

推荐用于固定类别。

```json
{
  "item": {
    "type": "enum",
    "values": [
      "苹果",
      "铅笔",
      "故事书",
      "橡皮"
    ]
  }
}
```

---

## 5.6 Derived

派生变量。

```json
{
  "total": {
    "type": "derived",
    "expression": {
      "op": "multiply",
      "args": [
        "unitPrice",
        "quantity"
      ]
    }
  }
}
```

---

# 6. Expression

所有数学计算统一使用 Expression AST。

```typescript
interface Expression {
  op: Operator;
  args: ExpressionValue[];
}

type ExpressionValue =
  | string
  | number
  | Expression;
```

---

# 7. Operator

第一版统一支持：

```text
add
subtract
multiply
divide
mod

power

abs
min
max

gcd
lcm

floor
ceil
round

sqrt

negate
```

---

## 7.1 加法

```json
{
  "op": "add",
  "args": [
    "a",
    "b"
  ]
}
```

等价：

```text
a + b
```

---

## 7.2 减法

```json
{
  "op": "subtract",
  "args": [
    "a",
    "b"
  ]
}
```

---

## 7.3 乘法

```json
{
  "op": "multiply",
  "args": [
    "a",
    "b"
  ]
}
```

---

## 7.4 除法

```json
{
  "op": "divide",
  "args": [
    "a",
    "b"
  ]
}
```

---

## 7.5 余数

```json
{
  "op": "mod",
  "args": [
    "a",
    "b"
  ]
}
```

---

## 7.6 最大公约数

```json
{
  "op": "gcd",
  "args": [
    "a",
    "b"
  ]
}
```

---

## 7.7 最小公倍数

```json
{
  "op": "lcm",
  "args": [
    "a",
    "b"
  ]
}
```

---

# 8. Expression 引用规则

字符串：

```json
"a"
```

表示变量引用。

数字：

```json
10
```

表示常量。

嵌套：

```json
{
  "op": "multiply",
  "args": [
    {
      "op": "add",
      "args": [
        "a",
        "b"
      ]
    },
    "c"
  ]
}
```

等价：

```text
(a + b) × c
```

---

# 9. Constraints

统一约束类型：

```typescript
type Constraint =
  | ComparisonConstraint
  | DivisibleConstraint
  | IntegerConstraint
  | RangeConstraint
  | UniqueConstraint
  | PositiveConstraint;
```

---

# 10. 比较约束

支持：

```text
eq
neq
gt
gte
lt
lte
```

示例：

```json
{
  "type": "comparison",
  "op": "gt",
  "left": "a",
  "right": "b"
}
```

表示：

```text
a > b
```

---

# 11. 等于

```json
{
  "type": "comparison",
  "op": "eq",
  "left": "total",
  "right": {
    "op": "multiply",
    "args": [
      "price",
      "quantity"
    ]
  }
}
```

表示：

```text
total = price × quantity
```

---

# 12. 整除约束

```json
{
  "type": "divisible",
  "dividend": "total",
  "divisor": "people"
}
```

表示：

```text
total % people = 0
```

---

# 13. 正数约束

```json
{
  "type": "positive",
  "variable": "answer"
}
```

---

# 14. 整数约束

```json
{
  "type": "integer",
  "expression": "answer"
}
```

---

# 15. Range

```json
{
  "type": "range",
  "expression": "answer",
  "min": 1,
  "max": 100
}
```

---

# 16. Unique

用于确保多个变量不同。

```json
{
  "type": "unique",
  "variables": [
    "a",
    "b",
    "c"
  ]
}
```

表示：

```text
a != b
b != c
a != c
```

---

# 17. Generator

Generator 描述变量如何产生。

```typescript
interface GeneratorDefinition {
  strategy:
    | "random"
    | "reverse"
    | "enumeration"
    | "constraint";

  maxAttempts?: number;

  seed?: number;
}
```

---

# 18. Random Generator

```json
{
  "generator": {
    "strategy": "random",
    "maxAttempts": 100
  }
}
```

默认：

```text
生成变量
 ↓
计算派生变量
 ↓
检查 Constraints
 ↓
失败重新生成
```

---

# 19. Reverse Generator

奥数题重点使用：

```json
{
  "generator": {
    "strategy": "reverse"
  }
}
```

例如：

```text
先生成答案
 ↓
反推题目参数
 ↓
构造约束
```

---

# 20. Answer

统一：

```typescript
interface AnswerDefinition {
  expression: ExpressionValue;

  type:
    | "integer"
    | "decimal"
    | "fraction"
    | "text"
    | "multiple";

  unit?: string;
}
```

示例：

```json
{
  "answer": {
    "type": "integer",
    "expression": "total",
    "unit": "元"
  }
}
```

---

# 21. 多答案

奥数题可能需要多个答案：

```json
{
  "answer": {
    "type": "multiple",
    "expression": [
      "chickens",
      "rabbits"
    ]
  }
}
```

输出：

```text
鸡：23只
兔：12只
```

---

# 22. Solution

统一定义解题步骤：

```typescript
interface SolutionDefinition {
  steps: SolutionStep[];
}
```

```typescript
interface SolutionStep {
  id: string;
  expression: Expression;
  description: string;
}
```

示例：

```json
{
  "solution": {
    "steps": [
      {
        "id": "step1",
        "expression": {
          "op": "multiply",
          "args": [
            "unitPrice",
            "quantity"
          ]
        },
        "description": "根据单价和数量计算总价"
      }
    ]
  }
}
```

---

# 23. Renderer

Renderer 负责把数学结构变成题目。

```typescript
interface RendererDefinition {
  question: string;
  answer?: string;
  solution?: string;
}
```

模板：

```json
{
  "renderer": {
    "question": "一本{{item}}{{unitPrice}}元，小明买了{{quantity}}本，一共需要多少钱？",
    "answer": "{{total}}元",
    "solution": "{{unitPrice}} × {{quantity}} = {{total}}"
  }
}
```

---

# 24. 完整应用题 DSL 示例

## 三年级：单价 × 数量

```json
{
  "id": "G3_PRICE_001",
  "version": "1.0",

  "metadata": {
    "name": "单价数量总价",
    "type": "word_problem",
    "grade": 3,
    "semester": 1,
    "topic": "price",
    "knowledgePoints": [
      "multiplication",
      "price"
    ],
    "language": "zh-CN"
  },

  "variables": {
    "item": {
      "type": "enum",
      "values": [
        "故事书",
        "练习本",
        "铅笔盒"
      ]
    },

    "unitPrice": {
      "type": "integer",
      "min": 2,
      "max": 20
    },

    "quantity": {
      "type": "integer",
      "min": 2,
      "max": 10
    },

    "total": {
      "type": "derived",
      "expression": {
        "op": "multiply",
        "args": [
          "unitPrice",
          "quantity"
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "range",
      "expression": "total",
      "min": 1,
      "max": 200
    }
  ],

  "answer": {
    "type": "integer",
    "expression": "total",
    "unit": "元"
  },

  "solution": {
    "steps": [
      {
        "id": "step1",
        "expression": {
          "op": "multiply",
          "args": [
            "unitPrice",
            "quantity"
          ]
        },
        "description": "单价乘数量得到总价"
      }
    ]
  },

  "generator": {
    "strategy": "random",
    "maxAttempts": 100
  },

  "renderer": {
    "question": "一本{{item}}{{unitPrice}}元，小明买了{{quantity}}本，一共需要多少钱？",
    "answer": "{{total}}元",
    "solution": "{{unitPrice}} × {{quantity}} = {{total}}"
  },

  "difficulty": {
    "level": 2
  },

  "tags": [
    "小学三年级",
    "乘法",
    "价格"
  ]
}
```

---

# 25. 两步应用题

例如：

```text
小明有25本书，又买了18本，送给同学7本，还剩多少本？
```

DSL：

```json
{
  "id": "G3_MIX_001",

  "metadata": {
    "name": "连续加减",
    "type": "word_problem",
    "grade": 3,
    "topic": "mixed_operation",
    "knowledgePoints": [
      "addition",
      "subtraction"
    ]
  },

  "variables": {
    "initial": {
      "type": "integer",
      "min": 20,
      "max": 60
    },

    "increase": {
      "type": "integer",
      "min": 5,
      "max": 30
    },

    "decrease": {
      "type": "integer",
      "min": 1,
      "max": 20
    },

    "remaining": {
      "type": "derived",
      "expression": {
        "op": "subtract",
        "args": [
          {
            "op": "add",
            "args": [
              "initial",
              "increase"
            ]
          },
          "decrease"
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "comparison",
      "op": "lt",
      "left": "decrease",
      "right": {
        "op": "add",
        "args": [
          "initial",
          "increase"
        ]
      }
    }
  ],

  "answer": {
    "type": "integer",
    "expression": "remaining",
    "unit": "本"
  },

  "renderer": {
    "question": "小明原来有{{initial}}本书，又买了{{increase}}本，送给同学{{decrease}}本，还剩多少本？"
  }
}
```

---

# 26. 平均数

数学结构：

```text
average = total / count
```

DSL：

```json
{
  "variables": {
    "count": {
      "type": "integer",
      "min": 3,
      "max": 8
    },

    "average": {
      "type": "integer",
      "min": 5,
      "max": 30
    },

    "total": {
      "type": "derived",
      "expression": {
        "op": "multiply",
        "args": [
          "count",
          "average"
        ]
      }
    }
  },

  "answer": {
    "type": "integer",
    "expression": "average"
  },

  "renderer": {
    "question": "有{{count}}个小朋友，他们的平均得分是{{average}}分，他们一共得了多少分？"
  }
}
```

---

# 27. 除法应用题

必须保证整除：

```json
{
  "variables": {
    "people": {
      "type": "integer",
      "min": 2,
      "max": 8
    },

    "each": {
      "type": "integer",
      "min": 2,
      "max": 20
    },

    "total": {
      "type": "derived",
      "expression": {
        "op": "multiply",
        "args": [
          "people",
          "each"
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "divisible",
      "dividend": "total",
      "divisor": "people"
    }
  ]
}
```

---

# 28. 鸡兔同笼 DSL

这是奥数 DSL 的标准示例。

```json
{
  "id": "O23_CHICKEN_RABBIT_001",
  "version": "1.0",

  "metadata": {
    "name": "鸡兔同笼",
    "type": "olympiad",
    "grade": 4,
    "topic": "chicken_rabbit",
    "knowledgePoints": [
      "equation",
      "enumeration"
    ]
  },

  "variables": {
    "chickens": {
      "type": "integer",
      "min": 1,
      "max": 40
    },

    "rabbits": {
      "type": "integer",
      "min": 1,
      "max": 30
    },

    "heads": {
      "type": "derived",
      "expression": {
        "op": "add",
        "args": [
          "chickens",
          "rabbits"
        ]
      }
    },

    "legs": {
      "type": "derived",
      "expression": {
        "op": "add",
        "args": [
          {
            "op": "multiply",
            "args": [
              2,
              "chickens"
            ]
          },
          {
            "op": "multiply",
            "args": [
              4,
              "rabbits"
            ]
          }
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "range",
      "expression": "heads",
      "min": 5,
      "max": 50
    },

    {
      "type": "range",
      "expression": "legs",
      "min": 10,
      "max": 150
    }
  ],

  "answer": {
    "type": "multiple",
    "expression": [
      "chickens",
      "rabbits"
    ]
  },

  "generator": {
    "strategy": "random"
  },

  "renderer": {
    "question": "笼子里有鸡和兔共{{heads}}个，一共有{{legs}}只脚。问鸡和兔各有多少只？"
  },

  "difficulty": {
    "level": 3,
    "depth": 2,
    "operations": 2
  }
}
```

---

# 29. 和差倍问题

数学结构：

```text
a + b = total
a - b = diff
```

DSL 可以直接表达：

```json
{
  "variables": {
    "a": {
      "type": "integer",
      "min": 10,
      "max": 100
    },

    "b": {
      "type": "integer",
      "min": 1,
      "max": 80
    },

    "total": {
      "type": "derived",
      "expression": {
        "op": "add",
        "args": [
          "a",
          "b"
        ]
      }
    },

    "diff": {
      "type": "derived",
      "expression": {
        "op": "subtract",
        "args": [
          "a",
          "b"
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "comparison",
      "op": "gt",
      "left": "a",
      "right": "b"
    }
  ]
}
```

---

# 30. 余数问题

```json
{
  "variables": {
    "dividend": {
      "type": "integer",
      "min": 20,
      "max": 100
    },

    "divisor": {
      "type": "integer",
      "min": 3,
      "max": 10
    },

    "remainder": {
      "type": "derived",
      "expression": {
        "op": "mod",
        "args": [
          "dividend",
          "divisor"
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "comparison",
      "op": "gt",
      "left": "remainder",
      "right": 0
    },

    {
      "type": "comparison",
      "op": "lt",
      "left": "remainder",
      "right": "divisor"
    }
  ]
}
```

---

# 31. GCD / LCM 奥数题

最大公约数：

```json
{
  "variables": {
    "a": {
      "type": "integer",
      "min": 10,
      "max": 100
    },

    "b": {
      "type": "integer",
      "min": 10,
      "max": 100
    },

    "g": {
      "type": "derived",
      "expression": {
        "op": "gcd",
        "args": [
          "a",
          "b"
        ]
      }
    }
  },

  "answer": {
    "type": "integer",
    "expression": "g"
  }
}
```

---

# 32. 几何 DSL

几何题需要额外增加 Geometry 类型。

```typescript
interface GeometryObject {
  type:
    | "point"
    | "line"
    | "segment"
    | "triangle"
    | "rectangle"
    | "square"
    | "circle";
}
```

例如长方形：

```json
{
  "geometry": {
    "type": "rectangle",

    "width": "width",

    "height": "height"
  }
}
```

面积：

```json
{
  "op": "multiply",
  "args": [
    "width",
    "height"
  ]
}
```

周长：

```json
{
  "op": "multiply",
  "args": [
    2,
    {
      "op": "add",
      "args": [
        "width",
        "height"
      ]
    }
  ]
}
```

---

# 33. Logic DSL

逻辑题增加：

```text
person
position
relation
condition
```

例如排队：

```json
{
  "variables": {
    "people": {
      "type": "integer",
      "min": 5,
      "max": 20
    },

    "positionA": {
      "type": "integer",
      "min": 1,
      "max": 20
    },

    "positionB": {
      "type": "integer",
      "min": 1,
      "max": 20
    }
  },

  "constraints": [
    {
      "type": "comparison",
      "op": "neq",
      "left": "positionA",
      "right": "positionB"
    }
  ]
}
```

---

# 34. Difficulty DSL

统一：

```typescript
interface DifficultyDefinition {
  level: 1 | 2 | 3 | 4 | 5;

  depth?: number;

  operations?: number;

  variables?: number;

  knowledgePoints?: number;

  readingLevel?: number;

  reasoning?: number;
}
```

示例：

```json
{
  "difficulty": {
    "level": 4,
    "depth": 4,
    "operations": 5,
    "variables": 3,
    "knowledgePoints": 2,
    "reasoning": 4
  }
}
```

---

# 35. 难度计算

最终 Difficulty 不应该完全由 DSL 固定。

可以计算：

```text
Difficulty Score =
  operationScore
+ variableScore
+ depthScore
+ knowledgeScore
+ reasoningScore
+ numberScore
+ readingScore
```

最终映射：

```text
0 ~ 20   → Level 1
21 ~ 40  → Level 2
41 ~ 60  → Level 3
61 ~ 80  → Level 4
81 ~ 100 → Level 5
```

DSL 中的 `level` 可以作为目标值，而实际难度由 Engine 计算。

---

# 36. Seed

统一：

```typescript
interface GenerateOptions {
  seed?: number;

  count?: number;

  difficulty?: number;

  allowDuplicate?: boolean;
}
```

例如：

```typescript
generate({
  seed: 20260915,
  count: 20,
  difficulty: 3,
  allowDuplicate: false
});
```

---

# 37. Question 输出结构

Template 和 Question 必须分离。

### Template

```text
描述如何生成题
```

### Question

```text
描述已经生成的题
```

统一：

```typescript
interface Question {
  id: string;

  templateId: string;

  seed: number;

  metadata: ProblemMetadata;

  variables: Record<string, unknown>;

  question: string;

  answer: Answer;

  solution?: Solution;

  difficulty: DifficultyResult;

  hash: string;
}
```

---

# 38. 生成流程

```text
Template
   ↓
Seed
   ↓
Generate Variables
   ↓
Calculate Derived Variables
   ↓
Constraint Validation
   ↓
Solver
   ↓
Difficulty Evaluation
   ↓
Duplicate Detection
   ↓
Text Renderer
   ↓
Semantic Validation
   ↓
Question
```

---

# 39. Validator

必须至少包含：

```text
MathValidator
ConstraintValidator
AnswerValidator
DifficultyValidator
UniquenessValidator
SemanticValidator
```

---

## MathValidator

验证：

```text
表达式是否合法
除数是否为 0
结果是否正确
```

---

## ConstraintValidator

验证：

```text
a > b
a % b = 0
answer > 0
```

---

## AnswerValidator

重新计算答案：

```text
Generator Answer
      ↓
Independent Solver
      ↓
Compare
```

两个结果不一致：

```text
Reject
```

---

# 40. 题目状态

题目生命周期：

```typescript
type QuestionStatus =
  | "generated"
  | "validated"
  | "published"
  | "rejected"
  | "deprecated";
```

推荐：

```text
generated
    ↓
validated
    ↓
published
```

任何验证失败：

```text
generated
    ↓
rejected
```

---

# 41. Template ID 规范

统一：

```text
{GRADE}_{CATEGORY}_{SEQUENCE}
```

应用题：

```text
G3_PRICE_001
G4_SPEED_001
G5_RATIO_001
```

奥数：

```text
O23_CHICKEN_RABBIT_001
O08_REMAINDER_001
O43_AREA_001
```

基础计算：

```text
A1_ADD_001
A2_DIV_001
```

几何：

```text
G4_GEOMETRY_AREA_001
```

---

# 42. Knowledge Point ID

建议也标准化。

```text
arithmetic.add
arithmetic.subtract
arithmetic.multiply
arithmetic.divide

word.price
word.average
word.speed
word.work
word.ratio
word.percent

olympiad.number
olympiad.remainder
olympiad.counting
olympiad.logic
olympiad.geometry
```

这样后续可以：

```text
按知识点生成
按知识点统计
按知识点错题
按知识点推荐
```

---

# 43. DSL v1.0 最小规范

第一版真正需要实现的只有：

```text
Metadata
Variable
Expression
Constraint
Generator
Answer
Solution
Renderer
Difficulty
```

即：

```text
ProblemTemplate
├── metadata
├── variables
├── expressions
├── constraints
├── generator
├── answer
├── solution
├── renderer
└── difficulty
```

---

# 44. TypeScript 核心接口

最终建议统一成：

```typescript
export interface ProblemTemplate {
  id: string;
  version: string;

  metadata: ProblemMetadata;

  variables: Record<string, Variable>;

  expressions?: Record<string, Expression>;

  constraints?: Constraint[];

  generator: GeneratorDefinition;

  answer: AnswerDefinition;

  solution?: SolutionDefinition;

  renderer: RendererDefinition;

  difficulty?: DifficultyDefinition;

  tags?: string[];
}
```

然后所有题型都实现这个接口：

```text
小学应用题
       ↓
ProblemTemplate

奥数题
       ↓
ProblemTemplate

几何题
       ↓
ProblemTemplate

逻辑题
       ↓
ProblemTemplate
```

**Generator、Solver、Validator、Renderer 全部复用。**

---

# 45. v1.0 与 v2.0 边界

## v1.0

支持：

```text
整数
小数
分数
基础四则运算
GCD / LCM
比较约束
整除约束
范围约束
随机生成
逆向生成
答案计算
解题步骤
文本模板
难度
去重
```

足以覆盖：

> 绝大多数小学 1~6 年级应用题 + 第一批奥数题。

## v2.0

再加入：

```text
Geometry DSL
Logic DSL
Proof Tree
Equation Solver
Symbolic Solver
Tree Search
LLM Renderer
Semantic Validator
Embedding Dedup
```

用于复杂奥数题。

---

# 46. 最终原则

整个 DSL 最重要的设计原则：

```text
一个数学模型
        ↓
可以有多个 Template
        ↓
一个 Template
        ↓
可以生成无限 Question
```

例如：

```text
数学模型：

total = unitPrice × quantity
```

可以生成：

```text
苹果
书
铅笔
玩具
门票
水果
文具
```

再通过：

```text
不同数字
+
不同人物
+
不同场景
+
不同问法
+
不同语言表达
```

形成大量不同题目。

最终整个系统形成：

```text
                    Math DSL
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       应用题        奥数题        几何题
          │            │            │
          └────────────┼────────────┘
                       ↓
                   Generator
                       ↓
                  Constraint
                       ↓
                    Solver
                       ↓
                 Difficulty
                       ↓
                  Validator
                       ↓
                 Dedup / Hash
                       ↓
                  Renderer
                       ↓
                Question Bank
```

**核心结论：DSL 是整个项目的“数学中间表示（Math IR）”。**

以后无论是随机生成、逆向生成、LLM 生成、奥数生成，最终都应该落到同一个 `ProblemTemplate → Question` 模型上。这样才能保证整个系统长期可维护、可扩展。