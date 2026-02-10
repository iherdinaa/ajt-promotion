import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { IMAGES, MAJOR_REWARDS, FLOATING_VOUCHERS, RM2888_VOUCHER } from '../constants';

interface EntryPageProps {
  onStart: (data: UserData) => void;
}

const MASKED_COMPANIES = [
  { name: 'Mc****** Ma****** Sdn Bhd', distance: '500m' },
  { name: 'Pe****** Di****** Sdn Bhd', distance: '450m' },
  { name: 'Ai****** Te****** Sdn Bhd', distance: '520m' },
  { name: 'Ge****** So****** Sdn Bhd', distance: '480m' },
  { name: 'Da****** Sy****** Sdn Bhd', distance: '495m' },
  { name: 'Sm****** Bu****** Sdn Bhd', distance: '510m' },
  { name: 'Te****** In****** Sdn Bhd', distance: '475m' },
  { name: 'Di****** Co****** Sdn Bhd', distance: '530m' },
  { name: 'Cy****** Ne****** Sdn Bhd', distance: '465m' },
  { name: 'Qu****** La****** Sdn Bhd', distance: '505m' },
  { name: 'Ne****** Te****** Sdn Bhd', distance: '490m' },
  { name: 'Al****** Gr****** Sdn Bhd', distance: '525m' },
  { name: 'Fu****** So****** Sdn Bhd', distance: '515m' },
  { name: 'Vi****** De****** Sdn Bhd', distance: '470m' },
];

const EntryPage: React.FC<EntryPageProps> = ({ onStart }) => {
  const [formData, setFormData] = useState<UserData>({
    companyName: '',
    email: '',
    phone: '',
    countryCode: '🇲🇾 (+60)',
  });

  const [notification, setNotification] = useState<{ name: string; distance: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      const randomCompany = MASKED_COMPANIES[Math.floor(Math.random() * MASKED_COMPANIES.length)];
      setNotification(randomCompany);
      setTimeout(() => setNotification(null), 4000);
    };

    const interval = setInterval(showNotification, 6000);
    showNotification();

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.companyName && formData.email && formData.phone) {
      setIsLoading(true);
      // Simulate preparation time before starting game
      setTimeout(() => {
        onStart(formData);
      }, 1500);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center px-3 md:px-6 lg:px-12 overflow-hidden">
      
      {/* Live Company Notification - Centered, aligned with logo */}
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-5 py-2.5 rounded-full shadow-2xl border-2 border-red-300 flex items-center gap-2 text-xs md:text-sm font-bold">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-black">{notification.name}</span>
            <span className="opacity-95 font-extrabold">got {notification.distance}! 🍊</span>
          </div>
        </div>
      )}
      
      {/* Scattered Floating Vouchers - Visible Layer */}
      {/* Resized to be slightly smaller (w-16 to w-28 range) for 13" laptop */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
         {voucherPositions.map((pos, i) => (
             <img 
                key={i}
                src={getVoucherImg(i)}
                alt=""
                className="absolute w-16 md:w-20 lg:w-28 drop-shadow-xl float-animation opacity-80"
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
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 z-10 relative">
        
        {/* Left Column: Huge Title & Copy & Major Rewards */}
        <div className="w-full lg:w-3/5 flex flex-col items-center text-center animate-slide-up space-y-1 relative">
          <img 
            src={IMAGES.campaignHeader} 
            alt="A HUAT THING" 
            className="w-full max-w-[220px] md:max-w-[320px] lg:max-w-[420px] h-auto drop-shadow-2xl filter brightness-110"
          />
          
          <div className="max-w-xl w-full flex flex-col items-center space-y-1">
            {/* Copy */}
            <div className="relative p-1 mx-auto">
                <div className="absolute inset-0 blur-xl bg-black/20 rounded-full opacity-40 transform scale-x-125"></div>
                <h2 className="relative text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] whitespace-nowrap md:whitespace-normal">
                    Throw Tangerine <br/>
                    <span className="text-xl md:text-3xl lg:text-4xl text-white opacity-95 block mt-1 font-bold tracking-tight text-shadow-md">
                        & Win Huat Rewards
                    </span>
                </h2>
            </div>
            
            {/* Major Rewards Display - Resized for 13" laptop */}
            <div className="w-full pt-3 flex justify-center overflow-visible pb-4">
               <div className="flex flex-row justify-center items-end -space-x-2 md:-space-x-4">
                  {MAJOR_REWARDS.map((reward, idx) => (
                    <div key={idx} className="relative group transition-all duration-300 hover:-translate-y-4 hover:z-50 hover:scale-105 z-10">
                        {/* Increased dimensions slightly */}
                        <div className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] filter brightness-110">
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
          
          {/* RM2888 Giant Voucher - Resized for 13" laptop */}
          <div className="relative z-40 mb-[-30px] w-36 md:w-48 lg:w-60 transition-transform hover:scale-105 duration-300">
             <img 
                src={RM2888_VOUCHER} 
                alt="RM2888 Voucher" 
                className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] float-animation" 
             />
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-[420px] bg-white p-5 md:p-8 rounded-[2rem] border-[6px] border-yellow-500 shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4 solid-shadow relative pt-10 z-30">
            
            <div className="absolute -top-8 -right-8 text-6xl rotate-12 animate-pulse filter drop-shadow-2xl hidden md:block">
              🍊
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs md:text-sm font-black uppercase tracking-widest text-red-700">Company Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Acme Corp" 
                className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-base md:text-lg"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs md:text-sm font-black uppercase tracking-widest text-red-700">Work Email</label>
              <input 
                required
                type="email" 
                placeholder="name@company.com" 
                className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-base md:text-lg"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="flex gap-2 text-left">
              <div className="flex-none w-24 md:w-28 space-y-1.5">
                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-red-700">Region</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-1.5 py-3 text-gray-900 focus:outline-none focus:border-red-500 transition-all appearance-none font-bold text-center text-sm md:text-base"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                  >
                    {asianCountries.map((c) => (
                      <option key={c.code} value={`${c.emoji} (${c.code})`}>
                        {c.emoji} ({c.code})
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs md:text-sm font-black uppercase tracking-widest text-red-700">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  placeholder="123456789" 
                  className="w-full bg-gray-50 border-[3px] border-gray-100 rounded-xl px-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all font-bold text-base md:text-lg"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full font-black text-2xl md:text-3xl py-4 rounded-xl shadow-xl transform transition-all flex items-center justify-center gap-2 uppercase tracking-[0.1em] mt-3 border-b-4 ${
                isLoading 
                  ? 'bg-gray-400 border-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-600 active:scale-95 pulse-gold border-red-900'
              } text-white`}
            >
               {isLoading ? (
                 <>
                   <span className="animate-spin">⏳</span> Preparing
                 </>
               ) : (
                 <>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-red-200 to-red-300">THROW NOW</span> <span className="animate-bounce">🍊</span>
                 </>
               )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
