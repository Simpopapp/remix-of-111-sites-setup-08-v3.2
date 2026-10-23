import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

S = Path(__file__).parent / "screenshots"
S.mkdir(parents=True, exist_ok=True)
BASE = "http://localhost:8080"
results = []

def check(ok, label):
    results.append((ok, label))
    print(("PASS" if ok else "FAIL"), label)

async def wait_hydrate(page, ms=1100):
    await page.wait_for_timeout(ms)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1800})
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        # ---- aula nova: /concepts/15 renderiza lição completa + prática ----
        await page.goto(f"{BASE}/concepts/15", wait_until="domcontentloaded")
        await wait_hydrate(page)
        t = await page.inner_text("body")
        check("Event track" in t and "Model limits" in t, "W2: aula 15 renderiza event-track com limites do modelo")
        check("unfinished work" in t.lower(), "W2: lição 15 presente (não blocos legados)")

        # ---- missão orders-pile-up: ciclo completo ----
        await page.goto(f"{BASE}/missions/orders-pile-up", wait_until="domcontentloaded")
        await wait_hydrate(page)
        t = await page.inner_text("body")
        check("The orders keep piling up" in t, "W2: briefing da missão carrega")

        await page.get_by_label("Your evidence:").fill("Arrivals 3/s vs completions 2/s; backlog grows 1/s.")
        await page.get_by_role("button", name="Next: Predict the next queue state").click()
        await wait_hydrate(page)
        t = await page.inner_text("body")
        check("predict · opu-predict" in t.lower(), "W2: avança para o step predict")

        await page.get_by_role("button", name="21 jobs.").click()
        await page.get_by_role("button", name="Submit decision").click()
        await page.wait_for_timeout(300)
        t = await page.inner_text("body")
        check("Atendido" in t, "W2: tarefa predict avaliada com rubrica")
        await page.get_by_test_id("mission-next").click()
        await wait_hydrate(page)

        await page.get_by_label("Your evidence:").fill("Transient failure retried ok; invalid message exhausted to DLQ; slow consumer grew the backlog without DLQ.")
        await page.get_by_test_id("mission-next").click()
        await wait_hydrate(page)
        t = await page.inner_text("body")
        check("decide · opu-decide" in t.lower(), "W2: avança para o step decide")

        await page.get_by_role("button", name="Two independent subscriptions receive every event; the fulfillment subscription runs several competing workers inside it.").click()
        await page.get_by_role("button", name="Submit decision").click()
        await page.wait_for_timeout(300)
        await page.get_by_label("Your evidence:").fill("Two subscriptions own delivery; workers compete inside fulfillment. Recovery: replay cause-specific; stop when backlog drains.")
        await page.get_by_test_id("mission-next").click()
        await wait_hydrate(page)
        t = await page.inner_text("body")
        check("transfer · opu-transfer" in t.lower(), "W2: transfer com domínio trocado (arquivos)")

        step_text = await page.get_by_test_id("mission-step-opu-transfer").inner_text()
        check("payment" not in step_text.lower() and "charge" not in step_text.lower(), "W2: transfer não usa vocabulário de pagamento")
        await page.get_by_role("button", name="Use fileRevisionId for every delivery; atomically commit its uniquely keyed completion record with its result, and acknowledge repeats without adding another result.").click()
        await page.get_by_role("button", name="Submit decision").click()
        await page.wait_for_timeout(300)
        t = await page.inner_text("body")
        check("Atendido" in t, "W2: variante avaliada (transfer met)")
        await page.get_by_test_id("mission-next").click()
        await wait_hydrate(page)

        t = await page.inner_text("body")
        check("dossier · opu-dossier" in t.lower(), "W2: chega ao step do dossiê")
        dossier = ("Fato: chegada 3/s contra conclusão 2/s acumulou trabalho não terminado. "
                   "Hipótese: consumidor lento, não mensagem inválida. "
                   "Evidência: DLQ só cresceu na causa de mensagem inválida. "
                   "Ação: isolar assinaturas e compartilhar trabalho entre workers. "
                   "Verificação: backlog drena sem DLQ crescer. "
                   "Aprendizado: notificar assinantes não é distribuir trabalho.")
        await page.get_by_test_id("mission-dossier").fill(dossier)
        await page.get_by_test_id("mission-save-dossier").click()
        await page.wait_for_timeout(400)
        t = await page.inner_text("body")
        check("Dossier saved on this device" in t, "W2: dossiê salvo")

        await page.reload(wait_until="domcontentloaded")
        await wait_hydrate(page)
        stored = await page.get_by_test_id("mission-dossier").input_value()
        check("notificar assinantes não é distribuir trabalho" in stored, "W2: dossiê persiste após reload")

        await page.goto(f"{BASE}/missions", wait_until="domcontentloaded")
        await wait_hydrate(page)
        t = await page.inner_text("body")
        check(t.lower().count("dossier saved") >= 1, "W2: índice mostra status 'dossier saved'")
        await page.screenshot(path=str(S / "w2_missions.png"))

        check(len(errors) == 0, f"W2: console limpo ({len(errors)} erros)")
        for e in errors[:3]:
            print("CONSOLE ERR:", e[:160])
        await browser.close()

    fails = [l for ok, l in results if not ok]
    print(f"TOTAL {len(results) - len(fails)}/{len(results)} checks")
    if fails:
        raise SystemExit(1)

asyncio.run(main())
