# Practice Lab discovery proposal

Status: the Lab sitemap is implemented. WordPress robots and Search Console changes remain manual or separately authorised.

## Sitemap

Production path: `https://testheon.com/practice/sitemap.xml`

The file is generated from the explicit INDEX allowlist in `src/config/seo.ts`. It contains only the ten substantial teaching and catalogue pages. Every `lastmod` is the date of a meaningful content or linking change recorded in source; build time and deployment time are not used. Fixture pages, challenge details, application screens, API documentation, JSON endpoints, downloads, assets, 404, and staging are omitted.

## Rank Math robots.txt proposal

After the production Lab is authorised in Chunk 13 and the sitemap returns 200, use Rank Math’s robots editor to add exactly:

```text
Sitemap: https://testheon.com/practice/sitemap.xml
```

Keep the existing WordPress sitemap line. Do not add a physical root `robots.txt`, do not disallow public runtime fixtures as a substitute for `noindex`, and do not edit root `.htaccess`. CRE-56 did not apply this proposal.

## Google Search Console submission steps

After production launch and separate authorisation:

1. Open the existing verified `https://testheon.com/` property in Google Search Console.
2. Open **Indexing → Sitemaps**.
3. Submit `practice/sitemap.xml` under the verified property.
4. Confirm the fetched URL is `https://testheon.com/practice/sitemap.xml`, status is Success, and discovered URL count equals the current allowlist count.
5. Inspect `/practice/`, one teaching page, and one known noindex fixture URL. Request indexing only for the eligible teaching pages.
6. Recheck Pages/Indexing after Google processes the sitemap. Investigate any fixture, challenge detail, API, download, staging, or query URL reported as indexable.

Do not submit the protected staging host. It remains authenticated, disallowed, and globally `noindex,nofollow`.
