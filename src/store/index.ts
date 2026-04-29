import { configureStore } from '@reduxjs/toolkit';
import { portalService } from '../common/api/apiServices';

export const store = configureStore({
  reducer: {
    [portalService.reducerPath]: portalService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(portalService.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
