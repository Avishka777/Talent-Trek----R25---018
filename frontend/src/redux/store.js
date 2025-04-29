import { configureStore, combineReducers } from "@reduxjs/toolkit";

import themeReducer from "./theme/themeSlice";
import agentReducer from "./activateAgent/agentSlice";

import { persistReducer, persistStore } from "redux-persist";

import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  theme: themeReducer,
  agent: agentReducer,
});

const persistConfig = {
  key: "root",

  storage,

  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
