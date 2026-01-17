import { type InferRequestType } from 'hono/client';

import hc from './honoClient';

type Client = typeof hc;

type ValidateStructure<TClient, TKeys> = {
  [K in keyof TKeys]: K extends keyof TClient
    ? TKeys[K] extends (...args: unknown[]) => unknown
      ? TKeys[K] & ValidateStructure<TClient[K], Omit<TKeys[K], keyof ((...args: unknown[]) => unknown)>>
      : ValidateStructure<TClient[K], TKeys[K]>
    : never;
};

const createQueryKeys = <T extends ValidateStructure<Client, T>>(q: T) => q;

export const queryKeys = createQueryKeys({
  user: {
    clerk: {
      profile: () => ['user', 'clerk', 'profile'] as const,
      account: () => ['user', 'clerk', 'account'] as const,
      menu: () => ['user', 'clerk', 'menu'] as const,
    },
    record: Object.assign(
      (args?: Partial<InferRequestType<Client['user']['record']['$get']>>) => ['user', 'record', args] as const,
      {
        count: () => ['user', 'record', 'count'] as const,
        ranking: () => ['user', 'record', 'ranking'] as const,
      }
    ),
  },
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    accounts: (args?: Partial<InferRequestType<Client['admin']['accounts']['$get']>>) =>
      ['admin', 'accounts', args] as const,
    norms: (args?: Partial<InferRequestType<Client['admin']['norms']['$get']>>) => ['admin', 'norms', args] as const,
    users: (userId: string, args?: Partial<InferRequestType<Client['admin']['users'][':userId']['$get']>>['query']) =>
      ['admin', 'users', userId, { query: args }] as const,
  },
});
