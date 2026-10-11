import com.microsoft.playwright.*;

class AuthExample {
  void run(Page page) {
    page.navigate("https://practice-staging.testheon.com/practice/apps/auth/");
    page.getByLabel("Username").fill("standard_user");
    page.getByLabel("Password").fill("Practice@123");
    page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in to Practice")).click();
  }
}
