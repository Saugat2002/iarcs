# iARCS project page

Project page for **iARCS: Iterative Agentic RL for Controllable 3D Scene Generation** ([arXiv:2608.06161](https://arxiv.org/abs/2608.06161)).

Live at **https://saugat2002.github.io/iarcs/**

## Edit

Plain HTML/CSS, no build step.

- `index.html`: the whole page
- `static/css/index.css`: styles
- `static/images/`: figures (WebP)
- `llms.txt`, `robots.txt`, `sitemap.xml`: search and LLM metadata

Preview locally:

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

## Deploy

Push to `main`. GitHub Pages rebuilds automatically.

After changing `index.css` or `index.js`, bump the `?v=` number on their links in `index.html` so browsers fetch the new file.
