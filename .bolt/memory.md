# Project memory

## Product intent & audience

- Full-stack app for job posting fraud/security analysis: users submit job URLs, which are evaluated against ten predefined test cases via a centralized rule engine.
- Frontend: Vite + React. Backend: Java.
- Audience: job seekers and professionals who need to vet job postings for legitimacy and security risks.

## Brand personality & voice

- Professional, trustworthy, security-focused; production-quality polish.
- UI should feel credible and authoritative given fraud-detection context.

## Visual design & UX direction

- Hero section on landing page features `hr_image.webp` with floating warning cards positioned around it.
- Image presentation: rounded corners, white edge/border, layered professional shadows, centered cropping, optimized loading/decoding, descriptive alt text.
- Styling: Tailwind CSS classes; icons from `lucide-react`.
- Import path alias: `@/` → `src/`.
- Avoid cookie-cutter layouts; aim for distinctive, production-worthy visuals.

## Decisions, constraints & rationale

- No extra UI theme/icon packages beyond Tailwind + Lucide React unless explicitly requested.
- Hero image replaced with user-uploaded `hr_image.webp`; presentation refined for crisp edges and shadows.
- Builds verified after image changes.

## Open questions & assumptions

- Java backend API endpoints and integration contract with React frontend not yet detailed.
- Specific content of the ten test cases and rule engine logic not yet specified.
- User authentication and result persistence flow not yet defined.