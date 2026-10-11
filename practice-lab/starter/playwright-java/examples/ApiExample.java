import com.microsoft.playwright.*;

class ApiExample {
  void run(Playwright playwright) {
    APIRequestContext request = playwright.request().newContext(new APIRequest.NewContextOptions().setBaseURL("https://practice-staging.testheon.com/practice/api/v1"));
    assert request.get("/products?limit=1").ok();
  }
}
