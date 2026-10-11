import os

def test_challenge_catalogue(page):
    page.goto(os.getenv("TESTHEON_LAB_URL", "https://practice-staging.testheon.com/practice") + "/challenges/")
    page.get_by_role("heading", name="Playwright challenges").wait_for()
