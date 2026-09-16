# Math DSL v1.1：变量依赖与求值规则

## 1. 设计目标

变量系统统一解决以下问题：

1. 随机变量
2. 派生变量
3. 多级依赖
4. 表达式依赖
5. 条件依赖
6. 约束依赖
7. 循环依赖检测
8. 求值顺序
9. 逆向生成
10. 求值结果缓存
11. 类型检查
12. 空值与非法值处理

核心原则：

> **变量定义描述“值是什么”，依赖关系由 Expression 自动推导，Engine 根据 DAG 决定求值顺序。**

---

# 2. Variable 三种核心类型

第一版建议不要继续无限扩展 Variable 类型。

统一为：

```typescript
type Variable =
  | RandomVariable
  | DerivedVariable
  | ConstantVariable;
```

即：

```text
Random      随机变量
Derived     派生变量
Constant    常量
```

---

# 3. RandomVariable

随机变量是 Generator 的主要输入。

```typescript
interface RandomVariable {
  type: "random";

  valueType:
    | "integer"
    | "decimal"
    | "fraction"
    | "string"
    | "enum";

  generator: VariableGenerator;

  constraints?: Constraint[];
}
```

示例：

```json
{
  "unitPrice": {
    "type": "random",
    "valueType": "integer",

    "generator": {
      "strategy": "range",
      "min": 2,
      "max": 20
    }
  }
}
```

---

# 4. ConstantVariable

固定值。

```typescript
interface ConstantVariable {
  type: "constant";

  valueType:
    | "integer"
    | "decimal"
    | "string"
    | "boolean";

  value: unknown;
}
```

例如：

```json
{
  "legsOfChicken": {
    "type": "constant",
    "valueType": "integer",
    "value": 2
  },

  "legsOfRabbit": {
    "type": "constant",
    "valueType": "integer",
    "value": 4
  }
}
```

---

# 5. DerivedVariable

派生变量必须通过 Expression 计算。

```typescript
interface DerivedVariable {
  type: "derived";

  valueType:
    | "integer"
    | "decimal"
    | "fraction"
    | "boolean";

  expression: Expression;

  constraints?: Constraint[];
}
```

例如：

```json
{
  "total": {
    "type": "derived",
    "valueType": "integer",

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

Expression 是整个 DSL 的核心。

```typescript
type Expression =
  | LiteralExpression
  | VariableExpression
  | OperationExpression
  | ConditionalExpression;
```

---

# 7. LiteralExpression

常量直接写：

```json
10
```

或者：

```json
{
  "type": "literal",
  "value": 10
}
```

推荐 JSON DSL 中使用后者，因为类型更加明确。

---

# 8. VariableExpression

变量引用：

```json
{
  "type": "variable",
  "name": "unitPrice"
}
```

因此不再推荐：

```json
"unitPrice"
```

作为唯一变量引用形式。

原因是：

```text
字符串到底是：
变量？
字符串常量？
枚举值？
模板文本？
```

容易产生歧义。

---

# 9. OperationExpression

统一：

```typescript
interface OperationExpression {
  type: "operation";

  op: Operator;

  args: Expression[];
}
```

例如：

```json
{
  "type": "operation",

  "op": "multiply",

  "args": [
    {
      "type": "variable",
      "name": "unitPrice"
    },

    {
      "type": "variable",
      "name": "quantity"
    }
  ]
}
```

---

# 10. Operator

小学数学第一版：

```typescript
type Operator =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "mod"
  | "power"

  | "abs"
  | "min"
  | "max"

  | "gcd"
  | "lcm"

  | "floor"
  | "ceil"
  | "round"

  | "negate";
```

---

# 11. ConditionalExpression

支持条件表达式：

```typescript
interface ConditionalExpression {
  type: "if";

  condition: ConditionExpression;

  then: Expression;

  else: Expression;
}
```

例如：

```json
{
  "type": "if",

  "condition": {
    "op": "gt",

    "left": {
      "type": "variable",
      "name": "age"
    },

    "right": 10
  },

  "then": {
    "type": "variable",
    "name": "priceA"
  },

  "else": {
    "type": "variable",
    "name": "priceB"
  }
}
```

---

# 12. Variable Dependency

任何 Expression 都会产生变量依赖。

例如：

```text
total = unitPrice × quantity
```

自动得到：

```text
total
 ├── unitPrice
 └── quantity
```

如果：

```text
unitPrice
quantity
```

都是 RandomVariable，那么：

```text
unitPrice ─────┐
               ↓
            total
               ↑
quantity ──────┘
```

---

# 13. 多级依赖

例如：

```text
unitPrice
quantity

subtotal = unitPrice × quantity

discount = subtotal × discountRate

finalPrice = subtotal - discount
```

依赖关系：

```text
unitPrice ───┐
             ↓
quantity ───→ subtotal ───→ discount
                              ↓
discountRate ────────────────┘
                              ↓
subtotal ─────────────────→ finalPrice
```

Engine 自动生成：

```text
unitPrice
quantity
discountRate
    ↓
subtotal
    ↓
discount
    ↓
finalPrice
```

---

# 14. Dependency Graph

内部统一构建：

```typescript
interface DependencyGraph {
  nodes: DependencyNode[];

  edges: DependencyEdge[];
}
```

```typescript
interface DependencyNode {
  variable: string;

  dependencies: string[];

  dependents: string[];
}
```

---

# 15. 示例

DSL：

```json
{
  "variables": {
    "a": {
      "type": "random",
      "valueType": "integer",
      "generator": {
        "strategy": "range",
        "min": 1,
        "max": 10
      }
    },

    "b": {
      "type": "random",
      "valueType": "integer",
      "generator": {
        "strategy": "range",
        "min": 1,
        "max": 10
      }
    },

    "c": {
      "type": "derived",
      "valueType": "integer",
      "expression": {
        "type": "operation",
        "op": "add",
        "args": [
          {
            "type": "variable",
            "name": "a"
          },
          {
            "type": "variable",
            "name": "b"
          }
        ]
      }
    }
  }
}
```

依赖图：

```text
a ─────┐
       ↓
       c
       ↑
b ─────┘
```

---

# 16. 求值顺序

所有变量必须按照拓扑排序求值。

算法：

```text
1. Parse DSL
2. Extract dependencies
3. Build dependency graph
4. Detect cycle
5. Topological sort
6. Generate random variables
7. Evaluate derived variables
8. Evaluate constraints
9. Evaluate answer
10. Render question
```

---

# 17. Topological Order

例如：

```text
a
b
c = a + b
d = c × 2
e = d - a
```

拓扑排序：

```text
a
b
↓
c
↓
d
↓
e
```

实际执行：

```typescript
context.a = generate(a);

context.b = generate(b);

context.c = evaluate(c, context);

context.d = evaluate(d, context);

context.e = evaluate(e, context);
```

---

# 18. 多个无依赖变量可以并行

例如：

```text
a
b
c
```

三者完全独立：

```text
a ─────┐
b ─────┼──→ d
c ─────┘
```

那么：

```text
a
b
c
```

可以并行生成。

因此 Engine 可以按照 DAG 的 level 执行：

```text
Level 0:
a
b
c

Level 1:
d

Level 2:
e
```

---

# 19. Cycle Detection

禁止：

```text
a = b + 1
b = a + 1
```

依赖图：

```text
a → b
↑   ↓
└───┘
```

Engine 必须报错：

```typescript
class CircularDependencyError extends Error {
  path: string[];
}
```

例如：

```text
Circular dependency detected:

a → b → a
```

---

# 20. 更复杂的循环

例如：

```text
a = b + c
b = d × 2
c = a - 1
```

检测：

```text
a → c → a
```

即使存在其它正常依赖，也必须整个 Template Reject。

---

# 21. 自依赖

禁止：

```json
{
  "a": {
    "type": "derived",
    "expression": {
      "type": "operation",
      "op": "add",
      "args": [
        {
          "type": "variable",
          "name": "a"
        },
        1
      ]
    }
  }
}
```

报错：

```text
Self dependency:

a → a
```

---

# 22. Undefined Variable

如果：

```text
total = price × quantity
```

但没有定义：

```text
quantity
```

必须在 Compile Phase 报错，而不是运行时随机失败。

```text
UndefinedVariableError:

Variable "quantity" referenced by "total"
but not defined.
```

---

# 23. 类型检查

变量依赖不仅需要检查存在性，还必须检查类型。

例如：

```text
integer × integer
```

合法：

```text
integer
```

但是：

```text
string × integer
```

非法。

---

# 24. 类型规则

基础运算：

| 运算 | 输入 | 输出 |
|---|---|---|
| add | number + number | number |
| subtract | number - number | number |
| multiply | number × number | number |
| divide | number / number | number |
| mod | integer % integer | integer |
| gcd | integer, integer | integer |
| lcm | integer, integer | integer |
| abs | number | number |
| min | number... | number |
| max | number... | number |

---

# 25. Division 特殊规则

除法必须检查：

```text
divisor != 0
```

如果目标是整数除法：

```json
{
  "op": "divide",
  "mode": "exact",
  "args": [
    "a",
    "b"
  ]
}
```

要求：

```text
a % b = 0
```

如果允许小数：

```json
{
  "op": "divide",
  "mode": "decimal",
  "scale": 2,
  "args": [
    "a",
    "b"
  ]
}
```

---

# 26. 推荐增加 Number Mode

数学题生成非常需要区分：

```typescript
type NumberMode =
  | "integer"
  | "decimal"
  | "fraction"
  | "rational";
```

例如：

```json
{
  "op": "divide",
  "mode": "exact"
}
```

表示必须得到整数。

---

# 27. 求值 Context

所有求值必须基于统一 Context。

```typescript
interface EvaluationContext {
  values: Record<string, unknown>;

  seed: number;

  variables: Record<string, Variable>;

  cache: Map<string, unknown>;
}
```

例如：

```typescript
context.values = {
  unitPrice: 8,
  quantity: 5,
  total: 40
};
```

---

# 28. Evaluation API

统一：

```typescript
function evaluate(
  expression: Expression,
  context: EvaluationContext
): unknown;
```

变量：

```typescript
evaluateVariable(
  name: string,
  context: EvaluationContext
);
```

---

# 29. Expression 求值

伪代码：

```typescript
function evaluate(
  expression: Expression,
  context: EvaluationContext
) {
  switch (expression.type) {

    case "literal":
      return expression.value;

    case "variable":
      return context.values[expression.name];

    case "operation":
      return evaluateOperation(
        expression,
        context
      );

    case "if":
      return evaluateConditional(
        expression,
        context
      );
  }
}
```

---

# 30. Operation 求值

```typescript
function evaluateOperation(
  expression: OperationExpression,
  context: EvaluationContext
) {
  const args = expression.args.map(
    arg => evaluate(arg, context)
  );

  switch (expression.op) {

    case "add":
      return args.reduce((a, b) => a + b);

    case "subtract":
      return args[0] - args[1];

    case "multiply":
      return args.reduce((a, b) => a * b);

    case "divide":
      return args[0] / args[1];

    case "mod":
      return args[0] % args[1];

    case "gcd":
      return gcd(args[0], args[1]);

    case "lcm":
      return lcm(args[0], args[1]);

    default:
      throw new Error(
        `Unsupported operator: ${expression.op}`
      );
  }
}
```

---

# 31. Variable Evaluation

Variable 需要区分：

```text
Constant
Random
Derived
```

```typescript
function evaluateVariable(
  name: string,
  context: EvaluationContext
) {
  if (context.cache.has(name)) {
    return context.cache.get(name);
  }

  const variable = context.variables[name];

  let value;

  switch (variable.type) {

    case "constant":
      value = variable.value;
      break;

    case "random":
      value = generateRandom(
        variable,
        context
      );
      break;

    case "derived":
      value = evaluate(
        variable.expression,
        context
      );
      break;
  }

  context.cache.set(name, value);

  return value;
}
```

---

# 32. Lazy Evaluation

实际上不一定需要提前计算所有变量。

例如：

```text
a
b
c = a + b
d = c × 2
```

如果最终只需要：

```text
d
```

可以：

```text
evaluate(d)
 ↓
evaluate(c)
 ↓
evaluate(a)
evaluate(b)
```

即：

> **推荐 Engine 使用 Lazy Evaluation + Dependency Graph。**

---

# 33. Eager vs Lazy

推荐：

```text
Compile Phase
    ↓
Build DAG
    ↓
Validate DAG
    ↓
Generate Required Roots
    ↓
Lazy Evaluation
```

而不是：

```text
所有变量全部计算
```

原因：

复杂奥数题可能存在大量辅助变量。

---

# 34. Cache

同一个变量在一次生成过程中只能计算一次。

例如：

```text
a = random()

b = a × 2

c = a × 3

d = b + c
```

必须保证：

```text
a = 5
```

而不是：

```text
b 使用 a=5
c 又重新生成 a=7
```

因此：

```typescript
cache.set("a", 5);
```

是强制要求。

---

# 35. Random Variable 的重要规则

RandomVariable：

> **一次 Question Generation 生命周期中只能生成一次。**

即：

```text
QuestionContext
       │
       └── Random Variable
               │
               └── immutable
```

---

# 36. Immutable Context

推荐生成完成后：

```typescript
EvaluationContext
```

不允许修改 RandomVariable。

例如：

```text
unitPrice = 8
```

后续任何计算都只能读取：

```text
unitPrice = 8
```

---

# 37. Constraint 的依赖

Constraint 本身也会产生依赖。

例如：

```text
total = price × quantity

Constraint:
total <= 100
```

依赖图：

```text
price
  ↓
total
  ↓
constraint
  ↑
quantity
```

因此 Constraint 不属于变量 DAG，但必须在变量计算之后求值。

---

# 38. Constraint Evaluation

统一：

```typescript
interface ConstraintContext {
  values: Record<string, unknown>;
}
```

：

```typescript
evaluateConstraint(
  constraint,
  context
): boolean
```

所有 Constraint：

```text
true
false
```

---

# 39. Constraint Failure

如果：

```text
price = 15
quantity = 10
total = 150

Constraint:
total <= 100
```

结果：

```text
false
```

整个 Candidate：

```text
REJECT
```

然后重新生成 Random Variables。

---

# 40. Retry

推荐：

```typescript
interface GenerationConfig {
  maxAttempts: number;

  seed?: number;
}
```

默认：

```text
maxAttempts = 100
```

流程：

```text
Attempt 1
   ↓
Constraint Fail
   ↓
Attempt 2
   ↓
Constraint Fail
   ↓
Attempt 3
   ↓
Success
```

超过：

```text
maxAttempts
```

则：

```text
GenerationFailedError
```

---

# 41. Seed 与依赖

Random 生成必须是 Deterministic 的。

相同：

```text
Template
+
Seed
```

必须得到相同结果：

```text
Question A
=
Question B
```

例如：

```typescript
generate(
  template,
  {
    seed: 20260915
  }
);
```

重复执行：

```text
unitPrice = 8
quantity = 5
total = 40
```

必须一致。

---

# 42. Random Stream

不要直接：

```typescript
Math.random()
```

推荐：

```typescript
Random(seed)
```

并为变量建立稳定随机流：

```text
seed
 ↓
unitPrice RNG
quantity RNG
item RNG
```

变量顺序发生变化时，不应该导致已有变量全部变化。

推荐：

```text
variableSeed =
hash(globalSeed + variableName)
```

例如：

```text
20260915 + "unitPrice"
```

生成：

```text
unitPriceSeed
```

这样更加稳定。

---

# 43. Dependency Graph 与 Generator 的关系

需要特别区分：

```text
Dependency Graph
```

和：

```text
Generation Strategy
```

例如：

```text
a = random
b = random
c = a + b
```

属于：

```text
Forward Generation
```

但是：

```text
c = target
a + b = c
```

可能需要：

```text
Reverse Generation
```

因此：

> **依赖图决定“求值顺序”，Generator 决定“如何获得变量值”。**

两者不能混为一谈。

---

# 44. Reverse Variable

建议 v1.1 增加：

```typescript
type GenerationRole =
  | "input"
  | "derived"
  | "target"
  | "unknown";
```

例如：

```json
{
  "answer": {
    "type": "random",
    "valueType": "integer",

    "role": "target",

    "generator": {
      "strategy": "range",
      "min": 20,
      "max": 100
    }
  }
}
```

用于：

```text
先确定答案
 ↓
反推题目参数
```

---

# 45. 依赖方向与求解方向

普通应用题：

```text
price
quantity
   ↓
total
```

是：

```text
Forward
```

逆向题：

```text
total
   ↓
price
quantity
```

是：

```text
Reverse
```

因此需要区分：

```text
Dependency Direction
```

和：

```text
Solving Direction
```

这是整个 DSL 后续支持奥数题的关键。

---

# 46. 变量状态

Engine 内部建议使用：

```typescript
type VariableState =
  | "unresolved"
  | "generating"
  | "resolved"
  | "failed";
```

状态：

```text
unresolved
    ↓
generating
    ↓
resolved
```

异常：

```text
generating
    ↓
failed
```

---

# 47. 循环检测也可以利用状态

如果：

```text
evaluate(a)
```

过程中发现：

```text
a = generating
```

说明：

```text
a → ... → a
```

直接抛出：

```text
CircularDependencyError
```

---

# 48. Compile Phase

Template 不能直接运行。

必须先 Compile：

```text
JSON DSL
   ↓
Parser
   ↓
Schema Validation
   ↓
Variable Validation
   ↓
Expression Validation
   ↓
Dependency Extraction
   ↓
Cycle Detection
   ↓
Type Checking
   ↓
CompiledTemplate
```

---

# 49. CompiledTemplate

```typescript
interface CompiledTemplate {
  template: ProblemTemplate;

  graph: DependencyGraph;

  evaluationOrder: string[];

  roots: string[];

  variableTypes: Record<string, ValueType>;

  dependencies: Record<string, string[]>;
}
```

这样：

```text
Template
```

只编译一次。

然后：

```text
generate × 10000
```

直接复用：

```text
CompiledTemplate
```

---

# 50. 推荐最终 Engine 架构

```text
                ProblemTemplate
                       │
                       ↓
                  DSL Compiler
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Schema       Dependency      Type
     Validator       Graph       Checker
          │            │            │
          └────────────┼────────────┘
                       ↓
                CompiledTemplate
                       │
                       ↓
                 Question Engine
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    Generator       Evaluator      Constraint
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                    Solver
                       ↓
                   Validator
                       ↓
                    Renderer
                       ↓
                    Question
```

---

# 51. 最终统一规则

变量系统最终遵循 10 条规则：

### Rule 1

RandomVariable 是输入。

### Rule 2

DerivedVariable 是计算结果。

### Rule 3

ConstantVariable 是固定值。

### Rule 4

Expression 显式引用变量。

### Rule 5

Expression 自动产生 Dependency。

### Rule 6

Dependency Graph 必须是 DAG。

### Rule 7

RandomVariable 一次生成生命周期内只能生成一次。

### Rule 8

DerivedVariable 按依赖关系 Lazy Evaluation。

### Rule 9

Constraint 在相关变量完成后执行。

### Rule 10

相同 Template + Seed 必须产生完全一致的 Question。

---

# 52. 最终示例

完整结构：

```json
{
  "id": "G3_PRICE_001",
  "version": "1.1",

  "metadata": {
    "name": "单价数量总价",
    "type": "word_problem",
    "grade": 3,
    "topic": "word.price"
  },

  "variables": {

    "unitPrice": {
      "type": "random",
      "valueType": "integer",

      "generator": {
        "strategy": "range",
        "min": 2,
        "max": 20
      }
    },

    "quantity": {
      "type": "random",
      "valueType": "integer",

      "generator": {
        "strategy": "range",
        "min": 2,
        "max": 10
      }
    },

    "total": {
      "type": "derived",
      "valueType": "integer",

      "expression": {
        "type": "operation",
        "op": "multiply",

        "args": [
          {
            "type": "variable",
            "name": "unitPrice"
          },

          {
            "type": "variable",
            "name": "quantity"
          }
        ]
      }
    }
  },

  "constraints": [
    {
      "type": "comparison",
      "op": "lte",

      "left": {
        "type": "variable",
        "name": "total"
      },

      "right": {
        "type": "literal",
        "value": 100
      }
    }
  ],

  "answer": {
    "type": "integer",

    "expression": {
      "type": "variable",
      "name": "total"
    },

    "unit": "元"
  },

  "generator": {
    "strategy": "random",
    "maxAttempts": 100
  },

  "renderer": {
    "question": "一本练习本{{unitPrice}}元，小明买了{{quantity}}本，一共需要多少钱？",

    "answer": "{{total}}元"
  }
}
```

其内部自动变成：

```text
Dependency Graph

unitPrice ───────┐
                  ↓
               total
                  ↓
quantity ─────────┘
                  ↓
              constraint
                  ↓
                answer
```

求值：

```text
Step 1
unitPrice = Random(2, 20)
          = 8

Step 2
quantity = Random(2, 10)
         = 5

Step 3
total = 8 × 5
      = 40

Step 4
40 <= 100
      = true

Step 5
answer = 40
```

最终：

```text
一本练习本8元，小明买了5本，一共需要多少钱？

答案：40元
```

---

# 53. 对整个项目的意义

经过这次调整，DSL 已经从：

```text
JSON题目模板
```

升级为：

```text
Math IR
```

即：

```text
数学问题
    ↓
Variables
    ↓
Expressions
    ↓
Dependency Graph
    ↓
Constraints
    ↓
Evaluation
    ↓
Solver
```

这一步非常重要。

后续增加：

```text
鸡兔同笼
和差倍
植树问题
年龄问题
行程问题
工程问题
排列组合
数论
几何
逻辑推理
```

都不需要重新设计变量系统。

只需要增加：

```text
Operator
Constraint
Generator
Solver
Renderer
```

即可。

最终目标：

```text
             Math DSL
                 │
        ┌────────┴────────┐
        ↓                 ↓
   Forward Model      Reverse Model
        │                 │
        ↓                 ↓
   Random Generate    Constraint Solve
        │                 │
        └────────┬────────┘
                 ↓
            Math Engine
                 ↓
       ┌─────────┼─────────┐
       ↓         ↓         ↓
    应用题     奥数题     几何题
       │         │         │
       └─────────┼─────────┘
                 ↓
            Question Bank
```

**这个结构才适合作为后续 100+ 应用题模板 + 50+ 奥数算法的统一底层。**