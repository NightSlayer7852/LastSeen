import { treaty } from '@elysiajs/eden'
import type { App } from '../app/api/[[...slugs]]/route'

const base =
    typeof window === "undefined"
        ? ""
        : window.location.origin;

// .api to enter /api prefix
export const client = treaty<App>(base).api;
