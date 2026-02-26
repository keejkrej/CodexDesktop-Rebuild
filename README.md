# Codex Desktop Rebuild

Windows x64 Electron build for OpenAI Codex Desktop App.

## Supported Platforms

| Platform | Architecture | Status |
|----------|--------------|--------|
| Windows  | x64          | ✅     |

## Build

```bash
# Install dependencies
npm install

# Build for current platform
npm run build

# Build for Windows x64
npm run build:win-x64
```

## Development

```bash
npm run dev
```

## Project Structure

```
├── src/
│   ├── .vite/build/     # Main process (Electron)
│   └── webview/         # Renderer (Frontend)
├── resources/
│   ├── electron.icns    # App icon
│   └── notification.wav # Sound
├── scripts/
│   ├── patch-process-polyfill.js
│   ├── patch-open-in-targets-win.js
│   ├── patch-terminal-pwsh-win.js
│   ├── patch-shell-exec-pwsh-win.js
│   └── refresh-from-dmg.ps1
├── forge.config.js      # Electron Forge config
└── package.json
```

## CI/CD

GitHub Actions builds only when a GitHub Release is published.

## Credits

**© OpenAI · Cometix Space**

- [OpenAI Codex](https://github.com/openai/codex) - Original Codex CLI (Apache-2.0)
- [Cometix Space](https://github.com/Haleclipse) - Rebuild project & [@openai/codex](https://www.npmjs.com/package/@openai/codex) binaries
- [Electron Forge](https://www.electronforge.io/) - Build toolchain

## License

This project rebuilds the Codex Desktop app for Windows x64 distribution.
Original Codex CLI by OpenAI is licensed under Apache-2.0.
