# FindMyTable

FindMyTable is a mobile-first static web app that lets a guest quickly find
their assigned table, group, or related event information by searching their
name.

The app runs entirely in the browser. It uses HTML, CSS, and vanilla JavaScript:
no framework, no backend, and no build step.

## Structure

```text
/
|-- index.html
|-- README.md
|-- assets/
|   |-- css/
|   |   `-- style.css
|   `-- js/
|       |-- app.js
|       |-- csv.js
|       |-- search.js
|       `-- ui.js
`-- data/
    `-- guests.csv
```

`index.html` is at the repository root so GitHub Pages can serve it directly.
All application paths are relative, for example:

```html
<link rel="stylesheet" href="./assets/css/style.css">
<script type="module" src="./assets/js/app.js"></script>
```

The guest list is loaded with:

```js
fetch("./data/guests.csv")
```

This keeps the app compatible with GitHub Pages project URLs such as
`https://username.github.io/repository-name/`.

## Guest CSV Format

The file `data/guests.csv` must contain the `nom_affiche` and `groupe` columns.

```csv
nom_affiche,groupe
Alice Dupont,Table 1
Hugo Martin,Table 3
Emma Leroy,Table 2
```

Supported rules:

- empty lines are ignored;
- quoted values are accepted;
- required columns are checked;
- structural errors are shown clearly.

Extra columns can be added later. The parser already preserves them internally,
but the current interface displays only the name and group.

## Replace The Guest List

Edit `data/guests.csv` directly in the repository.

After each redeployment, every visitor loads the same published CSV file from
GitHub Pages. No manual import and no browser-stored guest data are required.

## Test Locally

You can open `index.html` directly in a browser to inspect the page shell.

For a full functional test, including loading `data/guests.csv` with `fetch()`,
serve the project over HTTP:

```bash
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

Some browsers block `fetch()` from local `file://` pages, so the local server is
the recommended test method.

## Déploiement GitHub Pages

1. Push the project to GitHub.
2. Open the repository settings.
3. Open **Pages**.
4. Choose the `main` branch.
5. Choose `/ (root)`, the repository root folder.
6. Save.
7. Wait for GitHub to generate the GitHub Pages URL.

The app is ready to run from the generated public URL, including project
sub-paths such as:

```text
https://username.github.io/repository-name/
```
