#!/usr/bin/env python3
"""Pruebas de humo de la interfaz real mediante Chromium y Playwright."""
from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("NO EJECUTABLE: instala Playwright para ejecutar tests/ui_smoke.py")
    raise SystemExit(2)

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
HTML = HTML.replace('<script src="js/data.js" defer></script>', "")
HTML = HTML.replace('<script src="js/modules/premium-art.js" defer></script>', "")
HTML = HTML.replace('<script src="js/modules/premium-audio.js" defer></script>', "")
HTML = HTML.replace('<script src="js/modules/nocturne-ui.js" defer></script>', "")
HTML = HTML.replace('<script src="js/app.js" defer></script>', "")
HTML = HTML.replace('<link rel="stylesheet" href="css/styles.css">', "")
HTML = HTML.replace('<link rel="stylesheet" href="css/premium.css">', "")
DATA_JS = (ROOT / "js/data.js").read_text(encoding="utf-8")
PREMIUM_ART_JS = (ROOT / "js/modules/premium-art.js").read_text(encoding="utf-8")
PREMIUM_AUDIO_JS = (ROOT / "js/modules/premium-audio.js").read_text(encoding="utf-8")
NOCTURNE_UI_JS = (ROOT / "js/modules/nocturne-ui.js").read_text(encoding="utf-8")
APP_JS = (ROOT / "js/app.js").read_text(encoding="utf-8")
GAME_DATA = json.loads(DATA_JS.strip()[len("window.N404_DATA = "):-1])
DATA_VERSION = GAME_DATA["version"]
CHROMIUM = os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium")


def storage_polyfill(initial: dict[str, str] | None = None) -> str:
    payload = json.dumps(initial or {}, ensure_ascii=False)
    return f"""
(() => {{
  const store = new Map(Object.entries({payload}));
  Object.defineProperty(window, 'localStorage', {{configurable: true, value: {{
    getItem(key) {{ return store.has(String(key)) ? store.get(String(key)) : null; }},
    setItem(key, value) {{ store.set(String(key), String(value)); }},
    removeItem(key) {{ store.delete(String(key)); }},
    clear() {{ store.clear(); }},
    key(index) {{ return [...store.keys()][index] ?? null; }},
    get length() {{ return store.size; }}
  }}}});
  window.__storageDump = () => Object.fromEntries(store);
  window.confirm = () => true;
}})();
"""


async def boot(browser, initial: dict[str, str] | None = None):
    page = await browser.new_page(viewport={"width": 1280, "height": 800}, bypass_csp=True)
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    await page.set_content(HTML, wait_until="domcontentloaded")
    await page.add_script_tag(content=storage_polyfill(initial))
    await page.add_script_tag(content=DATA_JS)
    await page.add_script_tag(content=PREMIUM_ART_JS)
    await page.add_script_tag(content=PREMIUM_AUDIO_JS)
    await page.add_script_tag(content=NOCTURNE_UI_JS)
    await page.add_script_tag(content=APP_JS)
    if await page.locator('#enter-signal').count() and await page.locator('#enter-signal').is_visible():
        await page.locator('#enter-signal').click()
    return page, errors




async def begin_new_game(page):
    await page.locator('[data-action="new-game"]').click()
    await page.locator('#prologue-next').click()
    await page.locator('#prologue-next').click()
    await page.locator('#prologue-next').click()

async def create_save(browser) -> tuple[dict[str, str], dict]:
    page, errors = await boot(browser)
    await begin_new_game(page)
    await page.locator('[data-character="lucia"]').click()
    assert await page.locator('[data-case]').count() == 5
    dump = await page.evaluate("window.__storageDump()")
    save = json.loads(dump["nightmare404.save.v1"])
    assert not errors, errors
    await page.close()
    return dump, save


async def run() -> None:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True, executable_path=CHROMIUM, args=["--no-sandbox"])

        page, errors = await boot(browser)
        assert await page.locator('#continue-btn').is_disabled()
        await begin_new_game(page)
        assert await page.locator('[data-character]').count() == 3
        await page.wait_for_function("document.activeElement && document.activeElement.id === 'character-title'", timeout=3000)
        assert await page.evaluate("document.activeElement.id") == "character-title"
        await page.locator('[data-character="lucia"]').click()
        assert await page.locator('[data-case]').count() == 5
        await page.locator('[data-case="block404"]').click()
        await page.locator('#case-prelude-enter').click()
        await page.locator('#explore-btn').click()
        assert await page.locator('#game-dialog [data-event-choice]').count() >= 2
        pending_title = await page.locator('#dialog-title').inner_text()
        dump = await page.evaluate("window.__storageDump()")
        assert json.loads(dump["nightmare404.save.v1"])["pendingEventId"]
        await page.keyboard.press("Escape")
        assert await page.locator('#game-dialog').evaluate("element => element.open"), "Los eventos obligatorios no deben cerrarse con Escape"
        assert not errors, errors
        await page.close()

        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        assert await page.locator('#game-dialog').evaluate("element => element.open")
        assert await page.locator('#dialog-title').inner_text() == pending_title
        assert not errors, errors
        await page.close()

        dump, save = await create_save(browser)
        save["currentCaseId"] = "block404"
        save["caseProgress"]["block404"] = {
            "clues": 1, "explored": 1, "rests": 0, "eventDeck": ["b-vhs"], "visited": [],
            "bossDefeated": False, "completed": False, "noRest": True,
        }
        save["pendingCombat"] = {
            "enemyId": "worker", "hp": 5, "attackDebuff": 2,
            "meta": {"boss": False, "specialUsed": False, "guard": 1, "boost": 0},
        }
        dump["nightmare404.save.v1"] = json.dumps(save)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        assert "5/" in await page.locator('.combat-stats span').first.inner_text()
        assert "Combate restaurado" in await page.locator('.outcome').inner_text()
        await page.locator('[data-combat="item"]').click()
        assert await page.locator('#combat-items-back').is_visible()
        await page.keyboard.press("Escape")
        assert await page.locator('.combat-stats').is_visible()
        assert not errors, errors
        await page.close()

        dump, save = await create_save(browser)
        save["completedCases"] = ["block404", "hospital", "forest", "mansion"]
        save["currentCaseId"] = "nexus"
        save["caseProgress"]["nexus"] = {
            "clues": 5, "explored": 5, "rests": 0, "eventDeck": [], "visited": [],
            "bossDefeated": True, "completed": False, "noRest": True,
        }
        save["seals"] = 2
        save["knowledge"] = 2
        save["inventory"] = ["universeShard"]
        dump["nightmare404.save.v1"] = json.dumps(save)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        assert await page.locator('#dialog-title').inner_text() == "El Soñador abre los ojos"
        assert not errors, errors
        await page.close()

        dump, save = await create_save(browser)
        save["currentCaseId"] = "caso-inexistente"
        payload = {"format": "nightmare404-backup-v1", "save": save, "profile": {}, "settings": {}}
        page, errors = await boot(browser)
        await page.locator('[data-action="settings"]').click()
        await page.locator('#data-transfer').fill(json.dumps(payload))
        await page.locator('#import-data').click()
        assert "IMPORTACIÓN FALLIDA" in await page.locator('#toast').inner_text()
        assert await page.locator('#continue-btn').is_disabled()
        assert not errors, errors
        await page.close()

        malicious = '<img src=x onerror="window.__xss=1">'
        payload = {
            "format": "nightmare404-backup-v1", "save": None,
            "profile": {"runs": malicious, "failures": -4, "events": ["b-vhs", malicious]},
            "settings": {"sound": "sí", "crt": False},
        }
        page, errors = await boot(browser)
        await page.locator('[data-action="settings"]').click()
        await page.locator('#data-transfer').fill(json.dumps(payload))
        await page.locator('#import-data').click()
        await page.locator('.screen--active [data-back="menu"]').click()
        await page.locator('[data-action="achievements"]').click()
        assert not await page.evaluate("Boolean(window.__xss)")
        assert "Campañas iniciadas: 0" in await page.locator('#info-content > p').inner_text()
        assert not errors, errors
        await page.close()

        dump, save = await create_save(browser)
        save["currentCaseId"] = "hospital"
        save["sanity"] = 20
        save["inventory"] = ["sedative"]
        save["caseProgress"]["hospital"] = {
            "clues": 0, "explored": 0, "rests": 0, "eventDeck": ["h-reception"], "visited": [],
            "bossDefeated": False, "completed": False, "noRest": True,
        }
        dump["nightmare404.save.v1"] = json.dumps(save)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        await page.locator('[data-use-item="sedative"]').click()
        saved = json.loads((await page.evaluate("window.__storageDump()"))["nightmare404.save.v1"])
        assert saved["sanity"] == 46
        assert saved["nextAttackPenalty"] == 4
        assert "sedative" not in saved["inventory"]
        assert not errors, errors
        await page.close()

        # Migración de una partida compatible de la versión 1.0.0.
        dump, save = await create_save(browser)
        save["version"] = "1.0.0"
        dump["nightmare404.save.v1"] = json.dumps(save)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        migrated = json.loads((await page.evaluate("window.__storageDump()"))["nightmare404.save.v1"])
        assert migrated["version"] == DATA_VERSION
        assert not errors, errors
        await page.close()

        # Una partida de la v1.1.0 debe actualizar versión sin recalibrar sus estadísticas.
        dump, save = await create_save(browser)
        save.update({"version": "1.1.0", "health": 37, "maxHealth": 91, "sanity": 41, "maxSanity": 97, "power": 13})
        dump["nightmare404.save.v1"] = json.dumps(save)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        migrated = json.loads((await page.evaluate("window.__storageDump()"))["nightmare404.save.v1"])
        assert migrated["version"] == DATA_VERSION
        assert (migrated["health"], migrated["maxHealth"], migrated["sanity"], migrated["maxSanity"], migrated["power"]) == (37, 91, 41, 97, 13)
        assert not errors, errors
        await page.close()

        # Copia descargable y carga desde archivo JSON.
        dump, _ = await create_save(browser)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="settings"]').click()
        await page.locator('#export-data').click()
        exported_file_payload = await page.locator('#data-transfer').input_value()
        async with page.expect_download() as download_info:
            await page.locator('#download-backup').click()
        download = await download_info.value
        assert download.suggested_filename.endswith('.json')
        await page.locator('#backup-file').set_input_files({
            "name": "nightmare-backup.json",
            "mimeType": "application/json",
            "buffer": exported_file_payload.encode("utf-8")
        })
        await page.wait_for_function("document.getElementById('toast').textContent.includes('COPIA CARGADA')")
        assert "COPIA CARGADA E IMPORTADA" in await page.locator('#toast').inner_text()
        assert not errors, errors
        await page.close()

        # La opción de anomalías puede desactivarse sin activar reducción de movimiento.
        page, errors = await boot(browser)
        await page.locator('[data-action="settings"]').click()
        await page.locator('input[name="anomalies"]').uncheck()
        await page.locator('#settings-form button[type="submit"]').click()
        saved_settings = json.loads((await page.evaluate("window.__storageDump()"))["nightmare404.settings.v1"])
        assert saved_settings["anomalies"] is False
        assert saved_settings["reducedMotion"] is False
        assert not errors, errors
        await page.close()

        # El mezclador conserva canales independientes y se persiste.
        page, errors = await boot(browser)
        await page.locator('[data-action="settings"]').click()
        await page.locator('input[name="audioMusic"]').uncheck()
        await page.locator('input[name="audioFx"]').uncheck()
        await page.locator('#settings-form button[type="submit"]').click()
        saved_settings = json.loads((await page.evaluate("window.__storageDump()"))["nightmare404.settings.v1"])
        assert saved_settings["audioMusic"] is False
        assert saved_settings["audioFx"] is False
        assert saved_settings["audioAmbient"] is True
        assert saved_settings["audioUi"] is True
        assert not errors, errors
        await page.close()

        # Exportación e importación válida de una copia completa.
        dump, _ = await create_save(browser)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="settings"]').click()
        await page.locator('#export-data').click()
        exported = await page.locator('#data-transfer').input_value()
        exported_payload = json.loads(exported)
        assert exported_payload["format"] == "nightmare404-backup-v1"
        assert exported_payload["save"]["characterId"] == "lucia"
        assert not errors, errors
        await page.close()

        page, errors = await boot(browser)
        await page.locator('[data-action="settings"]').click()
        await page.locator('#data-transfer').fill(exported)
        await page.locator('#import-data').click()
        await page.locator('.screen--active [data-back="menu"]').click()
        assert await page.locator('#continue-btn').is_enabled()
        assert not errors, errors
        await page.close()

        # Escape cierra la pausa, pero no salta decisiones obligatorias.
        dump, _ = await create_save(browser)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        await page.locator('#map-pause').click()
        assert await page.locator('#resume-game').is_visible()
        await page.keyboard.press("Escape")
        assert not await page.locator('#game-dialog').evaluate("element => element.open")
        assert not errors, errors
        await page.close()

        # Sala de transmisiones: accesible desde menú y controles de preview reales.
        page, errors = await boot(browser)
        await page.locator('[data-action="transmissions"]').click()
        assert await page.locator('#info-title').inner_text() == "Sala de transmisiones"
        assert await page.locator('[data-transmission-scene]').count() == 5
        assert await page.locator('#transmission-stop').is_visible()
        assert not errors, errors
        await page.close()

        # Flujo completo de un misterio: jefe, resolución, cierre y regreso al mapa.
        dump, save = await create_save(browser)
        save["currentCaseId"] = "block404"
        save["health"] = 500
        save["maxHealth"] = 500
        save["power"] = 50
        save["inventory"] = ["fuse"]
        save["caseProgress"]["block404"] = {
            "clues": 4, "explored": 4, "rests": 0, "eventDeck": [], "visited": [],
            "bossDefeated": False, "completed": False, "noRest": True,
        }
        dump["nightmare404.save.v1"] = json.dumps(save)
        page, errors = await boot(browser, dump)
        await page.locator('[data-action="continue"]').click()
        assert await page.locator('#confront-btn').is_enabled()
        await page.locator('#confront-btn').click()
        await page.locator('#fight-boss').click()
        boss = next(entry for entry in GAME_DATA["bosses"] if entry["id"] == "elevator")
        weak_item = GAME_DATA["items"][boss["weakItem"]]
        assert f"{boss['hp'] - weak_item['value']}/{boss['hp']}" in await page.locator('.combat-stats span').first.inner_text()
        await page.locator('[data-combat="attack"]').click()
        assert "MISTERIO RESUELTO" in await page.locator('.event-kicker').inner_text()
        await page.locator('[data-resolution="0"]').click()
        assert "EXPEDIENTE CERRADO" in await page.locator('.event-kicker').inner_text()
        await page.locator('#resolution-map').click()
        card = page.locator('article:has([data-case="block404"])')
        assert "MISTERIO RESUELTO" in await card.inner_text()
        final_save = json.loads((await page.evaluate("window.__storageDump()"))["nightmare404.save.v1"])
        assert "block404" in final_save["completedCases"]
        assert final_save["currentCaseId"] is None
        assert not errors, errors
        await page.close()

        await browser.close()
        print("UI SMOKE: 12 ESCENARIOS SUPERADOS")


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except AssertionError as error:
        import traceback
        traceback.print_exc()
        print(f"UI SMOKE FALLIDO: {error}")
        raise SystemExit(1)
