# Practice Lab observability

Monitor `GET /practice/api/v1/health` from a service that can supply the staging Basic-auth gate. Check every five minutes from one region and alert after three consecutive non-200 responses or when `status`, `storage.status`, or the active release ID changes unexpectedly. Do not put credentials or response bodies in public monitors.

The health payload exposes a bounded rolling window of the last 1,000 application requests:

- `requestCount`;
- `p95LatencyMs`;
- `realErrorRate` for HTTP 5xx responses after excluding simulated failures;
- `simulatedErrorsExcluded: true`.

PHP error logs emit one JSON object after the `[practice-lab]` prefix with `event`, `requestId`, `status`, `code`, normalized `route`, and `simulated`. Logs contain no request bodies, cookies, tokens, credentials, email addresses, uploaded content, or WordPress data. Treat `simulated: true` as Lab traffic and exclude it from real-error alerts. Recommended alerts are health failure, p95 above 1,500 ms for 15 minutes, or real error rate above 1% with at least 100 real requests.
