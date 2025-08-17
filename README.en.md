## json-compare

A local, front-end JSON comparison and editing tool built with Vue 3. The UI and interactions are inspired by `https://jsoneditoronline.org/`. It provides side-by-side JSON editing, formatting, minifying, key sorting, search, diff view, file import/export, URL sharing, and more.

### Features
- **Two-pane JSON editor**: Each pane supports three modes (Tree, Code, Text).
- **Format / Minify**: Beautify or minify the current pane.
- **Key sorting**: Recursively sort object keys to make comparisons stable.
- **Expand / Collapse**: Expand or collapse all tree nodes with one click.
- **Copy / Swap**: Copy Left→Right, Right→Left, or swap the two panes.
- **File import/export**: Load from local `.json/.txt`, or download the current pane to a file.
- **Diff view**: Visual HTML diff powered by jsondiffpatch for the two panes.
- **URL sharing**: Persist the current state (left/right content, modes, theme, indent, etc.) into the URL hash (compressed) for easy sharing and restore.
- **Theme / Indent / Synced scroll**: Light/Dark theme, indent width, and synchronized scrolling between panes.
- **Search and menu**: Enable JSONEditor built-in menu (including search).
- **JMESPath query**: Run JMESPath expressions against a pane to transform/filter.
- **Escape / Unescape / Repair JSON**:
  - Escape: Convert the whole current text into a JSON string (useful when embedding as a field).
  - Unescape: Restore from a JSON string and intelligently try to parse back to JSON.
  - Repair: Use jsonrepair to fix common invalid JSON issues (single quotes, missing/extra commas, trailing commas, etc.).

### Preview & Screenshots
- This is a local front-end tool. Please run it locally and take screenshots as needed.

### Getting Started
- Install dependencies:
```bash
npm install
```
- Development with HMR:
```bash
npm run serve
```
- Production build:
```bash
npm run build
```
- Lint:
```bash
npm run lint
```

### Usage Guide
1. Once opened, each of the two panes is an independent JSON editor. Use “Mode (Left/Right)” to switch between Tree/Code/Text.
2. Use “Open (Left/Right)” to load local files or paste content directly. “Download (Left/Right)” exports the current pane.
3. Each pane supports “Format/Minify/Sort/Repair/Escape/Unescape”.
4. Click “Compare” to generate a diff shown below the editors.
5. Enable “Synced Scroll” to keep both panes scrolling in sync. Use “Expand All/Collapse All” for quick inspection in Tree mode.
6. “Share URL” writes the current state (compressed) to the URL hash so you can copy and share. Opening the URL restores the state.
7. Use JSONEditor’s built-in menu for search and more features.
8. JMESPath: enter an expression and click “Apply to Left/Right” to run it against the selected pane; the result replaces that pane.

### Common Commands & Args
- Specify port/host:
```bash
npm run serve -- --port 8080 --host 0.0.0.0
```

### Browser & Runtime
- Modern browsers recommended (latest Chrome/Edge/Firefox/Safari). IE11 is not supported.
- Recommended Node.js versions: 18 LTS or 20 LTS (higher versions may produce engine warnings from some third-party packages).

### Main Dependencies
- `vue`: Front-end framework.
- `jsoneditor`: Visual JSON editor (Tree/Code/Text modes, built-in menu & search).
- `ace-builds`: Code editor engine (used by JSONEditor).
- `jsondiffpatch`: JSON diff engine and HTML formatter.
- `lz-string`: Compress/restore URL hash state.
- `file-saver`: Save files.
- `lodash`: Utility library (used primarily for deep clone here).
- `jmespath`: JSON query/transform.
- `jsonrepair`: Repair invalid JSON.

### Project Structure
```
json-compare/
  public/
  src/
    components/
      JsonDiff.vue            # Core component (two panes, toolbar, diff)
    assets/
      jsondiffpatch-html.css  # Diff view styles
    App.vue
    main.js
```

### Parity with jsoneditoronline
- Implemented:
  - Two panes; Tree/Code/Text modes; Format/Minify; key sorting; Expand/Collapse; Copy/Swap; Import/Export.
  - Search (via JSONEditor menu), Light/Dark theme, indent setting, synced scroll.
  - Diff view (HTML), URL state sharing (hash compression).
  - JMESPath query, Escape/Unescape, JSON repair.
- Differences / Not included yet:
  - Not pixel-perfect UI/assets/layout (lightweight custom styling for now).
  - Advanced features like history versions, cloud storage/collaboration, multiple sessions/tabs are not included.

### Roadmap
- Pixel-perfect visual and interaction parity (icons, layout, interaction details, shortcuts).
- Diff navigation (previous/next), statistics and filtering.
- Drag & drop import, enhanced clipboard parsing for images/files.
- i18n and accessibility (a11y) improvements.
- Unit/E2E tests, CI build and release pipeline.

### Contributing
1. Fork this repo and create a feature branch: `git checkout -b feature/your-feature`.
2. Develop and make sure `npm run lint` and `npm run build` pass.
3. Commit messages are recommended to follow Conventional Commits: `feat: xxx`, `fix: xxx`, `docs: xxx`, etc.
4. Open a Pull Request with a clear description of the motivation, approach, and impact.

### Issues & Security
- If you encounter issues, please open an Issue with reproduction steps, expected vs actual behavior, and environment info (browser, OS, Node version).
- This is a pure front-end tool and does not send data to remote servers by default. Do not include sensitive/private data in Issues/PRs.

### License
- No explicit open-source license is set yet; all rights reserved by default.
- To enable open-source usage, consider adding a mainstream license such as MIT/Apache-2.0/BSD-3-Clause.
- If preferred, I can submit an MIT License to facilitate community use and contributions.

### Acknowledgements
- Inspiration and interactions: `https://jsoneditoronline.org/`.
- Open-source dependencies: `jsoneditor`, `ace-builds`, `jsondiffpatch`, `lz-string`, `file-saver`, `lodash`, `jmespath`, `jsonrepair`, etc.

### Related Docs
- Vue CLI Config: `https://cli.vuejs.org/config/`
