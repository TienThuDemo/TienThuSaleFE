import { portalService } from '@/common/api/apiServices';
import { PortalTagTypeE } from '@/common/enums/tag-type';
import { invalidateIfSuccess } from '@/common/utils/api';
import { ApiEndpointE, ApiMethodE } from '@constants/api';
import type { Order, OrderStatus } from '../types';

export const orderApi = portalService.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => ({
        url: ApiEndpointE.ORDER,
        method: ApiMethodE.GET,
      }),
      providesTags: [PortalTagTypeE.ORDER_GET_LIST],
    }),

    getOrderById: builder.query<Order | undefined, string>({
      query: (id) => ({
        url: `${ApiEndpointE.ORDER}/${id}`,
        method: ApiMethodE.GET,
      }),
      providesTags: [PortalTagTypeE.ORDER_DETAIL],
    }),

    createOrder: builder.mutation<Order, Order>({
      query: (data) => ({
        url: ApiEndpointE.ORDER,
        method: ApiMethodE.POST,
        body: data,
      }),
      invalidatesTags: invalidateIfSuccess([PortalTagTypeE.ORDER_GET_LIST]),
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `${ApiEndpointE.ORDER}/${id}`,
        method: ApiMethodE.PATCH,
        body: { status },
      }),
      invalidatesTags: invalidateIfSuccess([
        PortalTagTypeE.ORDER_GET_LIST,
        PortalTagTypeE.ORDER_DETAIL,
      ]),
    }),

    updateOrder: builder.mutation<
      Order,
      {
        id: string;
        data: Partial<Pick<Order, 'customerInfo' | 'vehicleItems' | 'paymentInfo' | 'promotionInfo' | 'addons' | 'note'>>;
      }
    >({
      query: ({ id, data }) => ({
        url: `${ApiEndpointE.ORDER}/${id}`,
        method: ApiMethodE.PATCH,
        body: data,
      }),
      invalidatesTags: invalidateIfSuccess([
        PortalTagTypeE.ORDER_GET_LIST,
        PortalTagTypeE.ORDER_DETAIL,
      ]),
    }),

    updateOrderContract: builder.mutation<Order, { id: string; contractInfo: Order['contractInfo'] }>({
      query: ({ id, contractInfo }) => ({
        url: `${ApiEndpointE.ORDER}/${id}`,
        method: ApiMethodE.PATCH,
        body: { contractInfo },
      }),
      invalidatesTags: invalidateIfSuccess([
        PortalTagTypeE.ORDER_GET_LIST,
        PortalTagTypeE.ORDER_DETAIL,
      ]),
    }),

    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `${ApiEndpointE.ORDER}/${id}`,
        method: ApiMethodE.DELETE,
      }),
      invalidatesTags: invalidateIfSuccess([PortalTagTypeE.ORDER_GET_LIST]),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useLazyGetOrdersQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateOrderMutation,
  useUpdateOrderContractMutation,
  useDeleteOrderMutation,
} = orderApi;
