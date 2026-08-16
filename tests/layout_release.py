#!/usr/bin/env python3
from __future__ import annotations
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text('utf-8')
CSS=(ROOT/'css/styles.css').read_text('utf-8')+(ROOT/'css/premium.css').read_text('utf-8')
for src in ['js/data.js','js/modules/premium-art.js','js/modules/premium-audio.js','js/modules/nocturne-ui.js','js/app.js']:
    HTML=HTML.replace(f'<script src="{src}" defer></script>','')
HTML=HTML.replace('<link rel="stylesheet" href="css/styles.css">',f'<style>{CSS}</style>').replace('<link rel="stylesheet" href="css/premium.css">','')
SCRIPTS=[(ROOT/x).read_text('utf-8') for x in ['js/data.js','js/modules/premium-art.js','js/modules/premium-audio.js','js/modules/nocturne-ui.js','js/app.js']]
STORAGE="""(()=>{const s=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>s.has(String(k))?s.get(String(k)):null,setItem:(k,v)=>s.set(String(k),String(v)),removeItem:k=>s.delete(String(k)),clear:()=>s.clear(),key:i=>[...s.keys()][i]??null,get length(){return s.size}}});window.confirm=()=>true;})();"""
CHROMIUM=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium')
WIDTHS=(320,375,768,1024,1440)
async def metrics(page,label):
    r=await page.evaluate("""() => { const a=document.querySelector('.screen--active'); const vw=document.documentElement.clientWidth; const bad=[...a.querySelectorAll('button,a[href],input')].filter(n=>{const x=n.getBoundingClientRect();const s=getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden'&&x.width>0&&x.height>0&&(x.left<-1||x.right>vw+1)}).length; const tiny=[...a.querySelectorAll('button,a[href]')].filter(n=>{const x=n.getBoundingClientRect();const s=getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden'&&x.width>0&&x.height>0&&(x.width<44||x.height<44)}).length; return {vw,sw:document.documentElement.scrollWidth,bad,tiny,id:a?.id}; }""")
    assert r['sw'] <= r['vw']+1, f'{label}: overflow {r}'
    assert r['bad']==0, f'{label}: clipped controls {r}'
    assert r['tiny']==0, f'{label}: small targets {r}'
async def run():
    checks=0
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,executable_path=CHROMIUM,args=['--no-sandbox','--disable-gpu'])
        for width in WIDTHS:
            page=await browser.new_page(viewport={'width':width,'height':800},bypass_csp=True,reduced_motion='reduce')
            await page.set_content(HTML,wait_until='domcontentloaded')
            await page.add_script_tag(content=STORAGE)
            for s in SCRIPTS: await page.add_script_tag(content=s)
            await metrics(page,f'{width} intro'); checks+=1
            await page.locator('#enter-signal').click(timeout=5000)
            await metrics(page,f'{width} menu'); checks+=1
            await page.locator('[data-action="new-game"]').click(timeout=5000)
            for _ in range(3): await page.locator('#prologue-next').click(timeout=5000)
            await metrics(page,f'{width} character'); checks+=1
            await page.locator('[data-character="lucia"]').click(timeout=5000)
            await metrics(page,f'{width} map'); checks+=1
            await page.locator('[data-case="block404"]').click(timeout=5000)
            await page.locator('#case-prelude-enter').click(timeout=5000)
            await metrics(page,f'{width} game'); checks+=1
            await page.close()
        await browser.close()
    print(f'LAYOUT RELEASE: {checks} checks passed')
if __name__=='__main__': asyncio.run(run())
