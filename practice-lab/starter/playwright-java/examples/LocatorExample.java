import com.microsoft.playwright.*;

class LocatorExample {
  void run(Page page) {
    page.navigate(System.getenv().getOrDefault("TESTHEON_LAB_URL", "https://practice-staging.testheon.com/practice") + "/challenges/");
    page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Playwright challenges")).waitFor();
  }
}
