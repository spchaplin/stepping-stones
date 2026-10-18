export const SUB_APPS = {
  plank: { path: '/plank', active: true },
  strategizer: { path: '/strategizer', active: true },
  'expanding-edge': { path: '/expanding-edge', active: true },
  'life-vision': { path: '/life-vision', active: false },
} as const;

export type SubAppId = keyof typeof SUB_APPS;

export function isSubAppActive(id: SubAppId): boolean {
  return SUB_APPS[id].active;
}
