# X Cleaner

A Chrome extension that cleans up your X (Twitter) account one item at a time. It adds a small panel to x.com with a live counter, and it can:

- unlike tweets
- remove bookmarks
- undo reposts
- delete your own posts
- unfollow accounts

It looks like part of X, follows your theme (Light, Dim or Lights out) and keeps working when you switch to another tab.

## Install

There is no store listing, so you load it by hand. It takes about a minute.

1. Download this repo (green **Code** button, then **Download ZIP**) and unzip it. You can also clone it.
2. Open `chrome://extensions` in Chrome (or any Chromium browser such as Edge or Brave).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the folder that contains `manifest.json`.
5. Open x.com and reload the tab (F5). The panel appears on the right.

If you see "Manifest file is missing or unreadable", you picked the wrong folder. Open the folder you selected: you should see `manifest.json` directly inside it, not another folder.

## How to use it

Pick what you want to clean with the icons at the top of the panel, open the matching page on X, and press **Start**.

| Icon | Mode | Open this page first |
| --- | --- | --- |
| Heart | Unlike tweets | Your profile, **Likes** tab |
| Bookmark | Remove bookmarks | `x.com/i/bookmarks` |
| Repost | Undo reposts | Your profile |
| Trash | Delete posts | Your profile |
| Person | Unfollow accounts | Your profile, **Following** list |

If you are on the wrong page, the main button turns into a shortcut that takes you there.

The panel shows how many items are done, how many are left on the page, the elapsed time and your pace. It scrolls on its own to load more items and says **All done** when nothing is left.

### The bar

| Bar | Meaning |
| --- | --- |
| Blue, pulsing | Working |
| Yellow, blinking | Paused (a short break, or X is refusing actions) |
| Red, still | You stopped it |
| Green | Finished |

### Speed

- **Careful**: slowest, least likely to run into limits.
- **Steady**: the default.
- **Quick**: fastest, most likely to get blocked.

Every 25 to 40 actions it takes a short break. If X refuses several actions in a row, it waits 60 seconds and tries again.

### Deleting posts and unfollowing

These two can't be undone, so they ask twice. The first press turns the button red, and you have 8 seconds to press again.

When deleting posts, only posts written by your own account are touched. Reposts of other people's tweets are skipped. The **Keep these posts** section lets you protect some posts:

- posts that were reposted (by you, or anyone: the repost button shows a count)
- posts you bookmarked
- posts containing certain words (comma separated, not case sensitive)

The first two are on by default. Your choices are saved in the browser.

### Moving, minimizing, closing

- Drag the panel by its header to move it.
- The **−** button shrinks it to a small counter. You can drag that too, and click it to expand.
- The **X** button closes it and stops any running job. Click the extension's icon in the Chrome toolbar to bring it back.

### Working in the background

While running, the page is kept awake (an inaudible audio stream and a held lock) and X is told the tab is always visible, so new items keep loading when you switch tabs. For the best results:

- keep the X tab open (a separate window works well)
- don't minimize that window or let the computer sleep
- in Chrome settings, under Performance, add `x.com` to the sites that always stay active, so Memory Saver doesn't put the tab to sleep

## Troubleshooting

**The panel doesn't show up.** Reload the X tab. Chrome does not add an extension to tabs that were already open.

**It says it found 0 items.** Make sure you're on the right page for the mode (see the table) and scroll a little so items load.

**Nothing happens, or it stops with a yellow bar.** X may be limiting your account for a while. Wait, switch to **Careful**, and try again later.

**It stopped working after an X update.** X changes its page structure from time to time and the extension finds buttons by their internal names. Open an issue and say which mode broke.

## Good to know

- This is an unofficial tool. It is not affiliated with or endorsed by X Corp.
- It works by clicking the buttons on the page for you. Automating actions may go against X's rules, and heavy use (especially unfollowing and deleting) can get an account temporarily limited. You use it at your own risk.
- It only runs on x.com and twitter.com, and it doesn't send your data anywhere. There is no server, no analytics and no network request. The only thing it stores is your keep rules, in the browser's local storage.

## Files

| File | What it does |
| --- | --- |
| `manifest.json` | Extension setup |
| `content.js` | The panel and all the cleaning logic |
| `stealth.js` | Keeps X's timeline loading in a background tab |
| `background.js` | Reopens the panel when you click the toolbar icon |

## License

MIT, see [LICENSE](LICENSE).
