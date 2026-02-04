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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg style={{ width: '20px', height: '20px', color: '#FFA500' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h2 style={{ margin: 0 }}>{t('trade.create_new')}</h2>
            </div>
            <p style={{ color: '#71717a', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{t('trade.init_desc')}</p>
            <div>
                <label style={{ color: '#a1a1aa', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                    {t('trade.seller_addr')}
                </label>
                <input
                    placeholder="cfxtest:..."
                    value={seller}
                    onChange={e => setSeller(e.target.value)}
                />

                <label style={{ color: '#a1a1aa', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                    {t('trade.amount')}
                </label>
                <input
                    placeholder="0.00"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />

                <label style={{ color: '#a1a1aa', fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                    {t('trade.desc')}
                </label>
                <textarea
                    placeholder={t('trade.desc')}
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    style={{ minHeight: '80px' }}
                />

                <button
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    onClick={handleCreate}
                    disabled={creating || !account}
                >
                    {creating && <Loader2 className="animate-spin" size={16} />}
                    {t('trade.create_btn')}
                </button>
            </div>
        </div>
    );
};
