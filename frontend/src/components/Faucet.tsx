import { useState } from 'react';
import { useApp } from '../AppContext';
import { Droplets, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ContractAddresses from '../contracts/contract-addresses.json';

export const Faucet = () => {
    const { tokenContract, account } = useApp();
    const { t } = useTranslation();
    const [minting, setMinting] = useState(false);

    const handleMint = async () => {
        if (!tokenContract || !account) return;
        setMinting(true);
        try {
            const amount = BigInt(1000) * BigInt(1e18);
            const data = tokenContract.mint(account, amount).data;
            // @ts-ignore
            await window.conflux.request({
                method: 'cfx_sendTransaction',
                params: [{
                    from: account,
                    to: ContractAddresses.MockERC20,
                    data: data
                }]
            });

            alert(t('faucet.mint_success'));
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert(t('faucet.mint_failed'));
        } finally {
            setMinting(false);
        }
    };

    if (!account) return null;

    return (
        <button
            onClick={handleMint}
            disabled={minting}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                borderRadius: '50%',
                width: '3.5rem',
                height: '3.5rem',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 100
            }}
            title={t('faucet.mint')}
        >
            {minting ? <Loader2 className="animate-spin" /> : <Droplets />}
        </button>
    );
};
