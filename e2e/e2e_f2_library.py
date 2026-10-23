import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

SHOTS = Path(__file__).parent / "screenshots_f2"
SHOTS.mkdir(exist_ok=True)
BASE = "http://localhost:8080"
errors = []

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))

        # 1. Carrega /library
        await page.goto(BASE + "/library", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=str(SHOTS / "01_library.png"))
        body = await page.inner_text("body")
        assert "Biblioteca" in body, "titulo ausente"
        assert "Mostrando" in body, "contador ausente"
        print("1. library carregada; contador:", [l for l in body.split("\n") if l.startswith("Mostrando")][0][:80])

        # 2. Busca por sintoma com motivo
        await page.fill("input[aria-label='Buscar no acervo']", "fila cresce")
        await page.wait_for_timeout(900)
        body = await page.inner_text("body")
        assert "Corresponde por sintoma" in body, "motivo de sintoma ausente"
        assert "Por que corresponde" in body, "linha de motivo ausente"
        assert "lab-pubsub" not in body  # chave interna nunca vaza
        await page.screenshot(path=str(SHOTS / "02_sintoma.png"))
        print("2. motivo por sintoma visível")

        # 3. Categoria editorial
        await page.get_by_role("button", name="Database", exact=True).click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=str(SHOTS / "03_categoria.png"))
        body = await page.inner_text("body")
        assert "Onde os dados moram" in body, "cabecalho editorial da categoria ausente"
        assert "cat=Database" in page.url, "cat nao sincronizada na URL"
        print("3. categoria editorial ok; url:", page.url)

        # 4. Filtros preservados ao abrir e voltar
        await page.fill("input[aria-label='Buscar no acervo']", "")
        await page.wait_for_timeout(900)
        await page.get_by_role("link", name="Abrir conceito:", exact=False).first.click()
        await page.wait_for_timeout(800)
        assert "/concepts/" in page.url, "navegou para conceito"
        await page.go_back()
        await page.wait_for_timeout(800)
        assert "cat=Database" in page.url, "filtros perdidos ao voltar"
        body = await page.inner_text("body")
        assert "Onde os dados moram" in body, "categoria nao restaurada ao voltar"
        await page.screenshot(path=str(SHOTS / "04_voltou.png"))
        print("4. filtros preservados ao voltar; url:", page.url)

        # 5. Vazio orientado
        await page.fill("input[aria-label='Buscar no acervo']", "zzzzqqq")
        await page.wait_for_timeout(900)
        body = await page.inner_text("body")
        assert "Tente descrever o sintoma" in body, "orientacao de vazio ausente"
        assert "Explorar Database" in body, "sugestao de tema ausente"
        await page.screenshot(path=str(SHOTS / "05_vazio.png"))
        print("5. vazio orientado ok")

        # 6. Visão compacta
        await page.fill("input[aria-label='Buscar no acervo']", "")
        await page.wait_for_timeout(900)
        await page.get_by_role("button", name="Ver compacta").click()
        await page.wait_for_timeout(800)
        assert "view=compacta" in page.url
        body = await page.inner_text("body")
        assert "Visão compacta" in body
        await page.screenshot(path=str(SHOTS / "06_compacta.png"))
        print("6. visão compacta ok")

        # 7. Filtro de tipo: só laboratórios
        await page.get_by_role("button", name="Laboratórios", exact=True).click()
        await page.wait_for_timeout(800)
        body = await page.inner_text("body")
        assert "Laboratório" in body
        cards = await page.get_by_role("link", name="Abrir laboratório:", exact=False).count()
        assert cards >= 6, f"esperava >=6 labs, vei {cards}"
        concepts = await page.get_by_role("link", name="Abrir conceito:", exact=False).count()
        assert concepts == 0, f"conceitos vazaram no filtro de labs: {concepts}"
        await page.screenshot(path=str(SHOTS / "07_labs.png"))
        print("7. filtro de laboratórios ok")

        await browser.close()

    print("PAGEERRORS:", json.dumps(errors))
    assert not errors, f"pageerrors: {errors}"
    print("E2E F2 OK")

asyncio.run(main())
