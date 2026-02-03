/**
 * 构建后补丁脚本：修改版权信息
 */
const fs = require("fs");
const path = require("path");

const mainJsPath = path.join(__dirname, "..", "src", ".vite", "build", "main.js");

// 读取文件
let content = fs.readFileSync(mainJsPath, "utf-8");

// 替换版权信息
const oldCopyright = 'copyright:"© OpenAI"';
const newCopyright = 'copyright:"© OpenAI · Cometix Space"';

if (content.includes(oldCopyright)) {
  content = content.replace(oldCopyright, newCopyright);
  fs.writeFileSync(mainJsPath, content);
  console.log("✅ 版权信息已更新: © OpenAI · Cometix Space");
} else if (content.includes(newCopyright)) {
  console.log("ℹ️  版权信息已是最新");
} else {
  console.warn("⚠️  未找到版权信息字符串");
}
