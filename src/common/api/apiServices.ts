import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PortalTagTypeE } from '../enums/tag-type';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || 'http://localhost:3001';

export const portalService = createApi({
  reducerPath: 'portalApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: Object.values(PortalTagTypeE),
  endpoints: () => ({}),
});
