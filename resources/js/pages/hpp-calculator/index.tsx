import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface CostItem {
    id: string;
    name: string;
    amount: number;
}

export default function HppCalculator() {
    const { t } = useTranslation();
    const [productName, setProductName] = useState('');
    const [costs, setCosts] = useState<CostItem[]>([
        { id: '1', name: 'page.hpp_calculator.default_costs.raw_material', amount: 0 },
        { id: '2', name: 'page.hpp_calculator.default_costs.packaging', amount: 0 },
        { id: '3', name: 'page.hpp_calculator.default_costs.operational', amount: 0 },
    ]);
    const [margin, setMargin] = useState(20);
    const [quantity, setQuantity] = useState(1);

    // Total HPP Sum
    const totalHpp = useMemo(() => {
        return costs.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [costs]);

    // HPP per Unit
    const hppPerUnit = useMemo(() => {
        const safeQty = Math.max(quantity, 1);
        return totalHpp / safeQty;
    }, [totalHpp, quantity]);

    // Calculate suggested selling price per unit
    const suggestedPrice = useMemo(() => {
        const safeMargin = Math.min(Math.max(margin, 0), 99);
        return hppPerUnit / (1 - safeMargin / 100);
    }, [hppPerUnit, margin]);

    // Estimated Profit per unit
    const profit = useMemo(() => {
        return Math.max(0, suggestedPrice - hppPerUnit);
    }, [suggestedPrice, hppPerUnit]);

    // Add a new cost row
    const addCostItem = () => {
        setCosts([
            ...costs,
            { id: Date.now().toString(), name: '', amount: 0 },
        ]);
    };

    // Remove a cost row
    const removeCostItem = (id: string) => {
        if (costs.length > 1) {
            setCosts(costs.filter((item) => item.id !== id));
        } else {
            setCosts([{ id: '1', name: '', amount: 0 }]);
        }
    };

    // Update specific cost row field
    const updateCostItem = (id: string, field: 'name' | 'amount', value: string | number) => {
        setCosts(
            costs.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    // Reset form
    const handleReset = () => {
        setProductName('');
        setCosts([
            { id: '1', name: 'page.hpp_calculator.default_costs.raw_material', amount: 0 },
            { id: '2', name: 'page.hpp_calculator.default_costs.packaging', amount: 0 },
            { id: '3', name: 'page.hpp_calculator.default_costs.operational', amount: 0 },
        ]);
        setMargin(20);
        setQuantity(1);
    };

    // Format to Rupiah currency
    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <>
            <Head title={t('page.hpp_calculator.title', 'Kalkulator HPP')} />
            
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('page.hpp_calculator.title', 'Kalkulator HPP')}</h1>
                    <p className="text-muted-foreground text-sm">
                        {t('page.hpp_calculator.subtitle', 'Simulasikan Harga Pokok Penjualan (HPP) dan tentukan harga jual produk Anda.')}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left: Costs Inputs */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-xl border bg-card p-6 shadow-xs">
                            <h2 className="text-lg font-semibold mb-4">{t('page.hpp_calculator.detail_section', 'Detail Simulasi')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">{t('page.hpp_calculator.product_name', 'Nama Produk (Opsional)')}</label>
                                    <input
                                        type="text"
                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder={t('page.hpp_calculator.product_placeholder', 'Contoh: Nasi Goreng Spesial')}
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{t('page.hpp_calculator.quantity_label', 'Banyak Barang / Qty Produksi')}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="1"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setQuantity(isNaN(val) ? 1 : Math.max(1, val));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-xs">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">{t('page.hpp_calculator.costs_section', 'Komponen Biaya')}</h2>
                                <button
                                    onClick={addCostItem}
                                    className="inline-flex items-center gap-1.5 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
                                >
                                    <Plus className="h-4 w-4" /> {t('page.hpp_calculator.add_row', 'Tambah Baris')}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {costs.map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder={t('page.hpp_calculator.cost_placeholder', 'Komponen Biaya') + ` ${index + 1}`}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                value={item.name.startsWith('page.hpp_calculator.default_costs.') ? t(item.name) : item.name}
                                                onChange={(e) =>
                                                    updateCostItem(item.id, 'name', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <NumericFormat
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="Rp "
                                                allowNegative={false}
                                                customInput={Input}
                                                placeholder="Rp 0"
                                                value={item.amount === 0 ? '' : item.amount}
                                                onValueChange={(values) => {
                                                    const { floatValue } = values;
                                                    updateCostItem(
                                                        item.id,
                                                        'amount',
                                                        floatValue === undefined ? 0 : floatValue
                                                    );
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeCostItem(item.id)}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 w-9 text-destructive"
                                            title="Hapus komponen"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Calculations Summary */}
                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 shadow-xs sticky top-6">
                            <h2 className="text-lg font-semibold mb-4">{t('page.hpp_calculator.result_section', 'Hasil Simulasi')}</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-medium">{t('page.hpp_calculator.target_margin', 'Target Margin (%)')}</label>
                                        <span className="text-sm font-bold text-primary">{margin}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="99"
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                        value={margin}
                                        onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        className="mt-2 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden"
                                        value={margin}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setMargin(isNaN(val) ? 0 : Math.min(Math.max(0, val), 99));
                                        }}
                                    />
                                </div>

                                <hr className="border-border" />

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">{t('page.hpp_calculator.total_hpp', 'Total HPP (Total Biaya)')}</span>
                                        <span className="text-sm font-semibold">{formatRupiah(totalHpp)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">{t('page.hpp_calculator.banyak_barang', 'Banyak Barang')}</span>
                                        <span className="text-sm font-semibold">{quantity} unit</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">{t('page.hpp_calculator.hpp_per_unit', 'HPP per Unit')}</span>
                                        <span className="text-sm font-semibold">{formatRupiah(hppPerUnit)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">{t('page.hpp_calculator.margin_profit', 'Margin Keuntungan')} ({margin}%)</span>
                                        <span className="text-sm font-semibold text-emerald-600">
                                            +{formatRupiah(profit)} / unit
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t">
                                        <span className="text-base font-bold">{t('page.hpp_calculator.suggested_price', 'Rekomendasi Jual / Unit')}</span>
                                        <span className="text-base font-bold text-primary">
                                            {formatRupiah(suggestedPrice)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 inline-flex items-center gap-1.5 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                    >
                                        <RotateCcw className="h-4 w-4" /> {t('page.hpp_calculator.reset', 'Reset')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
