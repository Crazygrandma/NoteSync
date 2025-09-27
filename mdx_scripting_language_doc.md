# MDX Scripting Language Documentation

**Purpose:**
MDX is a lightweight Markdown-based scripting language designed for writing notes that can be enhanced with Large Language Model (LLM) outputs. It allows embedding of LLM function calls directly in Markdown with support for **user variables** and **system options**.

---

## 1. File Structure

### 1.1 Metadata (Front Matter)
At the top of an MDX file, you can define global metadata using YAML front matter:

```yaml
version: 0.1
author: Alice
model: dolphin3
temperature: 0.7
```

- **version**: File version.
- **author**: Name of the creator.
- **model**: Default LLM to use (system variable).
- **temperature**: Default LLM temperature (system variable).

---

## 2. Variables

### 2.1 User Variables
- Defined with the `@set` directive.
- Can store any value except reserved system variables (`model`, `temperature`).
- Used for inline substitution with the syntax `{@variable}`.

```mdx
@set name = "Henry"
@set topic = "scripting languages"

My name is {@name}. Today’s topic is {@topic}.
```

### 2.2 System Variables
- Reserved names for LLM options: `model`, `temperature`.
- Can only be set with `@set` for controlling LLM behavior.
- Example:

```mdx
@set model = gpt-4
@set temperature = 0.2
```

---

## 3. LLM Functions

### 3.1 Syntax
LLM functions are prefixed with `/`:

```mdx
/explain "Explain recursion in simple terms" @model=gpt-4 @temperature=0.2
/summarise "Condense the above notes" @replace
/factcheck "Python is compiled" @window
```

- `/explain`, `/summarise`, `/factcheck` are example LLM functions.
- Inline flags (`@model`, `@temperature`) modify execution per call.

---

## 4. Inline Substitution

- Use `{@variable}` to inject user or system variables into text or LLM prompts:

```mdx
/explain "Why are {@topic} important?" @model={@model}
```

- Variables inside `{}` are evaluated at runtime by the interpreter.

---

## 5. Response Markers

- The interpreter generates **response blocks** in the `.mdx` file to store LLM outputs.
- Any editor can read these blocks; special editors may render them as “live windows.”

Example marker:

```mdx
# Response
Scripting languages are flexible because they are interpreted, dynamic, and easy to extend.
```

---

## 6. Example MDX File

```mdx
---
version: 1
author: moviemakerhd
model: dolphin3
temperature: 0.7
---

@model: gpt-4o
@length: short
@format: json

Lecture notes on machine learning:

- Supervised learning uses labeled data.
- Unsupervised learning finds hidden structure.
- Reinforcement learning is trial and error.

/summarize [line:5-line:7] {Give a 2–3 sentence summary of these learning types}

/fact_check [line:5] {Verify if supervised learning *always* needs labeled data}

/custom [line:6] {Generate a simple analogy for unsupervised learning}
```

