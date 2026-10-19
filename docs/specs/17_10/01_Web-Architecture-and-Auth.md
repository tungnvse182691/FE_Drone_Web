# Web architecture and authentication

**Phase 3A · source baseline `c2b5945d57800fb0e557151bdbf83b60639adcb8` · proposed Web UI, current BE transport.**


**Contract rule.** Every API reference below links to the single primary entry in the [full API catalog](../04_API-Contracts/02_Full-API-Catalog.md). The catalog is authoritative for exact method, route, parameters, DTO/schema, headers, K/version, response and source locator. This chapter defines proposed Web presentation and orchestration; it does not create a route or grant a role.

For every screen, FE must bind fields from the response DTO and request fields from the request DTO exactly as catalogued. “DTO fields” means the named schema properties in the catalog; no unlisted field, enum, status or local authority is assumed. `CURRENT_IMPLEMENTED_BE` means source-backed route/guard; `PROPOSED_WEB_UI` means UI composition; `NOT_VERIFIED_WEB_E2E` means no Web client runtime was supplied.


## Browser session sequence

1. GET CSRF bootstrap: [API-013](../04_API-Contracts/02_Full-API-Catalog.md#api-013).
2. POST credentials: [API-014](../04_API-Contracts/02_Full-API-Catalog.md#api-014); send CSRF header `X-CSRF-TOKEN` for state-changing requests and retain server cookies.
3. Renew finite session: [API-016](../04_API-Contracts/02_Full-API-Catalog.md#api-016); inspect session: [API-017](../04_API-Contracts/02_Full-API-Catalog.md#api-017); logout: [API-015](../04_API-Contracts/02_Full-API-Catalog.md#api-015). Legacy login routes are catalogued but must not be silently substituted for Web flow.
4. On 401, perform one controlled renew, then retry the original command only when its K is safely replayable. On 403 show authorization state; do not hide a server denial as a client validation error.

Cookie names, lifetime, SameSite/secure policy and CSRF behavior are defined in [Phase 2C auth contracts](../04_API-Contracts/04_Authentication-and-Authorization-Contracts.md); Web UI must not read HttpOnly cookies. No persistent session is perpetual.

## Protected route model

| Web area | Minimum server boundary | Startup reads | Notes |
|---|---|---|---|
| Supervisor global | Supervisor role plus operation/resource guard | session, notifications, project/case summaries | Global role does not grant PM/Crew commands or private evidence. |
| PM project workspace | active membership/role/project dates and resource guard | session, projects, membership, lifecycle | PM decisions remain server-authorized; route visibility is convenience. |
| Shared case/publication | current project/recipient/owner guard | case/detail/history/publication | Reporter ownership/privacy still applies. |

## Query, pagination, cache and concurrency

Use query parameters and response pagination exactly as listed in each catalog entry. Keep query state in URL only where it is non-sensitive. Cache GETs by project/resource/version; invalidate after a successful command and refetch the authoritative DTO. ETag/If-Match is used only where the catalog/source declares it; do not add an optimistic version header. K is required only where catalog says so, and must be stable for one intentional replay.

## Security boundary

`CURRENT_IMPLEMENTED_BE`: cookie/CSRF/session routes and server RBAC/resource checks. `PROPOSED_WEB_UI`: protected route shell, role-aware navigation, redaction and retry UX. `NOT_VERIFIED_WEB_E2E`: browser cookie storage, renew race behavior, deployed HTTPS, CSP, real SMTP and external SSO.
