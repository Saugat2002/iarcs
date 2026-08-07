# iARCS project page

Static project page based on the [Nerfies](https://github.com/nerfies/nerfies.github.io) template.

## Deploy on GitHub Pages

```bash
# create a repo (e.g. iarcs) on GitHub, then:
cd iarcs-webpage
git init && git add . && git commit -m "iARCS project page"
git branch -M main
git remote add origin https://github.com/Saugat2002/iarcs.git
git push -u origin main
```
Then: repo → **Settings → Pages → Source: main / (root)**.
Live at `https://Saugat2002.github.io/iarcs/`.

Preview locally with `python3 -m http.server 8000` then open http://localhost:8000.

## Placeholders to replace

Search the source for `TODO`, `Saugat2002`, `XXXX.XXXXX` and `placeholder_`.

| Where | What | File |
|---|---|---|
| Header links | arXiv id, Code repo, Data, Video URLs | `index.html` |
| Overview Video | YouTube embed or `static/videos/teaser.mp4` | `static/images/placeholder_video_poster.png` |
| Generated Scenes carousel | 4 top-down renders | `static/images/placeholder_carousel{1..4}.png` |
| Baseline vs. iARCS | matched pair, same floor plan | `static/images/placeholder_compare_{before,after}.png` |
| Social preview | 1200x630 og:image | `index.html` meta tags |
| BibTeX | arXiv id | `index.html` |

Renders for the carousel and comparison pair can be taken from
`~/Downloads/iarcs_renders/` (500 top-down PNGs per model).

## Real assets already wired in

`teaser.png`, `method.png`, `prompt_reasoning.png`, `qualitative1.png`,
`qualitative2.png`, `improvement_barplot.png` — all converted from the paper
figures. `static/pdfs/iarcs_paper.pdf` is the built arXiv PDF.

Result tables are hand-written HTML (not images), so they stay legible on mobile
and are selectable/searchable.
