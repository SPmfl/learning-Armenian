/** Prefija una ruta interna con `import.meta.env.BASE_URL` (permite desplegar en un subdirectorio). */
export function href(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : `/${path}`);
}
