# Route KPI Checklist

> Purpose: Baseline adoption/usage tracking for new MVP routes.
> Last updated: 2026-03-09

## Routes

### /creator-studio

| Dimension         | Value                                      |
| ----------------- | ------------------------------------------ |
| Entry sources     | Header nav, Footer products, Search, /search page |
| First action      | View feature cards (Coming Soon)           |
| Revisit indicator | N/A (static page, no user state)           |
| Reporting cadence | Post-launch: weekly pageview check         |

### /analysis-history

| Dimension         | Value                                      |
| ----------------- | ------------------------------------------ |
| Entry sources     | Search, /search page                       |
| First action      | View last analysis result from localStorage |
| Revisit indicator | localStorage entry exists (`crowncode:last-analysis`) |
| Reporting cadence | Post-launch: weekly active users with history |

### /system-status

| Dimension         | Value                                      |
| ----------------- | ------------------------------------------ |
| Entry sources     | Header nav ("Status"), Footer products, Search, /search page |
| First action      | Auto health check on mount                 |
| Revisit indicator | Refresh button usage                       |
| Reporting cadence | Post-launch: weekly pageview + error rate  |

## Measurement Notes

- Pageview data source: Netlify Analytics (server-side, no JS required).
- localStorage-based revisit indicators are client-only; no server telemetry needed.
- For deeper funnel analysis, integrate `/api/vitals` CLS/LCP metrics per route.
