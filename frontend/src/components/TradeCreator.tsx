import { useState } from 'react';
import { useApp } from '../AppContext';
import { Loader2 } from 'lucide-react';
import { Drip } from 'js-conflux-sdk';
import { useTranslation } from 'react-i18next';

export const TradeCreator = () => {
    const { escrowContract, account } = useApp();
    const { t } = useTranslation();
    const [seller, setSeller] = useState('');
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!escrowContract || !account) return alert(t('common.connect_first'));
        if (!seller || !amount || !desc) return alert(t('common.fill_all'));

        try {
            setCreating(true);
            const amountDrip = Drip.fromCFX(amount);
            const txData = escrowContract.createTrade(seller, amountDrip.toString(), desc).data;

            const txParams = {
                from: account,
                to: escrowContract.address,
                data: txData,
                value: '0x0'
            };

            // @ts-ignore
            await window.conflux.request({
                method: 'cfx_sendTransaction',
                params: [txParams]
            });
            alert(t('common.success'));
            setSeller('');
            setAmount('');
            setDesc('');
        } catch (e) {
            console.error(e);
            alert(t('common.error', { message: (e as any).message }));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="card">
            <h2>{t('trade.create_new')}</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{t('trade.init_desc')}</p>
            <div>
                <label>{t('trade.seller_addr')}</label>
                <input
                    placeholder="cfxtest:..."
                    value={seller}
                    onChange={e => setSeller(e.target.value)}
                />

                <label>{t('trade.amount')}</label>
                <input
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />

                <label>{t('trade.desc')}</label>
                <textarea
                    placeholder={t('trade.desc')}
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                />

                <button
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                    onClick={handleCreate}
                    disabled={creating || !account}
                >
                    {creating && <Loader2 className="animate-spin" />}
                    {t('trade.create_btn')}
                </button>
            </div>
        </div>
    );
};
