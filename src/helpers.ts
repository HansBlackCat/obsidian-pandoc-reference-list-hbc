import { FileSystemAdapter, htmlToMarkdown } from 'obsidian';
import { shellPath } from 'shell-path';
import which from 'which';

export function getVaultRoot() {
  const adapter = app.vault.adapter;
  if (adapter instanceof FileSystemAdapter) {
      return adapter.getBasePath();
  }
  return null;

  // This is a desktop only plugin, so assume adapter is FileSystemAdapter
  // return (app.vault.adapter as FileSystemAdapter).getBasePath();
}

export async function getPandocPath() {
    let whichPandoc: string | null = null;
    try {
        whichPandoc = await which('pandoc');
    } catch (e) {
            throw new Error(`Error finding pandoc. Please set the path manually in the plugin settings.\n${e.message}`);
    }
    return whichPandoc;
}

export function copyElToClipboard(el: HTMLElement) {
  require('electron').clipboard.write({
    html: el.outerHTML,
    text: htmlToMarkdown(el.outerHTML),
  });
}

export class PromiseCapability<T> {
  settled = false;
  promise: Promise<T>;
  resolve: (data: T) => void;
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (data) => {
        resolve(data);
        this.settled = true;
      };

      this.reject = (reason) => {
        reject(reason);
        this.settled = true;
      };
    });
  }
}

export async function fixPath() {
  if (process.platform === 'win32') {
    return;
  }

  try {
    const path = await shellPath();

    process.env.PATH =
      path ||
      [
        './node_modules/.bin',
        '/.nodebrew/current/bin',
        '/usr/local/bin',
        process.env.PATH,
      ].join(':');
  } catch (e) {
    console.error(e);
  }
}

export function areSetsEqual<T>(as: Set<T>, bs: Set<T>) {
  if (as.size !== bs.size) return false;
  for (const a of as) if (!bs.has(a)) return false;
  return true;
}
