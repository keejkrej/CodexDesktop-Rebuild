const fs = require("fs");
const path = require("path");

const BUNDLE_RE = /^main(-[^.]+)?\.js$/;
const LOGGER_PLATFORM_RE = /const\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\("open-in-targets"\),\s*([A-Za-z_$][\w$]*)\s*=\s*process\.platform==="darwin"/;
const TARGET_MAP_RE = /let\s+([A-Za-z_$][\w$]*)\s*=\s*null;\s*const\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\.map\(\s*\(\{id:\s*([A-Za-z_$][\w$]*),label:\s*([A-Za-z_$][\w$]*),icon:\s*([A-Za-z_$][\w$]*)\}\)\s*=>\s*\(\{id:\s*\4,label:\s*\5,icon:\s*\6\}\)\s*\);/;

function locateBundle() {
  const buildDir = path.join(__dirname, "..", "src", ".vite", "build");
  const files = fs.readdirSync(buildDir).filter((file) => BUNDLE_RE.test(file));
  if (!files.length) throw new Error("No main*.js bundle found under src/.vite/build");
  const main = files.find((file) => file !== "main.js") || files[0];
  return path.join(buildDir, main);
}

function applyPatch(source) {
  if (source.includes("__codex_open_targets_win_patch")) return source;

  const loggerPlatformMatch = source.match(LOGGER_PLATFORM_RE);
  if (!loggerPlatformMatch) {
    throw new Error("Unable to find open target logger/platform marker in bundle.");
  }
  const loggerVar = loggerPlatformMatch[1];
  const loggerFactoryVar = loggerPlatformMatch[2];
  const platformVar = loggerPlatformMatch[3];
  source = source.replace(
    LOGGER_PLATFORM_RE,
    `const ${loggerVar}=${loggerFactoryVar}("open-in-targets"),${platformVar}=process.platform==="darwin",__codexOpenTargetsIsWin=process.platform==="win32"`,
  );

  const targetMapMatch = source.match(TARGET_MAP_RE);
  if (!targetMapMatch) {
    throw new Error("Unable to find open target map marker in bundle.");
  }
  const [, cacheVar, mappedVar, listVar] = targetMapMatch;
  const winTargets = `const __codexOpenTargetWinRequireNode=(n)=>{try{return require("node:"+n)}catch{return require(n)}};const __codexOpenTargetWinPath=__codexOpenTargetWinRequireNode("path"),__codexOpenTargetWinFs=__codexOpenTargetWinRequireNode("fs"),__codexOpenTargetWinChildProcess=__codexOpenTargetWinRequireNode("child_process");function __codexOpenTargetWinFromEnv(t,...e){const n=process.env[t];return n?__codexOpenTargetWinPath.join(n,...e):null}function __codexOpenTargetWinFind(...t){for(const e of t){const n=Array.isArray(e)?e:[e];for(const r of n){if(!r)continue;if(__codexOpenTargetWinFs.existsSync(r))return r}}return null}function __codexOpenTargetWinWhere(t){try{const n=__codexOpenTargetWinChildProcess.spawnSync("where",[t],{encoding:"utf8",timeout:1e3}),r=(n.stdout?.split(/\\r?\\n/).map(e=>e.trim()).filter(Boolean))||[];for(const e of r)if(__codexOpenTargetWinFind(e))return e}catch{}return null}function __codexOpenTargetWinCodeArgs(t,e){if(e&&typeof e.line=="number"){const n=typeof e.column=="number"?e.column:1;return["-g",t+":"+e.line+":"+n]}return["-g",t]}function __codexOpenTargetWinExplorerArgs(t){return["/select,",__codexOpenTargetWinPath.normalize(t)]}const __codexOpenTargetsWin=[{id:"vscode",label:"VS Code",icon:"apps/vscode.png",detect:()=>__codexOpenTargetWinFind(__codexOpenTargetWinFromEnv("LOCALAPPDATA","Programs","Microsoft VS Code","bin","code.cmd"),__codexOpenTargetWinFromEnv("LOCALAPPDATA","Programs","Microsoft VS Code","Code.exe"),__codexOpenTargetWinFromEnv("ProgramFiles","Microsoft VS Code","bin","code.cmd"),__codexOpenTargetWinFromEnv("ProgramFiles","Microsoft VS Code","Code.exe"),__codexOpenTargetWinFromEnv("ProgramFiles(x86)","Microsoft VS Code","bin","code.cmd"),__codexOpenTargetWinFromEnv("ProgramFiles(x86)","Microsoft VS Code","Code.exe"),__codexOpenTargetWinWhere("code.cmd"),__codexOpenTargetWinWhere("code"),__codexOpenTargetWinWhere("Code.exe")),args:(t,e)=>__codexOpenTargetWinCodeArgs(t,e)},{id:"vscodeInsiders",label:"VS Code Insiders",icon:"apps/vscode-insiders.png",detect:()=>__codexOpenTargetWinFind(__codexOpenTargetWinFromEnv("LOCALAPPDATA","Programs","Microsoft VS Code Insiders","bin","code-insiders.cmd"),__codexOpenTargetWinFromEnv("LOCALAPPDATA","Programs","Microsoft VS Code Insiders","Code - Insiders.exe"),__codexOpenTargetWinFromEnv("ProgramFiles","Microsoft VS Code Insiders","bin","code-insiders.cmd"),__codexOpenTargetWinFromEnv("ProgramFiles","Microsoft VS Code Insiders","Code - Insiders.exe"),__codexOpenTargetWinFromEnv("ProgramFiles(x86)","Microsoft VS Code Insiders","bin","code-insiders.cmd"),__codexOpenTargetWinFromEnv("ProgramFiles(x86)","Microsoft VS Code Insiders","Code - Insiders.exe"),__codexOpenTargetWinWhere("code-insiders.cmd"),__codexOpenTargetWinWhere("code-insiders"),__codexOpenTargetWinWhere("Code - Insiders.exe")),args:(t,e)=>__codexOpenTargetWinCodeArgs(t,e)},{id:"cursor",label:"Cursor",icon:"apps/cursor.png",detect:()=>__codexOpenTargetWinFind(__codexOpenTargetWinFromEnv("LOCALAPPDATA","Programs","Cursor","Cursor.exe"),__codexOpenTargetWinFromEnv("ProgramFiles","Cursor","Cursor.exe"),__codexOpenTargetWinFromEnv("ProgramFiles(x86)","Cursor","Cursor.exe"),__codexOpenTargetWinWhere("cursor"),__codexOpenTargetWinWhere("cursor.cmd"),__codexOpenTargetWinWhere("Cursor.exe")),args:(t,e)=>__codexOpenTargetWinCodeArgs(t,e)},{id:"windsurf",label:"Windsurf",icon:"apps/windsurf.png",detect:()=>__codexOpenTargetWinFind(__codexOpenTargetWinFromEnv("LOCALAPPDATA","Programs","Windsurf","Windsurf.exe"),__codexOpenTargetWinFromEnv("ProgramFiles","Windsurf","Windsurf.exe"),__codexOpenTargetWinFromEnv("ProgramFiles(x86)","Windsurf","Windsurf.exe"),__codexOpenTargetWinWhere("windsurf"),__codexOpenTargetWinWhere("windsurf.cmd"),__codexOpenTargetWinWhere("Windsurf.exe")),args:(t,e)=>__codexOpenTargetWinCodeArgs(t,e)},{id:"finder",label:"File Manager",icon:"apps/finder.png",detect:()=>__codexOpenTargetWinFind(__codexOpenTargetWinWhere("explorer"),__codexOpenTargetWinWhere("explorer.exe"),__codexOpenTargetWinWhere("explorer.com"),"C:\\\\Windows\\\\explorer.exe"),args:t=>__codexOpenTargetWinExplorerArgs(t)}];let ${cacheVar}=null;const __codexOpenTargets=${platformVar}?${listVar}:__codexOpenTargetsIsWin?__codexOpenTargetsWin:[],${mappedVar}=__codexOpenTargets.map(({id:t,label:e,icon:n})=>({id:t,label:e,icon:n}));`;
  source = source.replace(targetMapMatch[0], winTargets);

  source = source.replace(
    new RegExp(`if\\(!${platformVar}\\)return\\[\\];`, "g"),
    `if(!${platformVar}&&!__codexOpenTargetsIsWin)return[];`,
  );
  source = source.replace(
    new RegExp(`for\\(const\\s+([A-Za-z_$][\\w$]*)\\s+of\\s+${listVar}\\)`, "g"),
    "for(const $1 of __codexOpenTargets)",
  );
  source = source.replace(new RegExp(`${listVar}\\.find`, "g"), "__codexOpenTargets.find");
  source = source.replace(
    'Opening external editors is only supported on macOS',
    "Opening external editors is only supported on macOS and Windows",
  );

  return `${source}/*__codex_open_targets_win_patch*/`;
}

function main() {
  const bundlePath = locateBundle();
  const source = fs.readFileSync(bundlePath, "utf8");
  const patched = applyPatch(source);
  if (patched === source) return;
  fs.writeFileSync(bundlePath, patched);
}

main();
