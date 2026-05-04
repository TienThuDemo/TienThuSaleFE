// import { portalService, unwrapApiResponse } from '../../common/api/apiServices';
// import { ApiMethodE } from '../../constants/api';
// import { AUTH_API_PATHS } from './auth.constants';
// import type { AuthResult, AuthTokens, AuthenticatedUser } from './auth.types';
//
// interface LoginRequest {
//   email: string;
//   password: string;
// }
//
// interface RegisterRequest {
//   email: string;
//   password: string;
//   confirmPassword: string;
//   name?: string;
//   phoneNumber?: string;
// }
//
// interface RefreshRequest {
//   refreshToken: string;
// }
//
// interface LogoutRequest {
//   refreshToken: string;
// }
//
// interface LogoutResponse {
//   success: true;
// }
//
// export const authApi = portalService.injectEndpoints({
//   endpoints: (builder) => ({
//     login: builder.mutation<AuthResult, LoginRequest>({
//       query: (body) => ({
//         url: AUTH_API_PATHS.LOGIN,
//         method: ApiMethodE.POST,
//         body,
//       }),
//       transformResponse: (response: unknown): AuthResult => unwrapApiResponse<AuthResult>(response),
//     }),
//     register: builder.mutation<AuthResult, RegisterRequest>({
//       query: (body) => ({
//         url: AUTH_API_PATHS.REGISTER,
//         method: ApiMethodE.POST,
//         body,
//       }),
//       transformResponse: (response: unknown): AuthResult => unwrapApiResponse<AuthResult>(response),
//     }),
//     refreshToken: builder.mutation<AuthTokens, RefreshRequest>({
//       query: (body) => ({
//         url: AUTH_API_PATHS.REFRESH,
//         method: ApiMethodE.POST,
//         body,
//       }),
//       transformResponse: (response: unknown): AuthTokens => unwrapApiResponse<AuthTokens>(response),
//     }),
//     logout: builder.mutation<LogoutResponse, LogoutRequest>({
//       query: (body) => ({
//         url: AUTH_API_PATHS.LOGOUT,
//         method: ApiMethodE.POST,
//         body,
//       }),
//       transformResponse: (response: unknown): LogoutResponse =>
//         unwrapApiResponse<LogoutResponse>(response),
//     }),
//     me: builder.query<AuthenticatedUser, void>({
//       query: () => ({
//         url: AUTH_API_PATHS.ME,
//         method: ApiMethodE.GET,
//       }),
//       transformResponse: (response: unknown): AuthenticatedUser =>
//         unwrapApiResponse<AuthenticatedUser>(response),
//     }),
//   }),
// });
//
// export const {
//   useLoginMutation,
//   useRegisterMutation,
//   useLogoutMutation,
//   useRefreshTokenMutation,
//   useMeQuery,
// } = authApi;

// ----- MOCK IMPLEMENTATION -----
export {
  useMockLoginMutation as useLoginMutation,
  useMockRegisterMutation as useRegisterMutation,
  useMockLogoutMutation as useLogoutMutation,
} from './auth.mock';
