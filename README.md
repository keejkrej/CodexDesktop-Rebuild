# Codex Desktop Rebuild

Windows x64 Electron build for OpenAI Codex Desktop App.

## Supported Platforms

| Platform | Architecture | Status |
|----------|--------------|--------|
| Windows  | x64          | ✅     |

## Build

```bash
npm install
npm run patch:all
npm run build
```

Build note: install **MSVC v143 - VS 2022 C++ x64/x86 Spectre-mitigated libs** in Visual Studio 2022 Build Tools.

## Project Structure

```text
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
│   └── start-dev.js
├── forge.config.js      # Electron Forge config
└── package.json
```

## CI/CD

GitHub Actions builds only when a GitHub Release is published.

## Credits

**© OpenAI · Rebuild Contributors**

- [OpenAI Codex](https://github.com/openai/codex) - Original Codex CLI (Apache-2.0)
- [Rebuild project](https://github.com/Haleclipse/CodexDesktop-Rebuild) - Rebuild changes and packaging scripts
- [Electron Forge](https://www.electronforge.io/) - Build toolchain

## License

This project rebuilds the Codex Desktop app for Windows x64 distribution.
Original Codex CLI by OpenAI is licensed under Apache-2.0.
