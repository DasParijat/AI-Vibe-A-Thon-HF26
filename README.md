# Launchpad

A static frontend with course-based installation guides for Marist computer science students.

Open `index.html` in a browser, or serve this directory for clipboard support:

```powershell
python -m http.server 5173
```

Visit http://localhost:5173. No package installation or build is needed. Google Fonts is optional and falls back to system fonts when offline.

The app includes Introduction to Programming (CMPT 120), Software Development I (CMPT 220), and Game Design & Programming I (CMPT 414). Software selections are suggested examples rather than confirmed requirements for every section. Consult the current syllabus for required versions.

Choose Windows, macOS, or Ubuntu Linux to view platform-specific instructions. Search by course, language, or tool, filter courses by category, and mark verified installations complete. Progress is stored in the current browser separately for each operating system. Shared tools count toward every course using them.

## Files

- `index.html` defines navigation, the course dashboard, and the accessible guide dialog.
- `styles.css` provides the responsive layout and visual styles.
- `guides.js` contains the course catalog, platform instructions, verification commands, and official sources.
- `app.js` handles routing, searching, filtering, guide dialogs, command copying, and saved progress.

## Updating guides

Edit `courses` and `tools` in `guides.js`. Each tool needs a name, tag, description, source URL, documentation URL, note, and a step array for each supported operating system. Keep tool identifiers stable to preserve existing progress.

## Sources

- [Marist Computer Science](https://www.marist.edu/computer-science)
- [Marist undergraduate catalog, 2023–2024](https://www.marist.edu/documents/d/guest/undergraduate-2023-2-)
- Official Python, Git, Microsoft, Adoptium, CMake, and SFML documentation linked inside each guide

The SFML starter instructions use SFML 3. Classes using SFML 2 should use their assigned starter and matching documentation.
