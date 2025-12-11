/**
 * Ensure Turbopack/Next uses the frontend folder as the workspace root
 * to avoid picking the monorepo/root package-lock.json.
 */
export default {
  turbopack: {
    // set to the frontend directory itself
    root: './',
  },
}
