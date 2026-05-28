# Reference assets — source of truth

These files are the **source of truth** for the course catalog. Treat them as canon when populating the database in Phase 2+.

| File | Origin | Notes |
|---|---|---|
| `planning-formation-juin-2026.pdf` | Provided by Advancia | Clean 3-page brochure listing all June 2026 sessions. Used to seed `src/data/seed.ts`. |
| `Calendrier-formations-s1-2026.pdf` | Provided by Advancia | Full S1 2026 catalog (18 pages, ~250 courses across all domains). Column-heavy; needs layout-aware parsing later — `pymupdf`'s plain-text extraction interleaves columns. |
| `calendar-s1-2026.raw.txt` | Generated via `python -c "fitz..."` | Raw text from the S1 PDF, retained so we don't re-run extraction. Order is unreliable — use for keyword search, not direct ingest. |

## When you ingest these

- Map vendors → categories (Cisco, Microsoft, Fortinet, EC-Council, PECB, PaloAlto, IBM, Togaf, PMI, ITIL/PeopleCert).
- Each course has: reference code (`CCNA`, `AZ-104`, etc.), title, duration (`5J` = 5 days), and per-month dates (`15 au 19` = 15th to 19th).
- `Nous consulter` = "contact us" — no scheduled date for that month.

## Branding inputs

- Logo: see `/public/brand/advancia-logo.png` (extracted from `company_logo.png` provided by the user).
- Tagline (cover of the brochure): "Boost your career — get certified."
- Offices: Tunisia (HQ), Morocco, France, Côte d'Ivoire — see `Footer.tsx` and `/contact`.
- Primary email: `service-clients@advancia-training.com`. Website: `https://www.advancia-training.com`.
