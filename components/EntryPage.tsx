import React, { useState } from 'react';
import { UserData } from '../types';
import { IMAGES, MAJOR_REWARDS, FLOATING_VOUCHERS, RM2888_VOUCHER } from '../constants';

interface EntryPageProps {
  onStart: (data: UserData) => void;
}

const EntryPage: React.FC<EntryPageProps> = ({ onStart }) => {
  const [formData, setFormData] = useState<UserData>({
    companyName: '',
    email: '',
    phone: '',
    countryCode: '🇲🇾 (+60)',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.companyName && formData.email && formData.phone) {
      onStart(formData);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 md:px-8 lg:px-16 overflow-hidden">
      
      {/* Scattered Floating Vouchers - Visible Layer */}
      {/* Resized to be slightly smaller (w-20 to w-36 range) to be less obtrusive */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
         {voucherPositions.map((pos, i) => (
             <img 
                key={i}
                src={getVoucherImg(i)}
                alt=""
                className="absolute w-20 md:w-28 lg:w-36 drop-shadow-xl float-animation opacity-80"
                style={{
                    top: pos.top,
                    left: pos.left,
                    animationDelay: pos.delay,
                    transform: `rotate(${pos.rotate})`,
                }}
             />
         ))}
      </div>

      {/* Central Connectivity Layer */}
      <div className="absolute inset-0 central-glow pointer-events-none z-[-1]"></div>
      
      {/* Main Container - Left Title, Right Form */}
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 z-10 relative">
        
        {/* Left Column: Huge Title & Copy & Major Rewards */}
        <div className="w-full lg:w-3/5 flex flex-col items-center text-center animate-slide-up space-y-1 md:space-y-2 relative">
          <img 
            src={IMAGES.campaignHeader} 
            alt="A HUAT THING" 
            className="w-full max-w-[280px] md:max-w-[380px] lg:max-w-[480px] h-auto drop-shadow-2xl filter brightness-110"
          />
          
          <div className="max-w-2xl w-full flex flex-col items-center space-y-2">
            {/* Copy */}
            <div className="relative p-1 mx-auto">
                <div className="absolute inset-0 blur-xl bg-black/20 rounded-full opacity-40 transform scale-x-125"></div>
                {/* UPDATED TITLE HERE */}
                <h2 className="relative text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-nowrap md:whitespace-normal">
                    Throw Tangerine <br/>
                    <span className="text-2xl md:text-4xl lg:text-5xl text-white opacity-95 block mt-2 font-bold tracking-tight text-shadow-md">
                        & Win Huat Rewards
                    </span>
                </h2>
            </div>
            
            {/* Major Rewards Display - BIGGER and Visible */}
            <div className="w-full pt-4 flex justify-center overflow-visible pb-8">
               <div className="flex flex-row justify-center items-end -space-x-4 md:-space-x-8">
                  {MAJOR_REWARDS.map((reward, idx) => (
                    <div key={idx} className="relative group transition-all duration-300 hover:-translate-y-4 hover:z-50 hover:scale-105 z-10">
                        {/* Increased dimensions significantly */}
                        <div className="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 drop-shadow-[0_20px_20px_rgba(0,0,0,0.7)] filter brightness-110">
                            <img src={reward.img} alt={reward.label} className="w-full h-full object-contain" />
                        </div>
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Big Form with Voucher Above */}
        <div className="w-full lg:w-2/5 flex flex-col items-center justify-center lg:justify-end animate-scale-bounce mt-4 lg:mt-0 relative">
          
          {/* RM2888 Giant Voucher - Massive Size Update */}
          <div className="relative z-40 mb-[-40px] w-48 md:w-64 lg:w-80 transition-transform hover:scale-105 duration-300">
             <img 
                src={RM2888_VOUCHER} 
                alt="RM2888 Voucher" 
                className="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] float-animation" 
             />
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-[520px] bg-white p-6 md:p-10 rounded-[2.5rem] border-[8px] border-yellow-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 solid-shadow relative pt-12 z-30">
            
            <div className="absolute -top-10 -right-10 text-8xl rotate-12 animate-pulse filter drop-shadow-2xl hidden md:block">
              🍊
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm md:text-base font-black uppercase tracking-widest text-red-700">Company Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Acme Corp" 
                className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-lg md:text-xl"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm md:text-base font-black uppercase tracking-widest text-red-700">Work Email</label>
              <input 
                required
                type="email" 
                placeholder="name@company.com" 
                className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-lg md:text-xl"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="flex gap-3 text-left">
              <div className="flex-none w-28 md:w-36 space-y-2">
                <label className="text-sm md:text-base font-black uppercase tracking-widest text-red-700">Region</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-2 py-4 text-gray-900 focus:outline-none focus:border-red-500 transition-all appearance-none font-bold text-center text-base md:text-lg"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                  >
                    {asianCountries.map((c) => (
                      <option key={c.code} value={`${c.emoji} (${c.code})`}>
                        {c.emoji} ({c.code})
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm md:text-base font-black uppercase tracking-widest text-red-700">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  placeholder="123456789" 
                  className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-lg md:text-xl"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-600 text-white font-black text-3xl md:text-4xl py-5 rounded-2xl shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.1em] mt-4 pulse-gold border-b-4 border-red-900"
            >
               THROW NOW <span className="animate-bounce">🍊</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
