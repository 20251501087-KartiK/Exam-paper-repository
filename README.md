[README.md](https://github.com/user-attachments/files/34998804/README.md)
# PaperVault — Integrated Frontend Project

This folder combines your uploaded PaperVault HTML/CSS/JavaScript frontend with working browser-side PDF contribution, storage, preview, download, search and filters.

## Run locally
1. Extract the ZIP.
2. Open the folder in Visual Studio Code.
3. Install the **Live Server** extension if needed.
4. Right-click `index.html` → **Open with Live Server**.
5. Use Chrome or Edge for best IndexedDB/PDF preview support.

You can also run a local server from this folder with:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Working features
- Search across title, course, branch, year, exam type and university.
- Filter by course, branch and semester; sort and load more.
- View paper details.
- Upload PDF files (up to 20 MB), save them in browser IndexedDB, preview, download and delete them.
- Uploaded papers appear in the library and remain after refreshing in the same browser profile.
- Responsive layout and mobile navigation retained from your supplied design.

## Important: what your uploaded C++ file is
Your `cpp-reference/endsem terminal.cpp` is a **C++ console application**, not a web server/API backend. It contains console menus, user-role classes and repository logic, but it does not expose HTTP routes for the browser to call. I have preserved it in `cpp-reference/` rather than pretending it is connected to the website.

## Current limitations
This is still a frontend/local-browser integration, not a public multi-user website. Uploaded PDFs are stored only in the browser and device where they were added; they are not shared with other users. Login is a demo message. To make this a true deployed repository, the C++ console logic needs to be converted into an HTTP API (or replaced with a web backend), with a database, authentication, server-side file storage, and admin approval. Do not publish papers unless you have permission to share them.

## Files
- `index.html` — supplied page structure, updated upload copy and fields
- `styles.css` — supplied responsive design
- `script.js` — integrated search, filters, IndexedDB uploads, PDF preview/download/delete
- `cpp-reference/endsem terminal.cpp` — your original C++ console project, preserved
