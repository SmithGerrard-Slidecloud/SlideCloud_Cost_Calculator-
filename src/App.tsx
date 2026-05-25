import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Server, 
  Network, 
  Users, 
  Microscope, 
  Settings, 
  ShieldCheck, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Database,
  ArrowRight,
  Cpu,
  ChevronDown,
  Printer,
  Pencil
} from 'lucide-react';
import { ScannerCalculator } from './components/ScannerCalculator';

const SlideCloudPricing = ({ isDuplicate = false, isPerSlidePricing = false, isSlidesPlusData = false, isCustomPrint = false }: { isDuplicate?: boolean, isPerSlidePricing?: boolean, isSlidesPlusData?: boolean, isCustomPrint?: boolean }) => {
  const useSlidePricing = isPerSlidePricing || isSlidesPlusData;
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const state = location.state || {}; // For custom print

  // State for the interactive sliders
  const [slideCount, setSlideCount] = useState(state.slideCount || 1000);
  const [pathologistCount, setPathologistCount] = useState(state.pathologistCount !== undefined ? state.pathologistCount : 1);
  const [adminCount, setAdminCount] = useState(state.adminCount !== undefined ? state.adminCount : 0);
  const [scannerCount, setScannerCount] = useState(state.scannerCount !== undefined ? state.scannerCount : 0);
  const [cloudMixPercentage, setCloudMixPercentage] = useState(state.cloudMixPercentage || 50);
  const [storageDays, setStorageDays] = useState(state.storageDays || 28);
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>(state.billingCycle || 'yearly');
  const [selectedStorageOption, setSelectedStorageOption] = useState<'option1' | 'option2' | 'option3'>(
    isCustomPrint ? 'option2' : (state.selectedStorageOption || 'option2')
  );
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);

  // Dynamic Volume Pricing Logic (Linear Interpolation)
  const pathologistSurcharge = billingCycle === 'monthly' ? 90 : 0;
  const adminSurcharge = billingCycle === 'monthly' ? 80 : 0;
  const scannerSurcharge = billingCycle === 'monthly' ? 1000 : 0;

  const currentPathologistPrice = Math.round(899 - ((899 - 799) / 99) * (Math.max(1, pathologistCount) - 1)) + pathologistSurcharge;
  const currentAdminPrice = Math.round(299 - ((299 - 199) / 49) * (Math.max(1, adminCount) - 1)) + adminSurcharge;
  const currentScannerPrice = Math.round(2999 - ((2999 - 999) / 29) * (Math.max(1, scannerCount) - 1)) + scannerSurcharge;
  
  const currentSlidePrice = 0.55 - ((0.55 - 0.45) / 249000) * (slideCount - 1000);

  const effectivePathologistCount = useSlidePricing ? Math.max(1, Math.round(slideCount / 2560)) : pathologistCount;
  const effectiveTB = useSlidePricing ? (slideCount * 560 / 1000000) : (pathologistCount * 1.55);

  // Pricing calculation logic (Derived to precisely match the original anchor points)
  // Base local cost calculated dynamically from all base units
  const baseServiceTotal = useSlidePricing 
    ? slideCount * currentSlidePrice
    : (pathologistCount * currentPathologistPrice) + (adminCount * currentAdminPrice) + (scannerCount * currentScannerPrice);
  
  // Local Storage Support Logic
  const currentLocalSupportPrice = Math.round(510 - ((510 - 450) / 99) * (effectivePathologistCount - 1));
  const localSupportTotal = effectivePathologistCount * currentLocalSupportPrice;
  
  // Data cost linear fit based on original simulation anchors (10, 30, 50)
  // Total Data Cost = (PathologistCount * R2,082.29) + R2,487.90 fixed base infrastructure
  const dataCostTotal = (effectivePathologistCount * 2082.29) + 2487.90;
  
  const totalEstimatedSlides = Math.round(useSlidePricing ? slideCount : (pathologistCount * 2560));
  const recommendedScanners = Math.ceil((totalEstimatedSlides * 2) / (22 * 700));
  const recommendedAdmins = Math.ceil(pathologistCount / 2);

  // Totals
  const currentOption1PricePerPath = Math.round(2880 - ((2880 - 2350) / 99) * (effectivePathologistCount - 1));
  const option1TotalBase = currentOption1PricePerPath * effectivePathologistCount;
  
  const storageMultiplier = storageDays <= 28 
    ? 0.75 + (0.25 / 27) * (storageDays - 1)
    : 1.0 + (0.35 / 32) * (storageDays - 28);
    
  const option1Total = option1TotalBase * storageMultiplier;
  
  const dataCostPerUser = dataCostTotal / effectivePathologistCount;

  // Option 3 Total
  const option3Total = ((cloudMixPercentage / 100) * option1Total) + (((100 - cloudMixPercentage) / 100) * localSupportTotal);

  // Formatter for ZAR currency
  const formatZAR = (num) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const dataCostCalculatorNode = (
    <section id="data-cost-calculator" className={`relative ${isDuplicate ? 'mt-8 mb-8' : 'mb-20'}`}>
      <div className="absolute -inset-4 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-3xl"></div>
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end print:flex-row print:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-bold text-slate-900">{isCustomPrint ? "Data price alternatives." : "Estimate Your Monthly Variable Data Cost"}</h3>
          {!isCustomPrint && <p className="text-slate-500 mt-2">Adjust your deployment size to instantly estimate total monthly costs, including estimated data usage at own cost.</p>}
        </div>
        <div className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          Dynamic Pricing Model
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Slider Widget */}
        {!isCustomPrint && (
          <div className="p-8 md:p-10 bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
              <div>
                <label htmlFor="user-slider" className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                  {useSlidePricing ? "Total Slides" : "Total Pathologists"}
                </label>
                <p className="text-blue-600 font-medium mt-1">
                  Estimated Data: <span className="font-bold">{(effectiveTB.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}))} TB</span>/mo
                </p>
              </div>
              <div className="text-4xl font-extrabold text-blue-600">
                {useSlidePricing ? (
                  <>{slideCount.toLocaleString()} <span className="text-xl text-slate-400 font-medium">Slides</span></>
                ) : (
                  <>{pathologistCount} <span className="text-xl text-slate-400 font-medium">Pathologists</span></>
                )}
              </div>
            </div>
            
            {useSlidePricing ? (
              <>
                <input 
                  id="user-slider"
                  type="range" 
                  min="1000" 
                  max="250000"
                  step="1000"
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs font-semibold text-slate-400 mt-3">
                  <span>1,000 Slides</span>
                  <span>250,000 Slides</span>
                </div>
              </>
            ) : (
              <>
                <input 
                  id="user-slider"
                  type="range" 
                  min="1" 
                  max="100" 
                  value={pathologistCount}
                  onChange={(e) => setPathologistCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs font-semibold text-slate-400 mt-3">
                  <span>1 Pathologist</span>
                  <span>100 Pathologists</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 divide-y lg:divide-y-0 print:divide-y-0 lg:divide-x print:divide-x divide-slate-200">
          
          {/* Option 1 Local */}
          <div className="p-8 hover:bg-slate-50 transition-colors">
            <div className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4"/> Option 1: Local Storage Support
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-800 mt-4 mb-2">
              {formatZAR(localSupportTotal)}
            </div>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              Total support management cost, for local/own data connection. <br/><span className="italic">Hardware & IT managed by client.</span>
            </p>
          </div>
          
          {/* Option 2 Cloud */}
          <div className="p-8 bg-blue-50/60 relative overflow-hidden group ring-2 ring-blue-400 ring-offset-[-2px] shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900 group-hover:scale-110 transition-transform duration-500">
              <Cloud className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex flex-col 2xl:flex-row print:flex-row 2xl:items-start print:items-start justify-between gap-2 mb-1">
                <div className="text-blue-800 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                  <Cloud className="w-4 h-4"/> Option 2: Dedicated Cloud
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-blue-900 mt-4 mb-2">
                {formatZAR(option1Total)}*
              </div>
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest shadow-sm inline-block w-fit whitespace-nowrap">
                RECOMMENDED
              </span>
              <p className="text-[13px] font-bold text-blue-900 mt-3 leading-snug">
                The "Rolls-Royce" option.<br/>Most seamless solution for pathologists.
              </p>
              <p className="text-sm text-blue-800/70 mt-2 leading-relaxed">
                Comprehensive, fully managed cloud turnkey solution.
              </p>
              <p className="text-xs text-blue-800/80 mt-3 leading-relaxed font-medium">
                Choose this option when using nation (organization) wide case distribution with best cost routing, and/or if pathologist will spend more than 50% of their time diagnosing offsite (including other branches).
              </p>
              
              <div className="mt-6 border-t border-blue-200/50 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Image Storage Term</span>
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-200/60 px-1.5 py-0.5 rounded">{storageDays} {storageDays === 1 ? 'Day' : 'Days'}</span>
                </div>
                <input 
                  type="range" min="5" max="55" 
                  value={storageDays} 
                  onChange={(e) => setStorageDays(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
                />
                <div className="flex justify-between text-[9px] font-bold text-blue-700/60 uppercase">
                  <span>5 Days</span>
                  <span>55 Days</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Option 3 Hybrid */}
          <div className="p-8 bg-purple-50/40 relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-900 group-hover:scale-110 transition-transform duration-500">
              <Network className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex-grow">
              <div className="text-purple-800 font-bold mb-1 uppercase text-xs tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4"/> Option 3: Hybrid
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-purple-900 mt-4 mb-2">
                {formatZAR(option3Total)}*
              </div>
              <p className="text-sm text-purple-800/70 mt-4 leading-relaxed">
                Custom blend of local and cloud storage. Dynamically balances cost and capacity.
              </p>
            </div>
            
            <div className="relative z-10 mt-8 pt-5 border-t border-purple-200/60">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-purple-800 uppercase tracking-wide">Cloud Mix</span>
                <span className="text-xs font-bold text-purple-900 bg-purple-200/60 px-2 py-1 rounded">{cloudMixPercentage}% Cloud</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={cloudMixPercentage} 
                onChange={(e) => setCloudMixPercentage(parseInt(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-3"
              />
              <div className="flex justify-between text-[10px] font-semibold text-purple-700/60 uppercase">
                <span>100% Local</span>
                <span>100% Cloud</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      
      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 print:py-6">
        {/* HEADER SECTION */}
        <header className="bg-[#111827] text-white rounded-[2rem] p-8 md:p-12 lg:p-16 print:p-6 print:px-10 relative overflow-hidden shadow-2xl mb-12 print:mb-6">
          <div className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-end pr-12 opacity-[0.05] pointer-events-none">
            <Network className="w-[32rem] h-[32rem] text-white" strokeWidth={5} />
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-8 print:mb-4">
              <div className="bg-[#5C85FF] p-2 rounded-xl">
                <Cloud className="w-6 h-6 text-white" fill="currentColor" strokeWidth={2} />
              </div>
              <h1 className="text-xl font-bold tracking-wide">SlideCloud</h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold mb-4 print:mb-2 leading-[1.1] tracking-tight text-white">
              Enterprise Pathology
              <br />
              <span className="text-[#8BA6FF]">Architecture & Pricing</span>
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mt-6 print:mt-4">
              Prepared exclusively for <strong className="text-white">Pathcare</strong>. A decentralized, vendor-neutral infrastructure designed for South Africa's leading multi-site laboratory network.
            </p>
          </div>
        </header>

        {/* BASE PRICING */}
        <section className="mb-20 print:mb-8">
            <div className="mb-8 print:mb-6 flex flex-col md:flex-row print:flex-row justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold text-slate-900">{isCustomPrint ? "Your Custom Price Plan" : "Build your custom Price"}</h3>
              {!isCustomPrint && <p className="text-slate-500 mt-2">Move the sliders to get an instant monthly cost estimation.</p>}
            </div>
            <div className="print:hidden flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
              <button 
                onClick={() => navigate('/')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${!isCustomPrint ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50 ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button 
                onClick={() => {
                  if (isCustomPrint) {
                    window.print();
                  } else {
                    navigate('/custom-price-print', { 
                      state: {
                        slideCount,
                        pathologistCount,
                        adminCount,
                        scannerCount,
                        cloudMixPercentage,
                        storageDays,
                        selectedStorageOption,
                        billingCycle
                      }
                    });
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${isCustomPrint ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                title={isCustomPrint ? "Print Estimate" : "Go to Print Page"}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{isCustomPrint ? "Print Page" : "Print My Price"}</span>
              </button>
            </div>
          </div>
          
          {useSlidePricing ? (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm transition-shadow w-full flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2 md:p-3 rounded-xl border border-blue-100/50 flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-xl font-bold text-slate-900">Total Slide Volume</h4>
                    <p className="text-xs md:text-sm text-slate-500">Adjust for pricing</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6 bg-slate-50 border border-slate-200 px-4 md:px-6 py-2 md:py-3 rounded-xl self-end sm:self-auto flex-shrink-0">
                  <div className="text-right border-r border-slate-200 pr-4 md:pr-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Total Selected</span>
                    <div>
                      <span className="text-xl md:text-3xl font-bold text-slate-700">{slideCount.toLocaleString()}</span>
                      <span className="text-xs md:text-sm font-bold text-slate-400 ml-1.5 md:ml-2">slides</span>
                    </div>
                  </div>
                  <div className="text-left pl-1 md:pl-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Unit Price</span>
                    <span className="text-lg md:text-2xl font-extrabold text-blue-600 leading-none">{formatZAR(currentSlidePrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                {!isCustomPrint && (
                  <div className="w-full pt-1">
                    <input 
                      type="range" min="1000" max="250000" step="1000"
                      value={slideCount} 
                      onChange={(e) => setSlideCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] md:text-xs font-semibold text-slate-400 mt-2">
                      <span>1,000 Slides</span>
                      <span>250,000 Slides</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex flex-row items-center justify-between mb-4">
                <span className="text-7xl lg:text-8xl font-bold text-slate-300 tracking-tighter leading-none">{pathologistCount}</span>
                <Users className={`w-8 h-8 ${isCustomPrint ? 'text-slate-300/50' : 'text-blue-600'}`} />
              </div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Pathologist</p>
              {!isCustomPrint && (
                <p className="text-xs text-slate-500 mb-1 min-h-[20px]">Per primary diagnostic user.</p>
              )}
              {isCustomPrint && <div className="mt-8"></div>}
              
              <div className="mt-auto">
                {!isCustomPrint ? (
                  <>
                    <input 
                      type="range" min="1" max="100" 
                      value={pathologistCount} 
                      onChange={(e) => setPathologistCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-5"
                    />
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Total PM</span>
                        <span className="block text-2xl font-extrabold text-slate-900 leading-none flex items-baseline gap-1">{formatZAR(pathologistCount * currentPathologistPrice)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Unit Price PM</span>
                        <span className="block text-lg font-bold text-slate-800 leading-none flex items-baseline gap-1 justify-end">{formatZAR(currentPathologistPrice)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-slate-100 pt-5 mt-auto">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Unit Price PM</span>
                      <span className="text-xl font-bold text-slate-800 flex items-baseline gap-1">{formatZAR(currentPathologistPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex flex-row items-center justify-between mb-4">
                <span className="text-7xl lg:text-8xl font-bold text-slate-300 tracking-tighter leading-none">{adminCount}</span>
                <Settings className={`w-8 h-8 ${isCustomPrint ? 'text-slate-300/50' : 'text-slate-600'}`} />
              </div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin User</p>
              {!isCustomPrint && (
                <p className="text-xs text-slate-500 mb-1 min-h-[20px]">Lab & IT staff management access.</p>
              )}
              {isCustomPrint && <div className="mt-8"></div>}
              
              <div className="mt-auto">
                {!isCustomPrint ? (
                  <>
                    <input 
                      type="range" min="0" max="50" 
                      value={adminCount} 
                      onChange={(e) => setAdminCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600 mb-5"
                    />
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Total PM</span>
                        <span className="block text-2xl font-extrabold text-slate-900 leading-none flex items-baseline gap-1">{formatZAR(adminCount * currentAdminPrice)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Unit Price PM</span>
                        <span className="block text-lg font-bold text-slate-800 leading-none flex items-baseline gap-1 justify-end">{formatZAR(currentAdminPrice)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-slate-100 pt-5 mt-auto">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Unit Price PM</span>
                      <span className="text-xl font-bold text-slate-800 flex items-baseline gap-1">{formatZAR(currentAdminPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex flex-row items-center justify-between mb-4">
                <span className="text-7xl lg:text-8xl font-bold text-slate-300 tracking-tighter leading-none">{scannerCount}</span>
                <Activity className={`w-8 h-8 ${isCustomPrint ? 'text-slate-300/50' : 'text-emerald-600'}`} />
              </div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Scanner Connection</p>
              {!isCustomPrint && (
                <p className="text-xs text-slate-500 mb-1 min-h-[20px]">Per hardware integration point.</p>
              )}
              {isCustomPrint && <div className="mt-8"></div>}
              
              <div className="mt-auto">
                {!isCustomPrint ? (
                  <>
                    <input 
                      type="range" min="0" max="30" 
                      value={scannerCount} 
                      onChange={(e) => setScannerCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-5"
                    />
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Total PM</span>
                        <span className="block text-2xl font-extrabold text-slate-900 leading-none flex items-baseline gap-1">{formatZAR(scannerCount * currentScannerPrice)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">Unit Price PM</span>
                        <span className="block text-lg font-bold text-slate-800 leading-none flex items-baseline gap-1 justify-end">{formatZAR(currentScannerPrice)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-slate-100 pt-5 mt-auto">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Unit Price PM</span>
                      <span className="text-xl font-bold text-slate-800 flex items-baseline gap-1">{formatZAR(currentScannerPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* COMBINED BASE TOTAL */}
          <div className="mt-8 print:mt-4 bg-slate-900 text-white rounded-2xl p-6 md:p-8 md:pb-12 print:p-6 flex flex-col md:flex-row print:flex-row items-stretch justify-between shadow-lg border border-slate-800 relative z-10">
            <div className="flex flex-col gap-4 mb-4 md:mb-0 print:mb-0 w-full md:w-auto overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600/30 p-3 rounded-xl border border-blue-500/30 flex-shrink-0">
                  <Server className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-bold">Total SlideCloud Costs</h4>
                  <p className="text-slate-400 text-sm mt-1 max-w-xl">
                    This covers software, cloud infrastructure, cloud management, IT labour, continuous latest updates, and the basic SLA. Excludes monthly variable data cost.
                    <span className="block mt-2 text-slate-500 text-xs">
                      Estimated Metrics: Slides: {totalEstimatedSlides.toLocaleString()} | Scanners: {recommendedScanners} | Admins: {recommendedAdmins} | Data: {effectiveTB.toFixed(1)} TB/mo
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right print:text-right md:ml-6 print:ml-6 mt-4 md:mt-0 print:mt-0 flex-shrink-0 flex flex-col items-center md:items-end justify-between">
              <div className="text-3xl md:text-4xl font-extrabold text-white flex items-baseline gap-2 justify-center md:justify-end mb-3">
                {formatZAR(baseServiceTotal)} <span className="text-xl font-bold text-slate-400">/ mo</span>
              </div>
              
              {!isCustomPrint && (
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-sm">
                  <button 
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Pay Yearly
                  </button>
                  <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Pay Monthly
                  </button>
                </div>
              )}
              {isCustomPrint && (
                 <div className="text-sm font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded w-fit capitalize border border-slate-700 shadow-sm">
                    {billingCycle} Billing
                 </div>
              )}
            </div>
          </div>

          {isDuplicate && dataCostCalculatorNode}

          {/* TOTAL SOLUTION COST */}
          {(useSlidePricing ? slideCount > 5000 : pathologistCount >= 3) && (
            <div className="mt-6 bg-gradient-to-br from-blue-50/80 via-blue-50/30 to-slate-50 border border-blue-200/80 rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute -right-32 -top-32 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row print:flex-row items-center justify-between gap-8 relative z-10">
                <div className="w-full md:w-auto print:w-auto text-center md:text-left print:text-left">
                  <h4 className="text-lg md:text-xl font-extrabold text-slate-800 flex flex-wrap items-center justify-center md:justify-start print:justify-start gap-2">
                    SlideCloud 
                    {isCustomPrint ? (
                      <span className={`text-base md:text-lg font-black tracking-wide uppercase px-5 py-1.5 rounded-full border-2 shadow-sm ${
                        selectedStorageOption === 'option1' ? 'bg-slate-100 border-slate-300 text-slate-700' : 
                        selectedStorageOption === 'option2' ? 'bg-blue-100 border-blue-300 text-blue-700' : 
                        'bg-purple-100 border-purple-300 text-purple-700'
                      }`}>
                        + {selectedStorageOption === 'option1' ? 'Local' : selectedStorageOption === 'option2' ? `Cloud Storage (${storageDays} Days)` : `Hybrid Storage (${storageDays} Days, ${cloudMixPercentage}% Cloud)`}
                      </span>
                    ) : (
                      <span className="font-extrabold text-[#155dfc] flex flex-wrap gap-2">
                        + Estimated Variable Data Costs 
                        <span className="text-sm font-normal text-slate-500">
                          ({selectedStorageOption === 'option1' ? 'Local' : selectedStorageOption === 'option2' ? `Cloud (${storageDays} Days)` : `Hybrid (${storageDays} Days, ${cloudMixPercentage}% Cloud)`})
                        </span>
                      </span>
                    )}
                  </h4>
                  <p className="text-slate-500 text-sm mt-1 mb-5">
                    Data estimation only. Data is billed as a pay as you go variable cost on a monthly basis.{' '}
                    <a href="#data-cost-calculator" className="text-blue-600 hover:text-blue-700 underline font-medium transition-colors">
                      calculate
                    </a>
                  </p>
                  
                  {!isCustomPrint && (
                    <div className="flex flex-col lg:flex-row print:flex-row lg:items-center print:items-center gap-4 mt-4">
                      <div className="inline-flex bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/80 shadow-sm w-full lg:w-auto overflow-x-auto">
                        <button 
                          onClick={() => setSelectedStorageOption('option1')}
                          className={`flex-1 lg:flex-none whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${selectedStorageOption === 'option1' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60 ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
                          title="Local storage support and management cost. Local storage requires a level of management from the Slide Cloud team. This will be the bill for the management of local storage."
                        >
                          1: Local Storage
                        </button>
                        <button 
                          onClick={() => setSelectedStorageOption('option2')}
                          className={`flex-1 lg:flex-none whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${selectedStorageOption === 'option2' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-blue-700/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
                          title={`Most seamless solution for pathologists. Estimated cost for storing the data in the cloud for ${storageDays} days.`}
                        >
                          2: Cloud Storage
                        </button>
                        <button 
                          onClick={() => setSelectedStorageOption('option3')}
                          className={`flex-1 lg:flex-none whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${selectedStorageOption === 'option3' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 border border-purple-700/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'}`}
                          title="This is a custom blend of local and cloud storage data according to the preference balance that you select"
                        >
                          3: Hybrid
                        </button>
                      </div>
                      
                      {selectedStorageOption === 'option2' && (
                        <div className="flex-1 bg-blue-50/80 px-4 py-2 flex flex-col justify-center rounded-xl border border-blue-200/60 w-full lg:min-w-[150px] max-w-sm transition-all duration-300 min-h-[44px]">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide whitespace-nowrap">{storageDays} {storageDays === 1 ? 'Day' : 'Days'}</span>
                            <input 
                              type="range" min="5" max="55" 
                              value={storageDays} 
                              onChange={(e) => setStorageDays(parseInt(e.target.value))}
                              className="flex-1 h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedStorageOption === 'option3' && (
                        <div className="flex-1 bg-purple-50/80 px-4 py-2 flex flex-col justify-center rounded-xl border border-purple-200/60 w-full lg:min-w-[150px] max-w-sm transition-all duration-300 min-h-[44px]">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wide whitespace-nowrap">{cloudMixPercentage}% Cloud</span>
                            <input 
                              type="range" min="0" max="100" 
                              value={cloudMixPercentage} 
                              onChange={(e) => setCloudMixPercentage(parseInt(e.target.value))}
                              className="flex-1 h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={`w-full md:w-auto print:w-auto text-center md:text-right print:text-right flex-shrink-0 bg-white/90 backdrop-blur-md p-6 border-2 rounded-2xl shadow-lg min-w-[320px] transition-all duration-300 ${
                  selectedStorageOption === 'option1' ? 'border-slate-300 shadow-slate-200/50' : 
                  selectedStorageOption === 'option2' ? 'border-blue-400 shadow-blue-300/50' : 
                  'border-purple-400 shadow-purple-300/50'
                }`}>
                  <div className="text-blue-900/50 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Estimated Monthly Total ({(effectiveTB.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}))} TB)
                  </div>
                  <div className="text-4xl font-black text-blue-950 tracking-tight">
                    {formatZAR(baseServiceTotal + (
                      selectedStorageOption === 'option1' ? localSupportTotal : 
                      selectedStorageOption === 'option2' ? option1Total : 
                      option3Total
                    ))}
                  </div>
                  <div className="text-sm font-medium mt-2 flex items-center justify-center md:justify-end gap-1.5">
                    <span className="text-slate-400">Base +</span>
                    <span className="text-slate-500">
                      {selectedStorageOption === 'option1' ? `Local (${formatZAR(localSupportTotal)})` : 
                       selectedStorageOption === 'option2' ? `Cloud (${formatZAR(option1Total)})` : 
                       `Hybrid (${formatZAR(option3Total)})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h4 className="text-lg font-bold text-slate-800">Inside every SlideCloud subscription:</h4>
            </div>
            <div className="flex flex-col divide-y divide-slate-100">
              
              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Software always updated</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Never spend on upgrading again</span>
                </div>
                <div className="flex flex-col sm:text-right print:text-right">
                  <span className="font-semibold text-slate-900 text-sm">YES Unlimited</span>
                  <span className="text-xs text-slate-500 font-normal mt-0.5">(always latest version)</span>
                </div>
              </div>
              
              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">Servers Included (Azure)</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">YES</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">Cloud Architecture Management</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">Included</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">IT Labor</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">Included</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">Custom Development Work</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">Paid per hour</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">Out of Scope Customizations</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">Paid per hour</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-400"/> SLA Included
                </span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">24/7 Systems Critical Infrastructure Management</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">Custom/Premium SLA's</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">To be quoted</span>
              </div>

              <div className="p-4 md:px-6 flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                <span className="text-slate-600 font-medium">Scanner Internet Connectivity (100mbps)</span>
                <span className="font-semibold text-slate-900 text-sm self-start sm:self-auto print:self-auto sm:text-right print:text-right">Responsibility of Client</span>
              </div>

            </div>
          </div>
        </section>

        {/* TRANSPARENT DATA POLICY CARD - PRINT VERSION (FIRST PAGE) */}
        <section className="mt-4 mb-2 hidden print:block">
          <div className="bg-[#111827] text-white rounded-2xl p-5 shadow-lg flex flex-row items-start justify-between gap-6 h-full">
            <div className="flex items-start gap-4 max-w-4xl">
              <div className="mt-0.5 flex-shrink-0">
                <Info className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Terms</h4>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Final pricing will be confirmed in a formal quote based on your selected volumes, service levels, and any custom requirements. Any custom development, special SLAs, integrations, or non-standard deployment needs will be scoped and quoted separately.
                </p>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">
                  * Note: AI Tools pricing is currently TBC and excluded from totals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DEPLOYMENT OPTIONS DETAILS */}
        <section className="mb-20 print:mb-8 print:break-before-page print-page-break">
          <div className="mb-8 print:mb-6">
            <h3 className="text-3xl font-bold text-slate-900">Understanding Storage Options</h3>
            <p className="text-slate-500 mt-2">Division of responsibility is critical for long-term planning.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-8 print:gap-6">
            {/* Dedicated */}
            <div className="bg-blue-900 text-white rounded-3xl p-8 print:p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 text-blue-800 opacity-50">
                <Cloud className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <span className="bg-blue-800 text-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Option 2</span>
                <h4 className="text-3xl font-bold mt-4 mb-2">Dedicated Cloud Storage</h4>
                <p className="text-blue-200 mb-6 font-medium">Fully Managed Cloud</p>
                
                <p className="text-blue-100 mb-8 leading-relaxed">
                  A comprehensive, turnkey solution with zero initial capital (CAPEX) outlay. Here we manage and host the entire infrastructure. Pricing includes user licenses, cloud infrastructure, cloud management,  and hosted pay as you go storage, with guaranteed performance.
                </p>

                <div className="space-y-4 mb-8 print:mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 print:w-5 print:h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-sm print:text-xs text-blue-50"><strong className="text-white">Best for:</strong> Sites wanting immediate, scalable access without upfront capital expenditure on local hardware.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 print:w-5 print:h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-sm print:text-xs text-blue-50"><strong className="text-white">Requirement:</strong> Choose this option when using nation (organization) wide case distribution with best cost routing, and/or if pathologist will spend more than 50% of their time diagnosing offsite (including other branches).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Local */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 print:p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-10 -mr-10 text-slate-100 opacity-50">
                <Server className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Option 1</span>
                <h4 className="text-3xl font-bold text-slate-900 mt-4 mb-2">Local Storage Support</h4>
                <p className="text-slate-500 mb-6 font-medium">On-Premise / Hybrid</p>
                
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Host data locally. Lower monthly SlideCloud data fee (reflecting licenses + connection support), but you will need to spend significant additional cost to upgrade and maintaining your internal physical infrastructure.
                </p>

                <div className="space-y-4 mb-8 print:mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 print:w-5 print:h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm print:text-xs text-slate-600"><strong className="text-slate-900">Constraints:</strong> Processing speeds and performance are strictly constrained by your local hardware limitations and VPN/network bandwidth.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 print:w-5 print:h-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm print:text-xs text-slate-600"><strong className="text-slate-900">Best for:</strong> Sites that already possess massive, underutilized legacy infrastructure and highly capable local IT teams.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!isDuplicate && dataCostCalculatorNode}

        {/* THE SLIDECLOUD ADVANTAGE */}
        <section className="mb-20 print:mb-6">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 print:p-6 print:px-8">
            <div className="text-center">
              <h4 className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
                The Slidecloud Advantage
              </h4>
              <h3 className="text-3xl font-extrabold text-slate-900 mb-4">
                Built to Scale Without Bottlenecks
              </h3>
              <p className="text-slate-500 max-w-3xl mx-auto mb-6">
                Unlike monolithic legacy systems (Leica, Philips) that force expensive centralized hardware, SlideCloud empowers decentralized operations, which includes always updated software, and reduce your IT and cloud management labor cost.
              </p>
            </div>

            <div className="mt-12 print:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-8 md:gap-0 print:gap-0 divide-y md:divide-y-0 print:divide-y-0 md:divide-x print:divide-x divide-slate-100 text-left">
                {/* Block 1 */}
                <div className="py-6 print:py-0 md:py-0 md:px-8 first:pt-0 md:first:pl-0">
                  <div className="bg-emerald-50 border border-emerald-100/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 print:mb-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3 print:mb-2 text-balance">100% Vendor Neutral</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    No hardware lock-in. Connect any scanner (3DHistech, Hamamatsu, Leica) across your branches into one unified workspace.
                  </p>
                </div>

                {/* Block 2 */}
                <div className="py-6 print:py-0 md:py-0 md:px-8">
                  <div className="bg-blue-50 border border-blue-100/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 print:mb-3">
                    <Network className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3 print:mb-2 text-balance">Adaptive Cloud Architecture</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You get the flexibility to choose the architecture that fits your organization today — with a cloud-first platform designed to carry you into the future.
                  </p>
                </div>

                {/* Block 3 */}
                <div className="py-6 print:py-0 md:py-0 md:px-8 last:pb-0 md:last:pr-0">
                  <div className="bg-purple-50 border border-purple-100/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 print:mb-3">
                    <Cpu className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3 print:mb-2 text-balance">AI-Ready Pipeline</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    A structured data foundation allowing instant integration of multi-vendor AI diagnostic tools directly into your workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARENT DATA POLICY CARD - MOVED FROM ABOVE */}
        <section className="mt-20 print:hidden">
          <div className="bg-[#111827] text-white rounded-[2rem] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row print:flex-row items-center md:items-start print:items-start justify-between gap-8 h-full">
            <div className="flex items-start gap-4 md:gap-5 max-w-4xl">
              <div className="mt-0.5 flex-shrink-0">
                <Info className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Terms</h4>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  Final pricing will be confirmed in a formal quote based on your selected volumes, service levels, and any custom requirements. Any custom development, special SLAs, integrations, or non-standard deployment needs will be scoped and quoted separately.
                </p>
                <p className="text-slate-500 text-xs md:text-sm mt-4 font-medium">
                  * Note: AI Tools pricing is currently TBC and excluded from totals.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <footer className="text-slate-400 py-8 text-center text-sm mt-4">
        <p>© 2026 SlideCloud. Confidential Pricing Proposal.</p>
        <div className="mt-4 print:hidden relative flex justify-center gap-4">
          <Link to="/scanner-calculator" className="text-blue-500 hover:underline font-medium">Scanner Calculator</Link>
          <div className="border-l border-slate-600 h-4"></div>
          <button 
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className="text-blue-500 hover:underline flex items-center gap-2 font-medium"
          >
            Admin Login <ChevronDown className="w-4 h-4" />
          </button>
          
          {isAdminOpen && (
            <div className="absolute bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-64 z-50 text-left">
              {!isAdminAuthorized ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="border border-slate-300 rounded px-2 py-1 text-sm"
                  />
                  <button 
                    onClick={() => {
                      if (adminPassword === 'SlideCloud1') {
                        setIsAdminAuthorized(true);
                      } else {
                        alert('Incorrect password');
                      }
                    }}
                    className="bg-blue-600 text-white rounded py-1 text-sm font-bold"
                  >
                    Unlock
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-sm">
                  <Link to="/" className="text-blue-500 hover:underline">Base Calculator</Link>
                  <Link to="/base-alt-design" className="text-blue-500 hover:underline">Base Alt Design</Link>
                  <Link to="/duplicate" className="text-blue-500 hover:underline">Duplicate Page</Link>
                  <Link to="/per-slide-pricing" className="text-blue-500 hover:underline">Per Slide Pricing</Link>
                  <Link to="/slides-plus-data" className="text-blue-500 hover:underline">Slides plus Data</Link>
                  <Link to="/custom-price-print" className="text-blue-500 hover:underline">Custom Price Print</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SlideCloudPricing />} />
        <Route path="/base-alt-design" element={<SlideCloudPricing />} />
        <Route path="/duplicate" element={<SlideCloudPricing isDuplicate={true} />} />
        <Route path="/per-slide-pricing" element={<SlideCloudPricing isPerSlidePricing={true} />} />
        <Route path="/slides-plus-data" element={<SlideCloudPricing isSlidesPlusData={true} />} />
        <Route path="/custom-price-print" element={<SlideCloudPricing isCustomPrint={true} />} />
        <Route path="/scanner-calculator" element={<ScannerCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}
