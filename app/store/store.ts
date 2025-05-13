import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./loaderSlice";
export const store = configureStore({
    reducer: {
        loading: loadingReducer,
      },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;