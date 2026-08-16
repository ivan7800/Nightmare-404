#!/usr/bin/env python3
"""Valida integridad, referencias, contenido y configuración de Nightmare 404."""
from __future__ import annotations

import json
import re
import sys
import struct
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PREFIX = "window.N404_DATA = "
SUPPORTED_ITEM_KINDS = {
    "health", "sanity", "sanityRisk", "signal", "hybridRisk", "battery",
    "guard", "boost", "ward", "sedative", "passive", "evidence", "boss",
}
STARTING_ITEMS = {"flashlight", "medkit", "incense", "salt", "battery"}


class HTMLAuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.lang = ""
        self.has_viewport = False
        self.has_csp = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        if tag == "html":
            self.lang = values.get("lang") or ""
        if tag == "meta" and values.get("name") == "viewport":
            self.has_viewport = True
        if tag == "meta" and values.get("http-equiv", "").lower() == "content-security-policy":
            self.has_csp = True


def load_data() -> dict:
    text = (ROOT / "js/data.js").read_text(encoding="utf-8").strip()
    if not text.startswith(DATA_PREFIX) or not text.endswith(";"):
        raise ValueError("js/data.js no tiene el formato esperado")
    return json.loads(text[len(DATA_PREFIX):-1])


def duplicate_ids(entries: list[dict]) -> set[str]:
    ids = [entry.get("id") for entry in entries]
    return {entry_id for entry_id in ids if entry_id and ids.count(entry_id) > 1}


def relative_luminance(hex_color: str) -> float:
    value = hex_color.lstrip("#")
    channels = [int(value[index:index + 2], 16) / 255 for index in (0, 2, 4)]
    linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    light, dark = sorted((relative_luminance(first), relative_luminance(second)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def png_dimensions(path: Path) -> tuple[int, int] | None:
    try:
        raw = path.read_bytes()[:24]
        if raw[:8] != b"\x89PNG\r\n\x1a\n" or raw[12:16] != b"IHDR":
            return None
        return struct.unpack(">II", raw[16:24])
    except OSError:
        return None


def main() -> int:
    data = load_data()
    errors: list[str] = []

    collections = {
        "characters": data["characters"],
        "cases": data["cases"],
        "events": data["events"],
        "enemies": data["enemies"],
        "bosses": data["bosses"],
        "achievements": data["achievements"],
    }
    for name, entries in collections.items():
        for duplicate in sorted(duplicate_ids(entries)):
            errors.append(f"{name}: identificador duplicado {duplicate}")

    events = {entry["id"]: entry for entry in data["events"]}
    enemies = {entry["id"] for entry in data["enemies"]}
    bosses = {entry["id"] for entry in data["bosses"]}
    items = set(data["items"])
    passives = {entry["passiveKey"] for entry in data["characters"]}
    case_ids = {entry["id"] for entry in data["cases"]}

    referenced_events: set[str] = set()
    referenced_enemies: set[str] = set()
    referenced_bosses: set[str] = set()
    obtainable_items = set(STARTING_ITEMS)

    for case in data["cases"]:
        if not case.get("events") or not case.get("enemies"):
            errors.append(f"{case['id']}: necesita eventos y enemigos")
        for event_id in case["events"]:
            referenced_events.add(event_id)
            if event_id not in events:
                errors.append(f"{case['id']}: evento inexistente {event_id}")
            elif events[event_id].get("case") != case["id"]:
                errors.append(f"{case['id']}: el evento {event_id} declara otro caso")
        for enemy_id in case["enemies"]:
            referenced_enemies.add(enemy_id)
            if enemy_id not in enemies:
                errors.append(f"{case['id']}: enemigo inexistente {enemy_id}")
        referenced_bosses.add(case["boss"])
        if case["boss"] not in bosses:
            errors.append(f"{case['id']}: jefe inexistente {case['boss']}")
        for choice in case.get("resolution", {}).get("choices", []):
            if choice.get("item"):
                obtainable_items.add(choice["item"])

    required_items: set[str] = set()
    for event in data["events"]:
        if event.get("case") not in case_ids:
            errors.append(f"{event['id']}: caso inexistente {event.get('case')}")
        if not event.get("choices"):
            errors.append(f"{event['id']}: evento sin decisiones")
        for choice in event["choices"]:
            passive = choice.get("requiresPassive")
            if passive and passive not in passives:
                errors.append(f"{event['id']}: pasiva inexistente {passive}")
            outcome = choice.get("outcome", {})
            if outcome.get("item"):
                obtainable_items.add(outcome["item"])
            if outcome.get("useItem"):
                required_items.add(outcome["useItem"])
            for key in ("item", "useItem"):
                if outcome.get(key) and outcome[key] not in items:
                    errors.append(f"{event['id']}: objeto inexistente {outcome[key]}")
            if outcome.get("enemy") and outcome["enemy"] not in enemies | bosses:
                errors.append(f"{event['id']}: entidad inexistente {outcome['enemy']}")

    for item_id, item in data["items"].items():
        if item.get("id") != item_id:
            errors.append(f"items: clave {item_id} no coincide con id {item.get('id')}")
        if item.get("kind") not in SUPPORTED_ITEM_KINDS:
            errors.append(f"{item_id}: tipo de objeto no soportado {item.get('kind')}")

    for item_id in sorted(required_items - obtainable_items):
        errors.append(f"objeto requerido pero no obtenible: {item_id}")

    for boss in data["bosses"]:
        weak_item = boss.get("weakItem")
        if weak_item and weak_item not in items:
            errors.append(f"{boss['id']}: debilidad inexistente {weak_item}")
        if weak_item and weak_item not in obtainable_items:
            errors.append(f"{boss['id']}: debilidad no obtenible {weak_item}")

    if set(events) != referenced_events:
        errors.append(f"eventos sin caso: {sorted(set(events) - referenced_events)}")
    if enemies != referenced_enemies:
        errors.append(f"enemigos sin caso: {sorted(enemies - referenced_enemies)}")
    if bosses != referenced_bosses:
        errors.append(f"jefes sin caso: {sorted(bosses - referenced_bosses)}")

    reference_files = ["index.html", "css/styles.css", "css/premium.css", "js/data.js", "js/modules/premium-art.js", "js/modules/premium-audio.js", "js/modules/nocturne-ui.js", "js/app.js", "sw.js", "manifest.webmanifest"]
    pattern = re.compile(r"(?:src=|href=|url\(|\"|')((?:assets|css|js)/[^\"')\s]+)")
    for name in reference_files:
        text = (ROOT / name).read_text(encoding="utf-8")
        for match in pattern.finditer(text):
            relative = match.group(1).rstrip(")")
            if not (ROOT / relative).exists():
                errors.append(f"{name}: recurso inexistente {relative}")

    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
    for required in ("name", "short_name", "start_url", "scope", "display", "icons"):
        if not manifest.get(required):
            errors.append(f"manifest: falta {required}")
    for icon in manifest.get("icons", []):
        icon_path = ROOT / icon.get("src", "")
        if not icon_path.is_file():
            errors.append(f"manifest: icono inexistente {icon.get('src')}")
            continue
        declared = icon.get("sizes", "")
        dimensions = png_dimensions(icon_path)
        if dimensions and declared != f"{dimensions[0]}x{dimensions[1]}":
            errors.append(f"manifest: tamaño declarado incorrecto para {icon.get('src')} ({declared})")
    if manifest.get("start_url") != "./" or manifest.get("scope") != "./":
        errors.append("manifest: start_url y scope deben ser relativos para GitHub Pages")

    html_text = (ROOT / "index.html").read_text(encoding="utf-8")
    parser = HTMLAuditParser()
    parser.feed(html_text)
    duplicated_html_ids = {element_id for element_id in parser.ids if parser.ids.count(element_id) > 1}
    if duplicated_html_ids:
        errors.append(f"index.html: ids duplicados {sorted(duplicated_html_ids)}")
    if parser.lang != "es":
        errors.append("index.html: idioma principal distinto de es")
    if not parser.has_viewport:
        errors.append("index.html: falta viewport")
    if not parser.has_csp:
        errors.append("index.html: falta política CSP")

    if data["version"] not in html_text:
        errors.append("index.html: versión no sincronizada con los datos")
    if data["version"] not in (ROOT / "sw.js").read_text(encoding="utf-8"):
        errors.append("sw.js: caché no sincronizada con la versión")

    app_text = (ROOT / "js/app.js").read_text(encoding="utf-8")
    sw_text = (ROOT / "sw.js").read_text(encoding="utf-8")
    readme_text = (ROOT / "README.md").read_text(encoding="utf-8")
    changelog_text = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")

    if '"1.1.0"' not in app_text or "SUPPORTED_SAVE_VERSIONS" not in app_text:
        errors.append("app.js: falta compatibilidad explícita con partidas v1.1.0")
    if "REBALANCED_SAVE_VERSIONS" not in app_text:
        errors.append("app.js: la migración no distingue versiones reequilibradas de parches compatibles")
    if "key.startsWith(CACHE_PREFIX)" not in sw_text:
        errors.append("sw.js: la limpieza de caché podría borrar cachés de otras apps del mismo origen")
    if data["version"] not in readme_text or data["version"] not in changelog_text:
        errors.append("documentación: README o CHANGELOG no están sincronizados con la versión")
    if 'id="main-content" class="app-shell" tabindex="-1"' not in html_text:
        errors.append("index.html: el destino del enlace de salto no puede recibir foco")

    core_match = re.search(r"const CORE = \[(.*?)\];", sw_text, re.S)
    if not core_match:
        errors.append("sw.js: no se pudo localizar la lista CORE")
    else:
        for resource in re.findall(r'"\./([^"?]+)"', core_match.group(1)):
            if resource and not (ROOT / resource).exists():
                errors.append(f"sw.js: recurso CORE inexistente {resource}")

    css_text = (ROOT / "css/styles.css").read_text(encoding="utf-8")
    if not re.search(r"\.inventory-button\{[^}]*min-height:44px", css_text):
        errors.append("css: los botones de inventario no garantizan un objetivo táctil de 44 px")
    css_colors = dict(re.findall(r"--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})", css_text))
    panel = css_colors.get("panel")
    for color_name in ("ink", "muted", "red", "cyan", "green", "gold"):
        color = css_colors.get(color_name)
        if panel and color and contrast_ratio(color, panel) < 4.5:
            errors.append(f"css: contraste insuficiente de --{color_name} sobre --panel ({contrast_ratio(color, panel):.2f}:1)")

    if errors:
        print("VALIDACIÓN FALLIDA")
        for error in errors:
            print(f"- {error}")
        return 1

    print("VALIDACIÓN CORRECTA")
    print(
        f"{len(data['characters'])} personajes, {len(data['cases'])} casos, "
        f"{len(data['events'])} eventos, {len(data['enemies'])} enemigos, "
        f"{len(data['bosses'])} jefes, {len(data['items'])} objetos y "
        f"{len(data['achievements'])} logros."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
