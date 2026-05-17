# Logica Sudoku

Logica Sudoku is a browser-based Sudoku learning app that turns a puzzle into a visual reasoning environment. It helps users learn Sudoku, probability, entropy, candidate elimination, and constraint propagation by showing how every move changes the search space.

## Live Demo

After GitHub Pages is enabled, the app will be available at:

```text
https://suresh33661.github.io/Sudoku/
```

## What This Repository Contains

```text
Sudoku/
+-- index.html   # Complete Sudoku app: HTML, CSS, and JavaScript
+-- README.md    # Project explanation and GitHub Pages instructions
```

The project is a static website. It does not need a backend, database, build step, or package installation.

## How The App Works

The app loads a Sudoku board from the puzzle library inside `index.html`. Each difficulty level has:

- a starting puzzle, stored as `given`
- a completed answer grid, stored as `solution`
- a constraint engine that calculates legal candidates for every empty cell
- visual tools that show how choices reduce uncertainty

Users can select a cell, choose a number, toggle notes, reset the board, change difficulty, and explore hypothetical moves in sandbox mode.

## Learning Probability Through Sudoku

Sudoku is useful for learning probability because each empty cell begins with several possible values. As the board fills in, the possible values shrink.

This app helps users see that process through:

- **Candidates**: the possible numbers that can still fit in a cell.
- **Entropy**: a measure of uncertainty. A cell with many candidates has higher entropy; a cell with one candidate has low entropy.
- **Puzzle entropy**: the total uncertainty across the whole board.
- **Average options**: the average number of candidates remaining in empty cells.
- **Combination space**: rows with more uncertainty appear as higher-complexity regions.
- **Influence**: shows how a cell is connected to other cells through row, column, and box constraints.
- **Propagation**: shows how placing one number removes options from other cells.

In simple terms: every move is like new evidence. Good moves reduce uncertainty and make the puzzle easier to solve.

## How To Use The App

1. Open the app in a browser.
2. Pick a difficulty: Easy, Medium, Hard, or Expert.
3. Click a cell and choose a number.
4. Use **Notes** to mark possible candidates without committing to an answer.
5. Use **Entropy** to see which cells are still uncertain.
6. Use **Influence** to see how a selected cell affects its peers.
7. Use **Sandbox** to test a guess without permanently changing the board.
8. Watch the side panels to understand candidates, entropy, branching, and chain reactions.

The app now uses a learning-first input flow: select a cell first, then choose a number. Wrong answers are not placed on the board; instead, the reasoning coach explains the mistake and counts it toward a 5-mistake practice limit.

## Make It Live With GitHub Pages

Because this is a static site with an `index.html` file in the repository root, GitHub Pages can publish it directly.

1. Go to the GitHub repository:

   ```text
   https://github.com/suresh33661/Sudoku
   ```

2. Open **Settings**.
3. In the left sidebar, open **Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Under **Branch**, choose:

   ```text
   master
   ```

6. Set the folder to:

   ```text
   / (root)
   ```

7. Click **Save**.
8. Wait one or two minutes for GitHub to deploy the site.
9. Visit:

   ```text
   https://suresh33661.github.io/Sudoku/
   ```

If the page does not appear immediately, refresh after a minute. GitHub Pages sometimes takes a short time to finish the first deployment.

## Updating The Live Site

Whenever you change `index.html` or `README.md`, push the changes to GitHub:

```bash
git add index.html README.md
git commit -m "Update Sudoku learning app"
git push origin master
```

GitHub Pages will automatically update the live website after the push.

## Run Locally

No installation is required. Open `index.html` directly in a browser, or serve the folder with any static file server.

Example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project Goal

The goal of this project is not only to solve Sudoku, but to help learners understand how reasoning works. The app turns hidden logic into visible feedback so users can connect Sudoku moves with probability, uncertainty, and constraint-based thinking.
