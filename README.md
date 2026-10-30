# Practicals Website

A simple website to share your college practical assignments. No login or password — open the link and start reading. Deploy on Vercel in minutes.

## Features

- 📁 Organize by subjects (Java, DL, DBMS, etc.)
- 📄 Preview text files (`.txt`, `.java`, `.py`, `.md`, …) right in the browser
- 📓 Render Jupyter notebooks (`.ipynb`) cell by cell
- 📋 Copy code in one click — per file, per notebook cell, or the whole notebook
- ⬇️ Download individual files or a whole folder as a ZIP
- 🌙 Dark mode and a clean, responsive UI
- 🚀 Easy to deploy on Vercel

## Setup

### 1. Add your assignments

Put your files in the `content/` directory organized by subjects:

```
content/
├── Java/
│   ├── Assign1.txt
│   ├── Assign2.txt
│   └── Assign3.java
├── DL/
│   ├── Practical1.ipynb
│   └── Practical2.ipynb
├── DBMS/
│   └── ...
└── Others/
    └── ...
```

You can create as many subject folders as you need, and you can nest folders inside subjects.

**Recommended formats**

- Write each practical as a plain `.txt` file so it can be previewed and copied easily.
- Use `.ipynb` (Jupyter notebook) files for DL practicals — the site shows every cell and lets you copy code per cell or all at once.

### 2. Install & run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy to Vercel

1. Push this code to GitHub/GitLab
2. Import the repo on [vercel.com](https://vercel.com)
3. Deploy

That's it! Share the URL with anyone who needs the practicals.

## Notes

- Files are committed to the repo, so they'll be deployed with your site
- Click a text/notebook file to open its preview; use the clipboard icon on any row to copy its code directly
- Non-text files (PDFs, images, ZIPs, …) are available as downloads
