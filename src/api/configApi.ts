import { portalService } from '@/common/api/apiServices';
import { ApiMethodE } from '@constants/api';
import { PortalTagTypeE } from '@/common/enums/tag-type';
import type { AddonItem } from '../types';

export interface SystemConfig {
  vehicles: Record<string, { versions: { name: string; colorPrices: Record<string, number> }[]; colors: string[] }>;
  addons: AddonItem[];
  gifts: string[];
}

export const configApi = portalService.injectEndpoints({
  endpoints: (builder) => ({
    getSystemConfig: builder.query<SystemConfig, void>({
      query: () => ({
        url: '/config',
        method: ApiMethodE.GET,
      }),
      providesTags: [PortalTagTypeE.SYSTEM_CONFIG],
    }),
    updateSystemConfig: builder.mutation<SystemConfig, Partial<SystemConfig>>({
      query: (data) => ({
        url: '/config',
        method: ApiMethodE.PATCH,
        body: data,
      }),
      invalidatesTags: [PortalTagTypeE.SYSTEM_CONFIG],
    }),
  }),
});

export const {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} = configApi;
