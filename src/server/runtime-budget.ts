// Keep provider work below the route's 240s operation budget and Vercel
// Hobby's 300s Fluid Compute ceiling, including Redis and final verification.
export const PROVIDER_BUDGET_MS = 210_000;
export const RESPONSE_RESERVE_MS = 15_000;
export const RETRY_MINIMUM_REMAINING_MS = 15_000;
