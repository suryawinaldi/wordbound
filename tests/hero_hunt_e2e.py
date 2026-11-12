"""Browser checks against a running Vite dev or preview server; no live services."""
import json
import os
from pathlib import Path
import subprocess
import unittest
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('HUNT_BASE_URL', 'http://localhost:5173').rstrip('/')
HEROES = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {HEROES} from './src/features/hero-hunt/content.js'; console.log(JSON.stringify(HEROES))"], cwd=ROOT))
CLUE_TO_HERO = {clue['text']: hero for hero in HEROES for clue in hero['clues']}

class HeroHuntBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        self.page = self.context.new_page()
        self.errors = []
        self.external = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.on('request', lambda request: self.external.append(request.url) if request.url.startswith('http') and not request.url.startswith(BASE) else None)
        self.page.goto(BASE, wait_until='networkidle')

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])
        self.assertEqual(self.external, [], 'Solo must not need external fonts, assets, auth or data')

    def start(self):
        self.page.get_by_role('button', name='Mulai main', exact=True).click()
        expect(self.page.get_by_label('Siapa tebakanmu?', exact=True)).to_be_visible()

    def solve(self):
        clue = self.page.locator('.active-clue').inner_text()
        hero = CLUE_TO_HERO[clue]
        self.page.get_by_label('Siapa tebakanmu?', exact=True).fill(hero['name'])
        self.page.get_by_role('button', name='Tebak hero', exact=True).click()
        expect(self.page.locator('.reveal-content h1')).to_have_text(hero['name'])
        return hero

    def no_overflow(self):
        self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth > innerWidth'), 'horizontal overflow')

    def test_full_session_refresh_and_idempotent_history(self):
        self.start()
        self.page.get_by_role('button', name='Buka petunjuk berikutnya').click()
        self.page.get_by_role('button', name='Buka petunjuk berikutnya').click()
        self.page.get_by_label('Siapa tebakanmu?', exact=True).fill('bukan nama hero')
        self.page.get_by_role('button', name='Tebak hero', exact=True).click()
        expect(self.page.get_by_label('4 dari 5 HP')).to_be_visible()
        expect(self.page.locator('#guess-feedback')).to_contain_text('Belum tepat')
        self.page.get_by_label('Siapa tebakanmu?', exact=True).fill('x')
        expect(self.page.get_by_role('button', name='Tebak hero', exact=True)).to_be_enabled()
        clue = self.page.locator('.active-clue').inner_text()
        self.page.reload(wait_until='networkidle')
        expect(self.page.locator('.active-clue')).to_have_text(clue)
        expect(self.page.get_by_label('4 dari 5 HP')).to_be_visible()
        names = []
        for index in range(5):
            names.append(self.solve()['name'])
            if index == 0:
                expect(self.page.locator('.score-breakdown strong')).to_have_text('+60')
                self.page.reload(wait_until='networkidle')
                expect(self.page.locator('.score-breakdown strong')).to_have_text('+60')
            self.page.get_by_role('button', name='Hero berikutnya' if index < 4 else 'Lihat hasil perburuan', exact=True).click()
        self.assertEqual(len(set(names)), 5)
        expect(self.page).to_have_url(__import__('re').compile(r'/results/'))
        expect(self.page.locator('.result-score-card > div > strong').first).to_have_text('460 poin')
        expect(self.page.locator('.result-metrics')).to_contain_text('83%')
        self.page.reload(wait_until='networkidle')
        self.page.get_by_role('link', name='Lihat statistik').click()
        expect(self.page.locator('.history-row')).to_have_count(1)
        expect(self.page.locator('.stats-overview > div').first.locator('strong')).to_have_text('1')
        self.page.locator('.history-row').click()
        self.page.get_by_role('button', name='Main lagi', exact=True).click()
        expect(self.page.get_by_label('5 dari 5 HP')).to_be_visible()
        expect(self.page.locator('.hud-score strong')).to_have_text('0')

    def test_game_over_on_hard(self):
        self.page.get_by_role('radio', name='Hard').check()
        self.start()
        expect(self.page.get_by_label('3 dari 3 HP')).to_be_visible()
        for _ in range(3):
            self.page.get_by_label('Siapa tebakanmu?', exact=True).fill('tidak tahu')
            self.page.get_by_role('button', name='Tebak hero', exact=True).click()
        expect(self.page.get_by_role('heading', name='Perburuan belum usai.')).to_be_visible()
        expect(self.page.locator('.result-score-card > div > strong').first).to_have_text('0 poin')
        expect(self.page.locator('.round-outcome.unanswered')).to_have_count(1)
        expect(self.page.get_by_role('heading', name='Belum dimainkan', exact=True)).to_have_count(4)
        self.no_overflow()

    def test_skip_confirmation_exit_cancel_and_back_navigation(self):
        self.start()
        self.page.get_by_role('button', name='Lewati hero ini').click()
        expect(self.page.get_by_role('dialog')).to_be_visible()
        self.page.get_by_role('button', name='Batal', exact=True).click()
        expect(self.page.get_by_label('Siapa tebakanmu?', exact=True)).to_be_visible()
        self.page.get_by_role('button', name='Lewati hero ini').click()
        self.page.get_by_role('button', name='Ya, lewati', exact=True).click()
        expect(self.page.locator('.score-breakdown strong')).to_have_text('+0')
        expect(self.page.get_by_label('5 dari 5 HP')).to_be_visible()
        self.page.get_by_role('button', name='Hero berikutnya', exact=True).click()
        self.page.get_by_role('button', name='Keluar', exact=True).click()
        self.page.get_by_role('button', name='Batal', exact=True).click()
        expect(self.page.locator('.game-hud')).to_contain_text('Hero 02')
        self.page.go_back()
        expect(self.page.get_by_role('dialog')).to_be_visible()
        self.page.get_by_role('button', name='Keluar dari sesi', exact=True).click()
        expect(self.page.get_by_role('button', name='Mulai main', exact=True)).to_be_visible()
        self.page.goto(BASE + '/stats')
        expect(self.page.locator('.history-row')).to_have_count(0)

    def test_all_hint_history_and_short_viewport(self):
        self.start()
        for _ in range(4):
            self.page.get_by_role('button', name='Buka petunjuk berikutnya').click()
        expect(self.page.get_by_role('button', name='Semua petunjuk sudah terbuka')).to_be_disabled()
        self.page.locator('.clue-history summary').click()
        expect(self.page.locator('.clue-history li')).to_have_count(4)
        self.page.locator('.clue-history summary').click()
        self.page.set_viewport_size({'width': 360, 'height': 480})
        self.page.get_by_label('Siapa tebakanmu?', exact=True).fill('Franco')
        button = self.page.get_by_role('button', name='Tebak hero', exact=True)
        button.scroll_into_view_if_needed()
        expect(button).to_be_in_viewport()
        self.assertGreaterEqual(button.bounding_box()['height'], 44)
        self.no_overflow()
        expect(self.page.locator('.mobile-nav')).to_have_count(0)

    def test_profile_persistence_and_legacy_routes(self):
        self.page.goto(BASE + '/profile')
        self.page.get_by_label('Nama panggilan').fill('Surya')
        self.page.get_by_role('button', name='Simpan nama').click()
        self.page.get_by_role('switch', name='Efek suara').click()
        self.page.reload(wait_until='networkidle')
        expect(self.page.get_by_label('Nama panggilan')).to_have_value('Surya')
        expect(self.page.get_by_role('switch', name='Efek suara')).to_have_attribute('aria-checked', 'false')
        for route in ['/games', '/wordle', '/couple-link', '/dashboard', '/ml-duel']:
            self.page.goto(BASE + route)
            expect(self.page).to_have_url(BASE + '/')
            expect(self.page.get_by_role('button', name='Mulai main', exact=True)).to_be_visible()
        self.page.goto(BASE + '/results/missing')
        expect(self.page.get_by_role('heading', name='Hasil belum ditemukan.')).to_be_visible()

    def test_storage_failure_does_not_block_play(self):
        self.context.add_init_script("Object.defineProperty(Storage.prototype, 'setItem', {value: function(){throw new Error('denied')}})")
        self.page.reload(wait_until='networkidle')
        self.start()
        expect(self.page.get_by_role('status')).to_contain_text('Penyimpanan browser tidak tersedia')
        self.solve()
        expect(self.page.get_by_role('button', name='Hero berikutnya')).to_be_visible()

    def test_hero_library_reports_coverage_and_excludes_pending_from_ready_filter(self):
        self.page.goto(BASE + '/heroes')
        expect(self.page.locator('.library-card')).to_have_count(133)
        self.page.get_by_label('Cari hero', exact=True).fill('Hirara')
        expect(self.page.locator('.library-card')).to_have_count(1)
        expect(self.page.locator('.library-card')).to_contain_text('Dalam peninjauan')
        self.page.get_by_label('Status hero', exact=True).select_option('ready')
        expect(self.page.get_by_role('heading', name='Hero belum ditemukan.')).to_be_visible()
        self.page.get_by_role('button', name='Reset pencarian').click()
        self.page.get_by_label('Status hero', exact=True).select_option('pending')
        expect(self.page.locator('.library-card')).to_have_count(7)
        self.page.get_by_label('Status hero', exact=True).select_option('ready')
        expect(self.page.locator('.library-card')).to_have_count(126)
        self.page.get_by_label('Cari hero', exact=True).fill('xborg')
        expect(self.page.get_by_role('heading', name='X.Borg', exact=True)).to_be_visible()
        self.page.set_viewport_size({'width': 360, 'height': 800})
        self.no_overflow()
        self.page.reload(wait_until='networkidle')
        expect(self.page.get_by_role('heading', name='Kenali para legenda.')).to_be_visible()

    def test_corrupt_saved_data_recovers(self):
        self.page.evaluate("localStorage.setItem('hero-hunt.history.v1', '{}'); sessionStorage.setItem('hero-hunt.session.v1', '{broken'); localStorage.setItem('hero-hunt.settings.v1', 'null')")
        self.page.reload(wait_until='networkidle')
        self.start()
        expect(self.page.get_by_label('5 dari 5 HP')).to_be_visible()

    def test_layouts_keyboard_and_reduced_motion(self):
        for width, height in [(360, 800), (390, 844), (1440, 900)]:
            self.page.set_viewport_size({'width': width, 'height': height})
            self.no_overflow()
            button = self.page.get_by_role('button', name='Mulai main', exact=True)
            button.scroll_into_view_if_needed()
            expect(button).to_be_in_viewport()
        self.page.set_viewport_size({'width': 360, 'height': 800})
        button.focus()
        self.page.keyboard.press('Enter')
        field = self.page.get_by_label('Siapa tebakanmu?', exact=True)
        expect(field).to_be_visible()
        field.fill(CLUE_TO_HERO[self.page.locator('.active-clue').inner_text()]['name'])
        field.press('Enter')
        expect(self.page.locator('.reveal-content h1')).to_be_focused()
        self.no_overflow()
        self.assertEqual(self.page.locator('.reveal-content').evaluate('(e) => getComputedStyle(e).animationName'), 'none')

if __name__ == '__main__':
    unittest.main(verbosity=2)
