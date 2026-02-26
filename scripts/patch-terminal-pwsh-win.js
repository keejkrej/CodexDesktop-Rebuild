const fs = require("fs");
const path = require("path");

const BUNDLE_RE = /^main(-[^.]+)?\.js$/;
const WORKER_FILE = "worker.js";
const WINDOWS_PATCH_MARKER = "/*__codex_terminal_pwsh_windows_patch*/";
const COMMAND_RUNNER_PATCH_MARKER = "/*__codex_terminal_pwsh_command_runner_patch*/";
const WORKER_COMMAND_RUNNER_PATCH_MARKER =
  "/*__codex_terminal_pwsh_worker_command_runner_patch*/";
const WORKER_ONE_PATCH_MARKER =
  "/*__codex_terminal_pwsh_worker_one_patch*/";

function locateTargets() {
  const buildDir = path.join(__dirname, "..", "src", ".vite", "build");
  const files = fs
    .readdirSync(buildDir)
    .filter((file) => BUNDLE_RE.test(file) || file === WORKER_FILE);
  if (!files.length)
    throw new Error(
      "No main*.js bundle or worker.js found under src/.vite/build"
    );
  return files.map((file) => path.join(buildDir, file));
}

function findMatchingBrace(source, openBraceIndex) {
  let depth = 0;
  let quote = null;

  for (let i = openBraceIndex; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error("Failed to find matching brace.");
}

function replaceFunction(source, startNeedle, replacementHeader) {
  const start = source.indexOf(startNeedle);
  if (start < 0) throw new Error(`Missing function marker: ${startNeedle}`);
  const open = source.indexOf("{", start);
  const close = findMatchingBrace(source, open);
  const end = close + 1;
  return {
    source: `${source.slice(0, start)}${replacementHeader}${source.slice(end)}`,
    replaced: source.slice(start, end),
  };
}

function applyPatch(source) {
  source = source.replace(
    new RegExp(
      [
        WINDOWS_PATCH_MARKER,
        COMMAND_RUNNER_PATCH_MARKER,
        WORKER_COMMAND_RUNNER_PATCH_MARKER,
        WORKER_ONE_PATCH_MARKER,
      ]
        .map((marker) => marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|"),
      "g"
    ),
    ""
  );

  return source;
}

function applyMainPatch(source) {
  source = applyPatch(source);

  const resolveNeedle =
    'resolveShell(){return process.platform==="win32"?process.env.COMSPEC||"cmd.exe":process.env.SHELL||"/bin/bash"}';
  if (source.includes(resolveNeedle)) {
    source = source.replace(
      resolveNeedle,
      'resolveShell(){if(process.platform!=="win32")return process.env.SHELL||"/bin/bash";if(process.env.SHELL&&process.env.SHELL.length>0)return process.env.SHELL;const e=["pwsh","powershell","pwsh.exe","powershell.exe"];for(const t of e)try{const r=Dn.spawnSync("where",[t],{encoding:"utf8",timeout:1e3}),i=(r.stdout||"").toString().split(/\\r?\\n/).map(o=>o.trim()).filter(Boolean);for(const o of i)if(ve.existsSync(o))return o}catch{}return "pwsh"}'
    );
  }

  const resolveNeedlePatchedWindowsFirst =
    'resolveShell(){if(process.platform!=="win32")return process.env.SHELL||"/bin/bash";if(process.env.COMSPEC&&process.env.COMSPEC.length>0)return process.env.COMSPEC;';
  if (source.includes(resolveNeedlePatchedWindowsFirst)) {
    source = source.replace(
      resolveNeedlePatchedWindowsFirst,
      'resolveShell(){if(process.platform!=="win32")return process.env.SHELL||"/bin/bash";if(process.env.SHELL&&process.env.SHELL.length>0)return process.env.SHELL;'
    );
  }

  const legacyResolveNeedle =
    /function IK\(\)\{const\{env:t\}=Pt;if\(Pt.platform==="win32"\)return t\.COMSPEC\|\|"cmd\.exe";try\{const e=Re\.userInfo\(\)\.shell;if\(e\)return e\}catch\{\}return Pt\.platform==="darwin"\?t\.SHELL\|\|"\/bin\/zsh":t\.SHELL\|\|"\/bin\/sh"\}/;
  if (legacyResolveNeedle.test(source)) {
    source = source.replace(
      legacyResolveNeedle,
      'function IK(){const{env:t}=Pt;if(Pt.platform!=="win32")return Pt.platform==="darwin"?t.SHELL||"/bin/zsh":t.SHELL||"/bin/sh";if(t.SHELL&&t.SHELL.length>0)return t.SHELL;const e=["pwsh","powershell","pwsh.exe","powershell.exe"];for(const r of e)try{const n=Dn.spawnSync("where",[r],{encoding:"utf8",timeout:1e3}),i=(n.stdout||"").toString().split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);for(const s of i)if(ve.existsSync(s))return s}catch{}return "pwsh"}'
    );
  }

  const legacyResolveNeedlePatchedWindowsFirst =
    /function IK\(\)\{const\{env:t\}=Pt;if\(Pt.platform!=="win32"\)return Pt\.platform==="darwin"\?t\.SHELL\|\|"\/bin\/zsh":t\.SHELL\|\|"\/bin\/sh";if\(t\.COMSPEC&&t\.COMSPEC\.length>0\)return t\.COMSPEC;/;
  if (legacyResolveNeedlePatchedWindowsFirst.test(source)) {
    source = source.replace(
      legacyResolveNeedlePatchedWindowsFirst,
      'function IK(){const{env:t}=Pt;if(Pt.platform!=="win32")return Pt.platform==="darwin"?t.SHELL||"/bin/zsh":t.SHELL||"/bin/sh";if(t.SHELL&&t.SHELL.length>0)return t.SHELL;'
    );
  }

  const createNeedle =
    "async create(e,n){const r=n.sessionId??Ke.randomUUID(),i=this.resolveRequestedCwd(n.cwd),s=this.resolveLocalCwd(i),o=this.resolveShell(),a=this.terminalCommand&&this.terminalCommand.length>0?this.terminalCommand:[o],[c,...u]=a,l=this.buildTerminalEnv();";
  const createReplacement =
    "async create(e,n){const r=n.sessionId??Ke.randomUUID(),i=this.resolveRequestedCwd(n.cwd),s=this.resolveLocalCwd(i),o=this.resolveShell(),a=this.terminalCommand&&this.terminalCommand.length>0?this.terminalCommand:[o],f=Array.isArray(a)?a:[String(a)],[c,...u]=f,l=this.buildTerminalEnv();";
  if (source.includes(createNeedle)) {
    source = source.replace(createNeedle, createReplacement);
  }

  const commandRunnerNeedle =
    /function c\(l\)\{if\(!i\)return l;const p=a\(l\),d=!s\.test\(p\);if\(l\.options\.forceShell\|\|d\)\{[^]*?\}return l\}/;
  if (commandRunnerNeedle.test(source)) {
    source = source.replace(
      commandRunnerNeedle,
      "function c(l){if(!i)return l;const p=a(l),d=!s.test(p);if(l.options.forceShell||d){const f=o.test(p),u=typeof l.options.shell===\"string\"&&l.options.shell.trim().length>0?l.options.shell:\"pwsh\",h=u.toLowerCase(),m=h.includes(\"powershell\")||h.includes(\"pwsh\");l.command=t.normalize(l.command),l.command=n.command(l.command),l.args=l.args.map(y=>n.argument(y,f));const v=[l.command].concat(l.args).join(\" \");if(m){l.args=[\"-NoProfile\",\"-NoLogo\",\"-NonInteractive\",\"-Command\",v],l.command=u}else{l.args=[\"/d\",\"/s\",\"/c\",`\\\"${v}\\\"`],l.command=u,l.options.windowsVerbatimArguments=!0}}return l}"
    );
  }

  if (!source.includes(WINDOWS_PATCH_MARKER)) {
    source += WINDOWS_PATCH_MARKER;
  }
  if (!source.includes(COMMAND_RUNNER_PATCH_MARKER)) {
    source += COMMAND_RUNNER_PATCH_MARKER;
  }

  return source;
}

function applyWorkerPatch(source) {
  source = applyPatch(source);

  const workerCommandRunnerNeedle =
    /function a\(f\)\{if\(!s\)return f;const d=c\(f\),u=!i\.test\(d\);if\(f\.options\.forceShell\|\|u\)\{[^]*?\}return f\}/;
  if (workerCommandRunnerNeedle.test(source)) {
    source = source.replace(
      workerCommandRunnerNeedle,
      "function a(f){if(!s)return f;const d=c(f),u=!i.test(d);if(f.options.forceShell||u){const h=o.test(d),p=typeof f.options.shell===\"string\"&&f.options.shell.trim().length>0?f.options.shell:\"pwsh\",g=p.toLowerCase(),m=g.includes(\"powershell\")||g.includes(\"pwsh\");f.command=e.normalize(f.command),f.command=n.command(f.command),f.args=f.args.map(y=>n.argument(y,h));const v=[f.command].concat(f.args).join(\" \");if(m){f.args=[\"-NoProfile\",\"-NoLogo\",\"-NonInteractive\",\"-Command\",v],f.command=p}else{f.args=[\"/d\",\"/s\",\"/c\",`\\\"${v}\\\"`],f.command=p,f.options.windowsVerbatimArguments=!0}}return f}"
    );
  }

  const workerOneNeedle =
    'function one(){const{env:e}=Pi;if(Pi.platform==="win32")return e.COMSPEC||"cmd.exe";try{const t=ri.userInfo().shell;if(t)return t}catch{}return Pi.platform==="darwin"?e.SHELL||"/bin/zsh":e.SHELL||"/bin/sh"}';
  const workerOneReplacement =
    'function one(){const{env:e}=Pi;if(Pi.platform!=="win32")return Pi.platform==="darwin"?e.SHELL||"/bin/zsh":e.SHELL||"/bin/sh";if(e.SHELL&&e.SHELL.length>0)return e.SHELL;const t=["pwsh","powershell","pwsh.exe","powershell.exe"];for(const n of t)try{const r=iu.spawnSync("where",[n],{encoding:"utf8",timeout:1e3}),i=(r.stdout||"").toString().split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);for(const s of i)if(Mn.existsSync(s))return s}catch{}return "pwsh"}';
  if (source.includes(workerOneNeedle)) {
    source = source.replace(workerOneNeedle, workerOneReplacement);
  }

  const workerOneNeedlePatchedWindowsFirst =
    'function one(){const{env:e}=Pi;if(Pi.platform!=="win32")return Pi.platform==="darwin"?e.SHELL||"/bin/zsh":e.SHELL||"/bin/sh";if(e.COMSPEC&&e.COMSPEC.length>0)return e.COMSPEC;';
  if (source.includes(workerOneNeedlePatchedWindowsFirst)) {
    source = source.replace(
      workerOneNeedlePatchedWindowsFirst,
      'function one(){const{env:e}=Pi;if(Pi.platform!=="win32")return Pi.platform==="darwin"?e.SHELL||"/bin/zsh":e.SHELL||"/bin/sh";if(e.SHELL&&e.SHELL.length>0)return e.SHELL;'
    );
  }

  if (!source.includes(WINDOWS_PATCH_MARKER)) {
    source += WINDOWS_PATCH_MARKER;
  }
  if (!source.includes(WORKER_COMMAND_RUNNER_PATCH_MARKER)) {
    source += WORKER_COMMAND_RUNNER_PATCH_MARKER;
  }
  if (!source.includes(WORKER_ONE_PATCH_MARKER)) {
    source += WORKER_ONE_PATCH_MARKER;
  }

  return source;
}

function main() {
  const bundlePaths = locateTargets();
  for (const bundlePath of bundlePaths) {
    const source = fs.readFileSync(bundlePath, "utf8");
    const patched = path.basename(bundlePath) === WORKER_FILE
      ? applyWorkerPatch(source)
      : applyMainPatch(source);
    if (patched !== source) {
      fs.writeFileSync(bundlePath, patched);
    }
  }
}

main();
