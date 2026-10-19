# GIS and MapLibre integration

**Phase 3A · browser proposal, Backend authority `c2b5945d57800fb0e557151bdbf83b60639adcb8`.**


**Contract rule.** Every API reference below links to the single primary entry in the [full API catalog](../04_API-Contracts/02_Full-API-Catalog.md). The catalog is authoritative for exact method, route, parameters, DTO/schema, headers, K/version, response and source locator. This chapter defines proposed Web presentation and orchestration; it does not create a route or grant a role.

For every screen, FE must bind fields from the response DTO and request fields from the request DTO exactly as catalogued. “DTO fields” means the named schema properties in the catalog; no unlisted field, enum, status or local authority is assumed. `CURRENT_IMPLEMENTED_BE` means source-backed route/guard; `PROPOSED_WEB_UI` means UI composition; `NOT_VERIFIED_WEB_E2E` means no Web client runtime was supplied.


## Boundary

Road GIS segments/sections, route versions, geometry drafts, CRS profiles and pavement/slab layouts are domain data. Image-based road segmentation/masks are an AI/data product and must not be presented as GIS segment geometry. No mandated service for image segmentation is introduced. AI bbox/confidence is not a physical measurement.

## Map surfaces

| Surface | Reads | Commands | UI behavior |
|---|---|---|---|
| Project geometry | [API-104](../04_API-Contracts/02_Full-API-Catalog.md#api-104), [API-177](../04_API-Contracts/02_Full-API-Catalog.md#api-177), [API-178](../04_API-Contracts/02_Full-API-Catalog.md#api-178), [API-182](../04_API-Contracts/02_Full-API-Catalog.md#api-182) | [API-179](../04_API-Contracts/02_Full-API-Catalog.md#api-179), [API-180](../04_API-Contracts/02_Full-API-Catalog.md#api-180), [API-181](../04_API-Contracts/02_Full-API-Catalog.md#api-181) | Draw/edit/preview/confirm only via server DTO and lifecycle gate. |
| Road section/version | [API-185](../04_API-Contracts/02_Full-API-Catalog.md#api-185), [API-192](../04_API-Contracts/02_Full-API-Catalog.md#api-192), [API-194](../04_API-Contracts/02_Full-API-Catalog.md#api-194) | [API-183](../04_API-Contracts/02_Full-API-Catalog.md#api-183), [API-184](../04_API-Contracts/02_Full-API-Catalog.md#api-184), [API-186](../04_API-Contracts/02_Full-API-Catalog.md#api-186), [API-187](../04_API-Contracts/02_Full-API-Catalog.md#api-187), [API-191](../04_API-Contracts/02_Full-API-Catalog.md#api-191), [API-193](../04_API-Contracts/02_Full-API-Catalog.md#api-193), [API-195](../04_API-Contracts/02_Full-API-Catalog.md#api-195), [API-196](../04_API-Contracts/02_Full-API-Catalog.md#api-196) | Keep route version/set IDs visible; do not overwrite a newer version. |
| CRS/layers/pavement | [API-065](../04_API-Contracts/02_Full-API-Catalog.md#api-065), [API-067](../04_API-Contracts/02_Full-API-Catalog.md#api-067), [API-103](../04_API-Contracts/02_Full-API-Catalog.md#api-103), [API-131](../04_API-Contracts/02_Full-API-Catalog.md#api-131) | [API-066](../04_API-Contracts/02_Full-API-Catalog.md#api-066), [API-132](../04_API-Contracts/02_Full-API-Catalog.md#api-132) | Display CRS and layer metadata from response; axis/order conversion is adapter concern, not guessed in UI. |

## Version/concurrency

Read current version/readiness before edit; send the exact request DTO and declared K/version headers. On 409/412/428, keep the draft locally as unsent, refetch, show a conflict diff and require user choice. A successful preview is not publication. Geometry publication remains a server lifecycle decision.

`PROPOSED_WEB_UI`: MapLibre map, pins and layer toggles. `CURRENT_IMPLEMENTED_BE`: routes/DTO/guards. `NOT_VERIFIED_WEB_E2E`: CRS rendering, tile source, browser performance, spatial precision and deployed GIS.
