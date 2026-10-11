def test_auth_heading(page):
    page.goto("https://practice-staging.testheon.com/practice/apps/auth/")
    page.get_by_label("Username").fill("standard_user")
    page.get_by_label("Password").fill("Practice@123")
    page.get_by_role("button", name="Sign in to Practice").click()
    page.get_by_role("heading", name="Account dashboard").wait_for()
