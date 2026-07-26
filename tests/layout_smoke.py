#!/usr/bin/env python3
"""Pruebas responsive básicas de las pantallas principales con Chromium."""
from __future__ import annotations

import asyncio
import os
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("NO EJECUTABLE: instala Playwright para ejecutar tests/layout_smoke.py")
    raise SystemExit(2)

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "css/styles.css").read_text(encoding="utf-8")
HTML = HTML.replace('<link rel="stylesheet" href="css/styles.css">', f"<style>{CSS}</style>")
HTML = HTML.replace('<script src="js/data.js" defer></script>', "")
HTML = HTML.replace('<script src="js/app.js" defer></script>', "")
DATA_JS = (ROOT / "js/data.js").read_text(encoding="utf-8")
APP_JS = (ROOT / "js/app.js").read_text(encoding="utf-8")
CHROMIUM = os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium")
WIDTHS = (320, 375, 680, 920, 1440)

STORAGE = """
(() => {
  const store = new Map();
  Object.defineProperty(window, 'localStorage', {configurable: true, value: {
    getItem(key) { return store.has(String(key)) ? store.get(String(key)) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); },
    key(index) { return [...store.keys()][index] ?? null; },
    get length() { return store.size; }
  }});
  window.confirm = () => true;
})();
"""

CHECK_LAYOUT = """
() => {
  const viewport = document.documentElement.clientWidth;
  const active = document.querySelector('.screen--active');
  const controls = [...active.querySelectorAll('button, input, select, textarea, a[href]')]
    .filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    });
  const offenders = controls
    .filter(node => {
      const rect = node.getBoundingClientRect();
      return rect.left < -1 || rect.right > viewport + 1;
    })
    .map(node => ({tag: node.tagName, id: node.id, text: (node.textContent || '').trim().slice(0, 40), rect: node.getBoundingClientRect().toJSON()}));
  const targetRect = node => {
    if (node.matches('input[type="checkbox"], input[type="radio"]') && node.closest('label')) {
      return node.closest('label').getBoundingClientRect();
    }
    return node.getBoundingClientRect();
  };
  const tinyTargets = controls
    .filter(node => {
      const rect = targetRect(node);
      return rect.width < 44 || rect.height < 44;
    })
    .map(node => ({tag: node.tagName, id: node.id, text: (node.textContent || node.getAttribute('aria-label') || node.name || '').trim().slice(0, 40), rect: targetRect(node).toJSON()}));
  const unlabeled = controls
    .filter(node => !(node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent || node.value || node.name || '').trim())
    .map(node => node.outerHTML.slice(0, 140));
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const visibleHiddenFocusables = [...document.querySelectorAll('[aria-hidden="true"] button, [aria-hidden="true"] input, [aria-hidden="true"] select, [aria-hidden="true"] textarea, [aria-hidden="true"] a[href]')]
    .filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }).length;
  return {
    viewport,
    scrollWidth: document.documentElement.scrollWidth,
    active: active?.id,
    offenders,
    tinyTargets,
    unlabeled,
    duplicateIds,
    visibleHiddenFocusables
  };
}
"""


async def check(page, label: str) -> None:
    result = await page.evaluate(CHECK_LAYOUT)
    assert result["scrollWidth"] <= result["viewport"] + 1, f"{label}: overflow horizontal {result}"
    assert not result["offenders"], f"{label}: controles recortados {result['offenders']}"
    assert not result["tinyTargets"], f"{label}: objetivos táctiles menores de 44 px {result['tinyTargets']}"
    assert not result["unlabeled"], f"{label}: controles sin nombre accesible {result['unlabeled']}"
    assert not result["duplicateIds"], f"{label}: ids duplicados {result['duplicateIds']}"
    assert result["visibleHiddenFocusables"] == 0, f"{label}: controles visibles dentro de aria-hidden"


async def run() -> None:
    checks = 0
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, executable_path=CHROMIUM, args=["--no-sandbox"])
        for width in WIDTHS:
            page = await browser.new_page(viewport={"width": width, "height": 800}, bypass_csp=True)
            errors: list[str] = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.set_content(HTML, wait_until="domcontentloaded")
            await page.add_script_tag(content=STORAGE)
            await page.add_script_tag(content=DATA_JS)
            await page.add_script_tag(content=APP_JS)

            await check(page, f"{width}px menú")
            checks += 1
            await page.keyboard.press("Tab")
            assert await page.locator(".skip-link").evaluate("node => node === document.activeElement"), f"{width}px: el enlace de salto no recibe el primer foco"
            await page.locator('[data-action="settings"]').click()
            await page.wait_for_timeout(350)
            await check(page, f"{width}px opciones")
            checks += 1
            await page.locator('.screen--active [data-back="menu"]').click()
            await page.wait_for_timeout(350)
            await page.locator('[data-action="new-game"]').click()
            await check(page, f"{width}px personajes")
            checks += 1
            await page.locator('[data-character="lucia"]').click()
            await check(page, f"{width}px mapa")
            checks += 1
            await page.locator('[data-case="block404"]').click()
            await check(page, f"{width}px juego")
            checks += 1

            assert not errors, f"{width}px: {errors}"
            await page.close()
        await browser.close()
    print(f"LAYOUT SMOKE: {checks} COMPROBACIONES RESPONSIVE Y DE ACCESIBILIDAD SUPERADAS")


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except AssertionError as error:
        import traceback
        traceback.print_exc()
        print(f"LAYOUT SMOKE FALLIDO: {error}")
        raise SystemExit(1)
