import { useEffect } from "react";
import { useSuiClientContext } from '@mysten/dapp-kit';
import { isEnokiNetwork, registerEnokiWallets } from '@mysten/enoki';

function RegisterEnokiWallets() {
	const { client, network } = useSuiClientContext();
 
	useEffect(() => {
		if (!isEnokiNetwork(network)) return;
 
		const { unregister } = registerEnokiWallets({
			apiKey: import.meta.env.VITE_ENOKI_API_KEY,
			providers: {
				// Provide the client IDs for each of the auth providers you want to use:
				google: {
					clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				},
			},
			client,
			network,
		});
 
		return unregister;
	}, [client, network]);
 
	return null;
} export default RegisterEnokiWallets