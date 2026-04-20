"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFORCE_TENANTS = void 0;
exports.getTenantBySlug = getTenantBySlug;
exports.filterTenantsByQuery = filterTenantsByQuery;
exports.WORKFORCE_TENANTS = [
    { slug: "summit-hospitality-group", name: "Summit Hospitality Group" },
    { slug: "lakeside-health-system", name: "Lakeside Health System" },
    { slug: "ridgeline-health-services", name: "Ridgeline Health Services" },
    { slug: "granite-ridge-federal-credit-union", name: "Granite Ridge Federal Credit Union" },
    { slug: "northwind-logistics", name: "Northwind Logistics" },
    { slug: "harborline-financial", name: "Harborline Financial" },
];
function getTenantBySlug(slug) {
    if (!slug)
        return undefined;
    return exports.WORKFORCE_TENANTS.find((t) => t.slug === slug);
}
function filterTenantsByQuery(query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return [];
    return exports.WORKFORCE_TENANTS.filter((t) => t.name.toLowerCase().includes(q));
}
