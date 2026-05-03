import React, { useState, useMemo } from 'react';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, 
  Settings, Info, ArrowRightLeft, BarChart3, 
  ShieldCheck, UserCheck, Percent, Layers, ChevronDown, Copy, Terminal
} from 'lucide-react';

// --- UI Components ---
const ResultDetails = ({ steps, scripts }) => (
  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
        <Terminal size={20} className="text-[#B9F641]" />
        <h2 className="text-lg font-bold text-gray-900">Step-by-Step Calculation</h2>
      </div>
      <div className="space-y-4 font-mono text-sm">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-gray-500 font-bold mb-1 font-sans text-xs uppercase">{step.label}</p>
            <p className="text-gray-800 break-all">{step.formula}</p>
            {step.result && <p className="text-[#7ab317] font-bold mt-1">= {step.result}</p>}
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Copy size={20} className="text-[#B9F641]" />
          <h2 className="text-lg font-bold text-gray-900">CS Response Scripts</h2>
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to Copy</span>
      </div>
      <div className="space-y-3">
        {scripts.map((script, idx) => (
          <div 
            key={idx} 
            onClick={() => navigator.clipboard.writeText(script)}
            className="group relative bg-gray-50 hover:bg-[#B9F641]/10 p-4 rounded-xl border border-gray-100 transition-colors cursor-pointer" 
          >
            <p className="text-gray-700 text-sm leading-relaxed pr-8">{script}</p>
            <div className="absolute top-4 right-4 text-gray-400 group-hover:text-[#B9F641] transition-colors">
              <Copy size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Moving InputField outside prevents it from unmounting and losing focus on every state change.
const InputField = ({ label, value, onChange, icon: Icon, suffix }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
        <Icon size={18} />
      </div>
      <input 
        type="number" 
        value={value === 0 ? '' : value} 
        onChange={e => {
          const val = e.target.value;
          onChange(val === '' ? 0 : parseFloat(val));
        }} 
        className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B9F641] focus:ring-4 focus:ring-[#B9F641]/20 outline-none transition-all duration-200 text-gray-800 font-medium shadow-sm" 
        placeholder="0.00"
      />
      {suffix && <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 text-sm font-medium pointer-events-none">{suffix}</div>}
    </div>
  </div>
);

export default function FuturesCalculator({ data }) {
  const [activeTab, setActiveTab] = useState('fees');

  // --- Data Extraction & Parsing ---
  const vipLevels = useMemo(() => {
    return [
      { level: 'VIP 0', maker: 0.0002, taker: 0.0006 },
      { level: 'VIP 1', maker: 0.0002, taker: 0.0005 },
      { level: 'VIP 2', maker: 0.00016, taker: 0.0005 },
      { level: 'VIP 3', maker: 0.00014, taker: 0.0004 },
      { level: 'VIP 4', maker: 0.00012, taker: 0.000375 },
      { level: 'VIP 5', maker: 0.0001, taker: 0.00035 },
      { level: 'VIP 6', maker: 0.00008, taker: 0.000315 },
      { level: 'VIP 7', maker: 0.00006, taker: 0.0003 }
    ];
  }, []);

  const [longInputs, setLongInputs] = useState({ entryPrice: 62305.3, size: 0.0143, availableMargin: 43.303, mmr: 0.4 });
  const [shortInputs, setShortInputs] = useState({ entryPrice: 4.386, size: 77, availableMargin: 6.622, mmr: 1 });
  const [tradeInputs, setTradeInputs] = useState({ size: 1, openingPrice: 60000, closingPrice: 65000, leverage: 10, vipLevel: 'VIP 0', openFeeType: 'taker', closeFeeType: 'taker' });
  const [liqScriptTab, setLiqScriptTab] = useState('long');
  const [pnlType, setPnlType] = useState('raw');

  // --- Calculations ---
  const liqPriceLong = useMemo(() => {
    const { entryPrice, size, availableMargin, mmr } = longInputs;
    if (!entryPrice || !size) return 0;
    const mmrDec = mmr / 100;
    const mmValue = size * mmrDec * entryPrice;
    const val = entryPrice - ((availableMargin - mmValue) / size);
    return val > 0 ? val : 0;
  }, [longInputs]);

  const liqPriceShort = useMemo(() => {
    const { entryPrice, size, availableMargin, mmr } = shortInputs;
    if (!entryPrice || !size) return 0;
    const mmrDec = mmr / 100;
    const mmValue = size * mmrDec * entryPrice;
    const val = entryPrice + ((availableMargin - mmValue) / size);
    return val > 0 ? val : 0;
  }, [shortInputs]);

  const currentVip = useMemo(() => vipLevels.find(v => v.level === tradeInputs.vipLevel) || vipLevels[0], [vipLevels, tradeInputs.vipLevel]);

  const feeCalcs = useMemo(() => {
    const { size, openingPrice, closingPrice, leverage, openFeeType, closeFeeType } = tradeInputs;
    const { maker, taker } = currentVip;
    const pnl = size * (closingPrice - openingPrice);
    const initialMargin = leverage > 0 ? (size * openingPrice) / leverage : 0;
    
    const openFee = openFeeType === 'maker' ? size * openingPrice * maker : size * openingPrice * taker;
    const closeFee = closeFeeType === 'maker' ? size * closingPrice * maker : size * closingPrice * taker;

    return {
      openTaker: size * openingPrice * taker,
      openMaker: size * openingPrice * maker,
      closeTaker: size * closingPrice * taker,
      closeMaker: size * closingPrice * maker,
      openFee,
      closeFee,
      totalFees: openFee + closeFee,
      pnl,
      netPnl: pnl - (openFee + closeFee),
      initialMargin,
      roi: initialMargin > 0 ? (pnl / initialMargin) * 100 : 0,
      netRoi: initialMargin > 0 ? ((pnl - (openFee + closeFee)) / initialMargin) * 100 : 0
    };
  }, [tradeInputs, currentVip]);

  const pnlStepsRaw = [
    { label: 'Initial Margin', formula: `(${tradeInputs.size} * $${tradeInputs.openingPrice}) / ${tradeInputs.leverage}`, result: `$${feeCalcs.initialMargin.toFixed(4)}` },
    { label: 'Raw Profit & Loss', formula: `${tradeInputs.size} * ($${tradeInputs.closingPrice} - $${tradeInputs.openingPrice})`, result: `$${feeCalcs.pnl.toFixed(4)}` },
    { label: 'Raw Return on Investment (ROI)', formula: `($${feeCalcs.pnl.toFixed(4)} / Initial Margin) * 100`, result: `${feeCalcs.roi.toFixed(2)}%` }
  ];

  const pnlStepsNet = [
    { label: 'Initial Margin', formula: `(${tradeInputs.size} * $${tradeInputs.openingPrice}) / ${tradeInputs.leverage}`, result: `$${feeCalcs.initialMargin.toFixed(4)}` },
    { label: 'Raw Profit & Loss', formula: `${tradeInputs.size} * ($${tradeInputs.closingPrice} - $${tradeInputs.openingPrice})`, result: `$${feeCalcs.pnl.toFixed(4)}` },
    { label: 'Total Fees', formula: `$${feeCalcs.openFee.toFixed(4)} + $${feeCalcs.closeFee.toFixed(4)}`, result: `$${feeCalcs.totalFees.toFixed(4)}` },
    { label: 'Net Profit & Loss', formula: `Raw PnL - Total Fees`, result: `$${feeCalcs.netPnl.toFixed(4)}` },
    { label: 'Net Return on Investment (ROI)', formula: `($${feeCalcs.netPnl.toFixed(4)} / Initial Margin) * 100`, result: `${feeCalcs.netRoi.toFixed(2)}%` }
  ];

  const pnlScriptsRaw = [
    `Hello! Based on a position size of ${tradeInputs.size} at $${tradeInputs.openingPrice}, your estimated raw PnL when closing at $${tradeInputs.closingPrice} would be $${feeCalcs.pnl.toFixed(2)}.`,
    `Hi there. Using ${tradeInputs.leverage}x leverage, your initial margin is $${feeCalcs.initialMargin.toFixed(2)}. The raw profit/loss for this trade is calculated at $${feeCalcs.pnl.toFixed(2)}.`,
    `If your trade hits the $${tradeInputs.closingPrice} target, you will see a raw Return on Investment (ROI) of approximately ${feeCalcs.roi.toFixed(2)}%.`,
    `To answer your question about PnL: a ${tradeInputs.size} unit trade from $${tradeInputs.openingPrice} to $${tradeInputs.closingPrice} results in a $${feeCalcs.pnl.toFixed(2)} change before fees.`,
    `Please note that your estimated PnL of $${feeCalcs.pnl.toFixed(2)} does not include trading fees. You can check the Net PnL option for the exact fee deductions.`
  ];

  const pnlScriptsNet = [
    `Hello! Based on a position size of ${tradeInputs.size} at $${tradeInputs.openingPrice}, your estimated Net PnL (after fees) when closing at $${tradeInputs.closingPrice} would be $${feeCalcs.netPnl.toFixed(2)}.`,
    `Hi there. Using ${tradeInputs.leverage}x leverage, your initial margin is $${feeCalcs.initialMargin.toFixed(2)}. The Net profit/loss for this trade is calculated at $${feeCalcs.netPnl.toFixed(2)}.`,
    `If your trade hits the $${tradeInputs.closingPrice} target, your net Return on Investment (ROI) after fee deduction will be approximately ${feeCalcs.netRoi.toFixed(2)}%.`,
    `To answer your question about PnL: a ${tradeInputs.size} unit trade results in a Net PnL of $${feeCalcs.netPnl.toFixed(2)}, taking into account $${feeCalcs.totalFees.toFixed(2)} in total fees.`,
    `Your Net PnL is calculated by subtracting your total estimated fees ($${feeCalcs.totalFees.toFixed(2)}) from your raw PnL ($${feeCalcs.pnl.toFixed(2)}), giving you exactly $${feeCalcs.netPnl.toFixed(2)}.`
  ];

  const feeSteps = [
    { label: 'Open Fee Rate', formula: `${tradeInputs.openFeeType === 'maker' ? 'Maker' : 'Taker'} Rate (VIP Level: ${tradeInputs.vipLevel})`, result: `${((tradeInputs.openFeeType === 'maker' ? currentVip.maker : currentVip.taker) * 100).toFixed(4)}%` },
    { label: 'Open Fee', formula: `${tradeInputs.size} * $${tradeInputs.openingPrice} * Open Rate`, result: `$${feeCalcs.openFee.toFixed(4)}` },
    { label: 'Close Fee Rate', formula: `${tradeInputs.closeFeeType === 'maker' ? 'Maker' : 'Taker'} Rate (VIP Level: ${tradeInputs.vipLevel})`, result: `${((tradeInputs.closeFeeType === 'maker' ? currentVip.maker : currentVip.taker) * 100).toFixed(4)}%` },
    { label: 'Close Fee', formula: `${tradeInputs.size} * $${tradeInputs.closingPrice} * Close Rate`, result: `$${feeCalcs.closeFee.toFixed(4)}` },
    { label: 'Total Estimated Fees', formula: `$${feeCalcs.openFee.toFixed(4)} + $${feeCalcs.closeFee.toFixed(4)}`, result: `$${feeCalcs.totalFees.toFixed(4)}` }
  ];

  const feeScripts = [
    `Hello! As a ${tradeInputs.vipLevel} user, your estimated total trading fees for this position will be $${feeCalcs.totalFees.toFixed(4)}.`,
    `Hi. Your opening fee (as a ${tradeInputs.openFeeType}) is $${feeCalcs.openFee.toFixed(4)}, and your closing fee (as a ${tradeInputs.closeFeeType}) is $${feeCalcs.closeFee.toFixed(4)}.`,
    `Based on your VIP level (${tradeInputs.vipLevel}), your maker fee is ${(currentVip.maker * 100).toFixed(3)}% and taker fee is ${(currentVip.taker * 100).toFixed(3)}%.`,
    `The total fee deduction for your ${tradeInputs.size} unit trade opening at $${tradeInputs.openingPrice} and closing at $${tradeInputs.closingPrice} is $${feeCalcs.totalFees.toFixed(4)}.`,
    `To calculate your fee: we multiply your position size by the entry/exit price and your VIP fee tier rate. For this trade, it equals $${feeCalcs.totalFees.toFixed(4)}.`
  ];

  const generateLiqSteps = (type, inputs, liqPrice) => {
    const { entryPrice, size, availableMargin, mmr } = inputs;
    const mmrDec = mmr / 100;
    const mmValue = size * mmrDec * entryPrice;
    const marginMinusMM = availableMargin - mmValue;
    const dividedBySize = marginMinusMM / size;
    const sign = type === 'long' ? '-' : '+';
    
    return [
      { label: `Formula (${type.toUpperCase()})`, formula: `Avg. Open Price ${sign} ((Available Margin - Position Size × MMR% × Avg. Open Price) ÷ Position Size)` },
      { label: 'Step 1: Plug in values', formula: `${entryPrice} ${sign} ((${availableMargin} - (${size} × ${mmrDec} × ${entryPrice})) ÷ ${size})` },
      { label: 'Step 2: Calculate MM Value', formula: `${entryPrice} ${sign} ((${availableMargin} - ${mmValue.toFixed(4)}) ÷ ${size})` },
      { label: 'Step 3: Subtract from Margin', formula: `${entryPrice} ${sign} (${marginMinusMM.toFixed(4)} ÷ ${size})` },
      { label: 'Step 4: Divide by Size', formula: `${entryPrice} ${sign} ${Math.abs(dividedBySize).toFixed(4)}`, result: `~${liqPrice.toFixed(4)}` }
    ];
  };

  const liqStepsLong = generateLiqSteps('long', longInputs, liqPriceLong);
  const liqStepsShort = generateLiqSteps('short', shortInputs, liqPriceShort);

  const liqScriptsLong = [
    `Hello! Based on your position size of ${longInputs.size} and available margin of $${longInputs.availableMargin}, the liquidation price for your Long position at $${longInputs.entryPrice} is approximately $${liqPriceLong.toFixed(2)}.`,
    `Liquidation happens when your margin ratio hits 100%. For your Long position, this occurs at a mark price of $${liqPriceLong.toFixed(2)}.`,
    `To calculate your liquidation price, we use your entry price, position size, available margin, and the Maintenance Margin Rate (MMR). Based on those factors, your Long position liquidation is $${liqPriceLong.toFixed(2)}.`
  ];

  const liqScriptsShort = [
    `Hi there. For your Short position entered at $${shortInputs.entryPrice}, with $${shortInputs.availableMargin} in available margin, liquidation will be triggered if the price reaches $${liqPriceShort.toFixed(2)}.`,
    `Please note that your Short position will be liquidated at $${liqPriceShort.toFixed(2)}. You can add more margin to your Available Margin to delay this liquidation.`,
    `To calculate your liquidation price, we use your entry price, position size, available margin, and the Maintenance Margin Rate (MMR). Based on those factors, your Short position liquidation is $${liqPriceShort.toFixed(2)}.`
  ];

  // Using a normal render function instead of a Component so it doesn't unmount
  const renderSharedInputs = () => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
        <Settings size={20} className="text-[#B9F641]" />
        <h2 className="text-lg font-bold text-gray-900">Trade Parameters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-2">
        <InputField label="Position Size" icon={Layers} value={tradeInputs.size} onChange={v => setTradeInputs(p => ({...p, size: v}))} suffix="Units" />
        <InputField label="Opening Price" icon={DollarSign} value={tradeInputs.openingPrice} onChange={v => setTradeInputs(p => ({...p, openingPrice: v}))} />
        <InputField label="Closing Price" icon={DollarSign} value={tradeInputs.closingPrice} onChange={v => setTradeInputs(p => ({...p, closingPrice: v}))} />
        <InputField label="Leverage" icon={BarChart3} value={tradeInputs.leverage} onChange={v => setTradeInputs(p => ({...p, leverage: v}))} suffix="x" />
        
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">VIP Level</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
              <UserCheck size={18} />
            </div>
            <select 
              value={tradeInputs.vipLevel} 
              onChange={e => setTradeInputs(p => ({...p, vipLevel: e.target.value}))} 
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#B9F641] focus:ring-4 focus:ring-[#B9F641]/20 outline-none transition-all duration-200 text-gray-800 font-medium shadow-sm appearance-none cursor-pointer"
            >
              {vipLevels.map(v => (
                <option key={v.level} value={v.level}>{v.level}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-white border-r border-gray-100 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center gap-3 mb-10 mt-2 px-2">
          <div className="bg-[#B9F641] p-2.5 rounded-xl shadow-sm shadow-[#B9F641]/20">
            <Calculator size={24} className="text-gray-900" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 block leading-none">FuturesCalc</span>
            <span className="text-xs text-gray-500 font-medium">CS Agent Tool</span>
          </div>
        </div>
        <nav className="space-y-1.5">
          {[
            { id: 'fees', label: 'Trading Fees', icon: Percent },
            { id: 'liquidation', label: 'Liquidation Price', icon: TrendingDown },
            { id: 'pnl', label: 'PnL Calculator', icon: ArrowRightLeft },
            { id: 'vip', label: 'VIP Tiers', icon: Layers }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-[#B9F641] text-gray-900 shadow-sm shadow-[#B9F641]/20' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600 transition-colors'} /> 
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {activeTab === 'pnl' ? 'Profit & Loss Calculator' : 
             activeTab === 'fees' ? 'Trading Fees Calculator' : 
             activeTab === 'liquidation' ? 'Liquidation Price Calculator' : 
             'VIP Fee Tiers'}
          </h1>
          <p className="text-gray-500 font-medium">
            {activeTab === 'pnl' ? 'Calculate your profit, loss, and return on investment (ROI).' : 
             activeTab === 'fees' ? 'Estimate your Maker and Taker fees based on your VIP level.' : 
             activeTab === 'liquidation' ? 'Determine your liquidation prices for long and short positions.' : 
             'Review the maker and taker fee structure across all VIP levels.'}
          </p>
        </header>

        <div className="duration-500">
          {activeTab === 'pnl' && (
            <div className="space-y-6">
              {renderSharedInputs()}
              <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] flex justify-center w-full max-w-sm mx-auto mb-6">
                <button 
                  onClick={() => setPnlType('raw')}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${pnlType === 'raw' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Raw PnL
                </button>
                <button 
                  onClick={() => setPnlType('net')}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${pnlType === 'net' ? 'bg-[#B9F641] text-green-900 shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Net PnL (After Fees)
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#B9F641] rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Estimated PnL {pnlType === 'net' ? '(Net)' : '(Raw)'}</p>
                    <div className={`p-2 rounded-lg ${(pnlType === 'net' ? feeCalcs.netPnl : feeCalcs.pnl) >= 0 ? 'bg-[#B9F641]/20 text-[#B9F641]' : 'bg-red-500/20 text-red-400'}`}>
                      {(pnlType === 'net' ? feeCalcs.netPnl : feeCalcs.pnl) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                  </div>
                  <p className={`text-5xl font-black tracking-tight mb-2 relative z-10 ${(pnlType === 'net' ? feeCalcs.netPnl : feeCalcs.pnl) >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {(pnlType === 'net' ? feeCalcs.netPnl : feeCalcs.pnl) >= 0 ? '+' : ''}${(pnlType === 'net' ? feeCalcs.netPnl : feeCalcs.pnl).toFixed(2)}
                  </p>
                  <p className="text-gray-400 font-medium relative z-10">{pnlType === 'net' ? 'Profit & Loss after total fees' : 'Profit & Loss before fees'}</p>
                </div>
                
                <div className="bg-[#B9F641] p-8 rounded-3xl shadow-xl relative overflow-hidden group text-gray-900 border border-[#a3da39]">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold opacity-70 uppercase tracking-widest">Return on Investment (ROI)</p>
                    <div className="p-2 rounded-lg bg-white/30 text-gray-900">
                      <Percent size={20} />
                    </div>
                  </div>
                  <p className="text-5xl font-black tracking-tight mb-2 relative z-10">
                    {(pnlType === 'net' ? feeCalcs.netRoi : feeCalcs.roi) > 0 ? '+' : ''}{(pnlType === 'net' ? feeCalcs.netRoi : feeCalcs.roi).toFixed(2)}%
                  </p>
                  <p className="font-medium opacity-80 relative z-10">Based on initial margin {pnlType === 'net' ? '& net PnL' : '& raw PnL'}</p>
                </div>
              </div>
              <ResultDetails 
                steps={pnlType === 'raw' ? pnlStepsRaw : pnlStepsNet} 
                scripts={pnlType === 'raw' ? pnlScriptsRaw : pnlScriptsNet} 
              />
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-6">
              {renderSharedInputs()}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-50">
                  <Calculator size={20} className="text-[#B9F641]" />
                  <h2 className="text-xl font-bold text-gray-900">Estimated Fee Breakdown</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Opening Fees</h3>
                      <select 
                        value={tradeInputs.openFeeType} 
                        onChange={e => setTradeInputs(p => ({...p, openFeeType: e.target.value}))}
                        className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#B9F641] cursor-pointer"
                      >
                        <option value="taker">Taker</option>
                        <option value="maker">Maker</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div className={`flex justify-between items-center bg-white p-4 rounded-xl border transition-colors ${tradeInputs.openFeeType === 'maker' ? 'border-[#B9F641] ring-1 ring-[#B9F641] shadow-sm' : 'border-gray-100'}`}>
                        <span className="text-gray-600 font-medium">Maker Fee</span>
                        <span className="font-bold text-gray-900">${feeCalcs.openMaker.toFixed(4)}</span>
                      </div>
                      <div className={`flex justify-between items-center bg-white p-4 rounded-xl border transition-colors ${tradeInputs.openFeeType === 'taker' ? 'border-[#B9F641] ring-1 ring-[#B9F641] shadow-sm' : 'border-gray-100'}`}>
                        <span className="text-gray-600 font-medium">Taker Fee</span>
                        <span className="font-bold text-gray-900">${feeCalcs.openTaker.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Closing Fees</h3>
                      <select 
                        value={tradeInputs.closeFeeType} 
                        onChange={e => setTradeInputs(p => ({...p, closeFeeType: e.target.value}))}
                        className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#B9F641] cursor-pointer"
                      >
                        <option value="taker">Taker</option>
                        <option value="maker">Maker</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div className={`flex justify-between items-center bg-white p-4 rounded-xl border transition-colors ${tradeInputs.closeFeeType === 'maker' ? 'border-[#B9F641] ring-1 ring-[#B9F641] shadow-sm' : 'border-gray-100'}`}>
                        <span className="text-gray-600 font-medium">Maker Fee</span>
                        <span className="font-bold text-gray-900">${feeCalcs.closeMaker.toFixed(4)}</span>
                      </div>
                      <div className={`flex justify-between items-center bg-white p-4 rounded-xl border transition-colors ${tradeInputs.closeFeeType === 'taker' ? 'border-[#B9F641] ring-1 ring-[#B9F641] shadow-sm' : 'border-gray-100'}`}>
                        <span className="text-gray-600 font-medium">Taker Fee</span>
                        <span className="font-bold text-gray-900">${feeCalcs.closeTaker.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-[#B9F641]/10 p-6 rounded-2xl border border-[#B9F641]/30 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Total Estimated Fees</h3>
                    <p className="text-sm text-gray-600">Based on {tradeInputs.openFeeType} open and {tradeInputs.closeFeeType} close.</p>
                  </div>
                  <div className="text-3xl font-black text-gray-900">
                    ${feeCalcs.totalFees.toFixed(4)}
                  </div>
                </div>
              </div>
              <ResultDetails steps={feeSteps} scripts={feeScripts} />
            </div>
          )}

          {activeTab === 'liquidation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Long Position */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-[#B9F641]/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#B9F641]"></div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-[#B9F641]/20 p-2.5 rounded-xl text-green-700">
                    <TrendingUp size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Long Position</h2>
                </div>
                
                <div className="space-y-5 mb-8">
                  <InputField label="Avg. Open Price" icon={DollarSign} value={longInputs.entryPrice} onChange={v => setLongInputs(p => ({...p, entryPrice: v}))} />
                  <InputField label="Position Size" icon={Layers} value={longInputs.size} onChange={v => setLongInputs(p => ({...p, size: v}))} />
                  <InputField label="Available Margin" icon={DollarSign} value={longInputs.availableMargin} onChange={v => setLongInputs(p => ({...p, availableMargin: v}))} />
                  <InputField label="Maintenance Margin Rate (MMR)" icon={Percent} value={longInputs.mmr} onChange={v => setLongInputs(p => ({...p, mmr: v}))} suffix="%" />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:bg-[#B9F641]/5 transition-colors">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Liquidation Price</p>
                  <p className="text-4xl font-black text-gray-900">${liqPriceLong.toFixed(2)}</p>
                </div>
              </div>

              {/* Short Position */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-red-400/50 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-400"></div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-red-50 p-2.5 rounded-xl text-red-500">
                    <TrendingDown size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Short Position</h2>
                </div>
                
                <div className="space-y-5 mb-8">
                  <InputField label="Avg. Open Price" icon={DollarSign} value={shortInputs.entryPrice} onChange={v => setShortInputs(p => ({...p, entryPrice: v}))} />
                  <InputField label="Position Size" icon={Layers} value={shortInputs.size} onChange={v => setShortInputs(p => ({...p, size: v}))} />
                  <InputField label="Available Margin" icon={DollarSign} value={shortInputs.availableMargin} onChange={v => setShortInputs(p => ({...p, availableMargin: v}))} />
                  <InputField label="Maintenance Margin Rate (MMR)" icon={Percent} value={shortInputs.mmr} onChange={v => setShortInputs(p => ({...p, mmr: v}))} suffix="%" />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:bg-red-50 transition-colors">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Liquidation Price</p>
                  <p className="text-4xl font-black text-gray-900">${liqPriceShort.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <ResultDetails steps={liqSteps} scripts={liqScripts} />
          </div>
          )}

          {activeTab === 'vip' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2.5 rounded-xl text-gray-700">
                    <Layers size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Fee Structure Table</h2>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  Current Selection: <span className="font-bold text-gray-900">{tradeInputs.vipLevel}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">VIP Level</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Maker Fee</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Taker Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vipLevels.map((v, i) => (
                      <tr 
                        key={v.level} 
                        className={`transition-colors duration-150 ${tradeInputs.vipLevel === v.level ? 'bg-[#B9F641]/10' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          setTradeInputs(p => ({...p, vipLevel: v.level}));
                        }}
                        style={{cursor: 'pointer'}}
                      >
                        <td className="py-5 px-8 font-bold text-gray-900 flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${tradeInputs.vipLevel === v.level ? 'bg-[#B9F641] shadow-[0_0_8px_rgba(185,246,65,0.8)]' : 'bg-transparent'}`}></div>
                          {v.level}
                        </td>
                        <td className={`py-5 px-8 font-medium ${tradeInputs.vipLevel === v.level ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                          {(v.maker * 100).toFixed(3)}%
                        </td>
                        <td className={`py-5 px-8 font-medium ${tradeInputs.vipLevel === v.level ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                          {(v.taker * 100).toFixed(3)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
