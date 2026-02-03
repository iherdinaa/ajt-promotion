
import React, { useState } from 'react';
import { UserData } from '../types';
import { IMAGES, MAJOR_REWARDS, FLOATING_VOUCHERS, RM2888_VOUCHER } from '../constants';

interface EntryPageProps {
  onStart: (data: UserData) => Promise<void>;
}

const EntryPage: React.FC<EntryPageProps> = ({ onStart }) => {
  const [formData, setFormData] = useState<UserData>({
    companyName: '',
    email: '',
    phone: '',
    countryCode: '🇲🇾 (+60)',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.companyName && formData.email && formData.phone && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onStart(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, phone: numericValue });
  };

  const asianCountries = [
    { name: 'Malaysia', code: '+60', emoji: '🇲🇾' },
    { name: 'Singapore', code: '+65', emoji: '🇸🇬' },
    { name: 'Indonesia', code: '+62', emoji: '🇮🇩' },
    { name: 'Thailand', code: '+66', emoji: '🇹🇭' },
    { name: 'Vietnam', code: '+84', emoji: '🇻🇳' },
    { name: 'Philippines', code: '+63', emoji: '🇵🇭' },
  ];

  // Positions for floating vouchers: 
  // Strategically placed in "safe zones"
  const voucherPositions = [
    { top: '3%', left: '2%', delay: '0s', rotate: '15deg' },   // Far Top Left corner
    { top: '2%', left: '92%', delay: '1s', rotate: '-12deg' }, // Far Top Right corner
    { top: '15%', left: '48%', delay: '2s', rotate: '8deg' },  // Center Gap (between Title and Form)
    { top: '12%', left: '8%', delay: '1.5s', rotate: '-15deg' }, // Upper Left side
    { top: '25%', left: '95%', delay: '2.5s', rotate: '12deg' }  // Middle Right side
  ];

  // Helper to get image cyclic
  const getVoucherImg = (i: number) => FLOATING_VOUCHERS[i % FLOATING_VOUCHERS.length];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center px-3 sm:px-4 md:px-6 lg:px-12 xl:px-16 overflow-y-auto overflow-x-hidden py-2 sm:py-4">
      

      
      {/* Main Container - Left Title, Right Form */}
      <div className="w-full max-w-[1200px] xl:max-w-[1400px] flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 lg:gap-8 xl:gap-12 z-10 relative">
        
        {/* Left Column: Huge Title & Copy & Major Rewards */}
        <div className="w-full lg:w-3/5 flex flex-col items-center text-center animate-slide-up space-y-1 relative">
          <img 
            src={IMAGES.campaignHeader} 
            alt="A HUAT THING" 
            className="w-full max-w-[180px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[380px] h-auto drop-shadow-2xl filter brightness-110"
            loading="eager"
          />
          
          <div className="max-w-2xl w-full flex flex-col items-center space-y-2">
            {/* Copy */}
            <div className="relative p-1 mx-auto">
                <div className="absolute inset-0 blur-xl bg-black/20 rounded-full opacity-40 transform scale-x-125"></div>
                <h2 className="relative text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    Tap Your Ong <br/>
                    <span className="text-base sm:text-xl md:text-3xl lg:text-4xl text-white opacity-95 block mt-1 sm:mt-2 font-bold tracking-tight text-shadow-md">
                        & Win Huat Rewards
                    </span>
                </h2>
            </div>
            
            {/* Major Rewards Display - BIGGER and Visible */}
            <div className="w-full pt-2 sm:pt-4 flex justify-center overflow-visible pb-2 sm:pb-4 lg:pb-8">
               <div className="flex flex-row justify-center items-center gap-2 sm:gap-3">
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">🎁</div>
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">💰</div>
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">🧧</div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Big Form with Voucher Above */}
        <div className="w-full lg:w-2/5 flex flex-col items-center justify-center lg:justify-end animate-scale-bounce mt-2 sm:mt-4 lg:mt-0 relative">
          
          {/* RM2888 Giant Voucher - Optimized Size */}
          <div className="relative z-40 mb-[-20px] sm:mb-[-30px] md:mb-[-40px] w-28 sm:w-40 md:w-52 lg:w-64 transition-transform hover:scale-105 duration-200">
             <img 
                src={RM2888_VOUCHER} 
                alt="RM2888 Voucher" 
                className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] float-animation" 
                loading="eager"
             />
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-[480px] lg:max-w-[520px] bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-[4px] sm:border-[5px] md:border-[6px] lg:border-[8px] border-yellow-500 shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-3 sm:space-y-4 md:space-y-5 solid-shadow relative pt-8 sm:pt-10 md:pt-12 z-30">
            
            <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 md:-top-10 md:-right-10 text-4xl sm:text-6xl md:text-7xl rotate-12 animate-pulse filter drop-shadow-2xl hidden sm:block">
              🧧
            </div>

            <div className="space-y-1 sm:space-y-2 text-left">
              <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-700">Company Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Acme Corp" 
                className="w-full bg-gray-50 border-[2px] sm:border-[3px] border-gray-100 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-sm sm:text-base md:text-lg"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-1 sm:space-y-2 text-left">
              <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-700">Work Email</label>
              <input 
                required
                type="email" 
                placeholder="name@company.com" 
                className="w-full bg-gray-50 border-[2px] sm:border-[3px] border-gray-100 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-sm sm:text-base md:text-lg"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="flex gap-2 sm:gap-3 text-left">
              <div className="flex-none w-24 sm:w-28 md:w-32 space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-700">Region</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border-[2px] sm:border-[3px] border-gray-100 rounded-lg sm:rounded-xl px-1 sm:px-2 py-2.5 sm:py-3 md:py-4 text-gray-900 focus:outline-none focus:border-red-500 transition-all appearance-none font-bold text-center text-xs sm:text-sm md:text-base"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                  >
                    {asianCountries.map((c) => (
                      <option key={c.code} value={`${c.emoji} (${c.code})`}>
                        {c.emoji} ({c.code})
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px] sm:text-xs"></i>
                </div>
              </div>
              <div className="flex-1 space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-700">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  placeholder="123456789" 
                  className="w-full bg-gray-50 border-[2px] sm:border-[3px] border-gray-100 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-sm sm:text-base md:text-lg"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-600 text-white font-black text-lg sm:text-xl md:text-2xl lg:text-3xl py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-wide sm:tracking-[0.1em] mt-2 sm:mt-4 pulse-gold border-b-2 sm:border-b-4 border-red-900 disabled:opacity-70 disabled:cursor-not-allowed"
            >
               {isSubmitting ? (
                 <>SUBMITTING... <i className="fa-solid fa-spinner fa-spin text-sm sm:text-base md:text-lg"></i></>
               ) : (
                 <>OPEN ANGPAU <i className="fa-solid fa-envelope-open-text animate-bounce text-sm sm:text-base md:text-lg"></i></>
               )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
