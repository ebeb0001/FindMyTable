# FindMyTable

FindMyTable is a mobile-first web app that lets a guest quickly find their
assigned table, group, or related event information by searching their name.

The project runs entirely in the browser: no framework, no backend, and no
required installation. All users read the same guest list from
`data/guests.csv`.

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

## Run The App

The app loads `data/guests.csv` with `fetch()`, so it must be served over HTTP,
even locally.

```bash
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## `data/guests.csv` Format

The file must contain the `nom_affiche` and `groupe` columns.

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

Each redeployment publishes the updated list. On GitHub Pages, all phones and
computers automatically load the same published CSV file, with no manual import
and no browser-stored guest data.

## Behavior

When the page loads, the app fetches `data/guests.csv`, parses it, and keeps the
data in memory for the current session.

Search ignores case, accents, and extra spaces. Suggestions appear after two
characters and are limited to five results.

## GitHub Pages Deployment

1. Push the repository to GitHub.
2. Open `Settings`, then `Pages`.
3. Select the branch to publish, for example `main`.
4. Select the root folder `/`.
5. Save the configuration.

GitHub Pages will serve `index.html` directly.
