# Chunk 01 — Authenticated hosting evidence

Observed 2026-09-27 through the signed-in Hostinger hPanel and its File Manager. Read-only navigation only. No settings were saved; no SSH key or account was created; no plugin, WordPress configuration, database or deployed file was changed. WordPress credentials were not read or used. Hostinger MCP registrations exist locally, but no hosting/WordPress capability was callable in the session; the signed-in browser provided the evidence. Ephemeral File Manager access URLs are intentionally omitted.

## Account and runtime facts

| Evidence page / UI | Observed value | Boundary of evidence |
| --- | --- | --- |
| [Testheon dashboard](https://hpanel.hostinger.com/websites/testheon.com) | Business Web Hosting; WordPress 7.1.2; PHP 8.3; active theme Astra 4.13.8 | Dashboard values, not a plugin update request. |
| Same dashboard tooltips | “LiteSpeed is enabled”; “SSL is on”; “CDN is on” | Public responses independently show Hostinger hcdn and LiteSpeed cache headers. |
| [Plan Details](https://hpanel.hostinger.com/websites/testheon.com/order/details) | 50 GB disk; 3072 MB RAM; 2 CPU cores; 600000 inodes; 50 websites; 120 processes; 60 PHP workers | Shared plan limits; not capacity dedicated to the Lab. |
| Plan Details | Server server1617; North America (USA, MA); backups USA (Boston); website IP 157.173.214.189 | Deployment must consider network distance and shared WordPress resources. |
| Plan Details, Web App details | Frontend Astro among supported frameworks; backend Astro, Express, Fastify, Hono, Next.js and others; Node 24.x/22.x/20.x/18.x; npm/yarn/pnpm | Node app capability is listed, but a proxy beneath this existing WordPress website was not proven. |
| [SSH Access](https://hpanel.hostinger.com/websites/testheon.com/advanced/ssh-access) | INACTIVE; SSH port 65002; host 157.173.214.189; account u652010987; Add SSH key disabled | Not enabled or tested. SFTP cannot be assumed usable while SSH is inactive. No password was viewed. |
| [FTP Accounts](https://hpanel.hostinger.com/websites/testheon.com/files/ftp-accounts) | FTP port 21; upload folder public_html; directory prefix /home/u652010987/domains/testheon.com | Full document-root mapping is /home/u652010987/domains/testheon.com/public_html, combining the displayed prefix and upload folder. No FTP login was attempted; transport security not proved. |
| [GIT](https://hpanel.hostinger.com/websites/testheon.com/advanced/git) | “Deploy from Git repository”; Connect with GitHub / GitLab | Integration available but not connected by this task. |
| [Cron Jobs](https://hpanel.hostinger.com/websites/testheon.com/advanced/cron-jobs) | PHP/custom job creation UI; PHP command prefix /usr/bin/php /home/u652010987/ | No job created; actual CLI PHP version and scheduling behavior await later validation. |
| [PHP Configuration](https://hpanel.hostinger.com/websites/testheon.com/advanced/php-configuration) | PHP 8.3 selected. sqlite3 built-in checked; pdo and pdo_sqlite checked | Custom checkboxes were inspected through rendered DOM; class h-checkbox--checked observed for all three. |
| [PHP Info](https://hpanel.hostinger.com/websites/testheon.com/advanced/php-info) | PHP 8.3.33; CGI/FastCGI; PDO support enabled; PDO drivers mysql, sqlite; PDO Driver for SQLite 3.x enabled; SQLite3 support enabled; SQLite library 3.45.2 | Actual PHP info view corroborates enabled drivers. No new test script/database was uploaded. |
| Same PHP Info | Loaded configuration /opt/alt/php83/etc/php.ini; additional /opt/alt/php83/link/conf/alt_php.ini; open_basedir no value | Does not establish process isolation from sibling WordPress files. No configuration changed. |
| Same PHP Info, disable_functions | system, exec, shell_exec, passthru, mysql_list_dbs, ini_alter, dl, symlink, link, chgrp, leak, popen, apache_child_terminate, virtual, mb_send_mail, proc_open | PHP symlink and command execution are disabled. This is not a test of shell ln/mv availability or web-server symlink traversal. |
| Hosting sidebar | Password Protect Directories, Cache Manager, CDN and Subdomains management present | Presence of UI is not proof of a created staging host, active protection or route exclusion. |

Generic Hostinger SQLite support documentation is broader and less specific than this account's PHP Info. SQLite is selected on the observed driver evidence, with writable private storage and concurrency tests still mandatory before deployment. No WordPress database content/configuration was inspected.

## Production filesystem and root rewrite evidence

File Manager was opened for **only testheon.com**. Its root showed public_html and DO_NOT_UPLOAD_HERE. The public_html listing contained .htaccess, .htaccess.bk, WordPress directories/files and .private. No physical practice, practice-staging or robots.txt entry was present in the complete root listing.

Server-computed **SHA-256**, using File Manager → select .htaccess → Info → SHA256 → Show:

```text
File: /home/u652010987/domains/testheon.com/public_html/.htaccess
SHA256: 3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24
Displayed size: 1.43 KiB
Displayed last-modified tooltip: 7/31/2026, 1:03:12 AM (UI timezone not established)
```

Opened the existing file to **read**, moved the editor cursor to the last line, and closed it without Save. Relevant observed directives:

```apache
# BEGIN LSCACHE
<IfModule mod_rewrite.c>
RewriteEngine on
RewriteRule litespeed/debug/.*\.log$ - [F,L]
RewriteRule \.litespeed_conf\.dat - [F,L]
</IfModule>
<IfModule LiteSpeed>
CacheLookup on
RewriteRule .* - [E=Cache-Control:no-autoflush]
# ASYNC marker: wp-admin/admin-ajax.php and action=async_litespeed
# DROPQS marker:
CacheKeyModify -qs:fbclid
CacheKeyModify -qs:gclid
CacheKeyModify -qs:utm*
CacheKeyModify -qs:_ga
</IfModule>
# END LSCACHE
# NON_LSCACHE block contains only marker comments
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

This is an explanatory excerpt, not a byte-for-byte exported backup; the SHA-256 above is the server's checksum of the real file. The standard physical-file/directory exclusions are confirmed. A future physical /practice/ directory and generated page directories should bypass the WordPress catch-all; this is an inference from actual rules, not a deployed-route test. Virtual descendants, API verbs and unknown paths need staging proof of Lab-local routing. Root rules remain untouched.

No other server configuration was touched, so no additional touched-file baseline hash is required in this chunk. PHP configuration paths were identified but their file bytes/hashes were not exposed through the read-only panel.

## Protocol and uncertainty notes

Public HTTPS GETs succeed. Public evidence records hcdn, x-litespeed-cache and advertised h3. The installed curl does not support HTTP/2. An initial sandboxed Node http2 probe could not connect. The approved read-only HTTPS retry at 2026-09-27T09:50:06.071Z negotiated h2 and returned status 200, server hcdn. HTTP/2 is confirmed. No downgrade or TLS bypass was used.

No Cloudflare marker is present in the sampled responses; an invisible upstream service cannot be categorically excluded. Hostinger CDN is positively confirmed.

Inbound WebSockets are not selected for this PHP/Web Hosting MVP; provider documentation supports outgoing connections and points incoming servers to VPS. Use bounded polling; do not assume SSE bypasses shared worker/buffering limits.

Unverified deployment prerequisites: approved SSH/SFTP access; actual shell symlink and atomic rename support; serving linked files; writable storage outside document root; SQLite locking and concurrent sessions; PHP CLI parity; per-path CDN behavior; staging authentication. These are explicit preflight gates, not claimed successful tests.



After inspection, File Manager recomputed the root .htaccess SHA-256 at approximately 09:50 UTC: 3f9689ed4759a5a35a33c4f7ccfb40613310fbc1b0f98387bfdc76f21ce00d24. It matches the initial server checksum. Closed the editor without saving.


Provider reference for the connectivity policy: [Hostinger supported web standards and connectivity](https://www.hostinger.com/support/which-web-standards-and-connectivity-features-are-supported-at-hostinger/). Runtime choice and uncertainty are discussed in [technical sources](CHUNK-01-TECHNICAL-SOURCES.md).

