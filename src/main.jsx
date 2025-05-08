import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router.jsx";
import { networkConfig } from "./config/networkConfig.js";
import "@mysten/dapp-kit/dist/index.css";
import RegisterEnokiWallets from "./config/RegisterEnokiWallets.js";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
      <RegisterEnokiWallets />
        <WalletProvider autoConnect>
          <RouterProvider router={router} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>
);
