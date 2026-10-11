def test_products_api(playwright):
    request = playwright.request.new_context(base_url="https://practice-staging.testheon.com/practice/api/v1")
    response = request.get("/products?limit=1")
    assert response.ok
