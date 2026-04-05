import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const includeDirs = ["app", "components", "context", "services", "lib", "types", "docs"];
const includeExts = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml", ".css", ".scss", ".html"]);
const suspiciousTokens = [
  "Ã",
  "Â",
  "â€",
  "â€œ",
  "â€\u009d",
  "â€¢",
  "â€”",
  "âœ",
  "â",
  "Ä",
  "Ä‘",
  "á»",
  "áº",
  "Æ°",
  "Táº",
  "Thá»",
  "KhÃ",
  "Lá»",
  "Gá»",
  "Ná»™p:",
  "ChÆ°a",
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (!includeExts.has(path.extname(entry.name))) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function findIssues(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const issues = [];

  lines.forEach((line, index) => {
    const token = suspiciousTokens.find((item) => line.includes(item));
    if (token) {
      issues.push({
        line: index + 1,
        token,
        preview: line.trim().slice(0, 160),
      });
    }

    if (line.includes("\uFFFD")) {
      issues.push({
        line: index + 1,
        token: "�",
        preview: line.trim().slice(0, 160),
      });
    }
  });

  return issues;
}

const files = includeDirs
  .map((dir) => path.join(root, dir))
  .filter((dir) => fs.existsSync(dir))
  .flatMap((dir) => walk(dir));

const problems = files
  .map((filePath) => ({
    filePath,
    issues: findIssues(filePath),
  }))
  .filter((entry) => entry.issues.length > 0);

if (problems.length > 0) {
  console.error("Found suspicious mojibake / encoding artifacts:");

  for (const problem of problems) {
    const rel = path.relative(root, problem.filePath);
    for (const issue of problem.issues) {
      console.error(`- ${rel}:${issue.line} token=${JSON.stringify(issue.token)} ${issue.preview}`);
    }
  }

  process.exit(1);
}

console.log("No suspicious mojibake patterns found.");
