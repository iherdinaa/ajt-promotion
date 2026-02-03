
import React, { useState, useMemo } from 'react';
import { QuizData, ReferralData } from '../types';
import { REWARD_IMAGES } from '../constants';

interface PrizeRevealProps {
  spinCount: number;
  quizData: QuizData | null;
  onReferralSubmit: (referral: ReferralData) => Promise<void>;
  onMoreHuatClick: () => Promise<void>;
  onShareClick: (platform: 'linkedin' | 'whatsapp') => Promise<void>;
  onTngoClick: () => Promise<void>;
  onReset: () => void;
}

const PrizeReveal: React.FC<PrizeRevealProps> = ({ quizData, onReferralSubmit, onMoreHuatClick, onShareClick, onTngoClick, onReset }) => {
  // Directly start at REVEAL to satisfy "auto reveal prize"
  const [step, setStep] = useState<'REVEAL' | 'REFERRAL' | 'REFERRAL_SUCCESS'>('REVEAL');
  const [isTnGModalOpen, setIsTnGModalOpen] = useState(false);
  
  // Date Logic for Prizes
  const today = new Date();
  
  // Vouchers & Billboard: Until 18 Feb 2026
  const endCampaign = new Date('2026-02-18T23:59:59');
  const showStandardPrizes = today <= endCampaign;
  
  // TnG: 4-12 Feb 2026 AND 16-18 Feb 2026
  const tngRange1 = today >= new Date('2026-02-04') && today <= new Date('2026-02-12T23:59:59');
  const tngRange2 = today >= new Date('2026-02-16') && today <= new Date('2026-02-18T23:59:59');
  const showTnG = tngRange1 || tngRange2;

  // Lunch: 4-9 Feb 2026 OR 13 Feb 2026
  const lunchRange1 = today >= new Date('2026-02-04') && today <= new Date('2026-02-09T23:59:59');
  const lunchDay2 = today.toDateString() === new Date('2026-02-13').toDateString();
  const showLunch = lunchRange1 || lunchDay2;

  // Referral Form State
  const [referralData, setReferralData] = useState<ReferralData>({
    name: '',
    position: 'HR/Recruiter',
    companyName: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobPositions = [
    "Owner / Founder",
    "Director / General Manager",
    "Hiring Manager / Department Head",
    "HR/Recruiter",
    "Outlet or Branch Manager",
    "Admin or Finance",
    "Others"
  ];

  // Determine rewards based on headcount
  const rewardData = useMemo(() => {
    if (!quizData) return { image: REWARD_IMAGES.tier1, hasBillboard: false };
    
    const hc = quizData.headcount;
    
    // Logic Mapping
    if (hc === "1 - 5 people") {
        return { image: REWARD_IMAGES.tier1, hasBillboard: false };
    } else if (hc === "6 - 10 people") {
        return { image: REWARD_IMAGES.tier2, hasBillboard: true };
    } else if (hc === "11 - 30 people") {
        return { image: REWARD_IMAGES.tier3, hasBillboard: true };
    } else if (hc === "31 - 100 people") {
        return { image: REWARD_IMAGES.tier4, hasBillboard: true };
    } else if (hc === "100 people") {
        // Special Reward Logic for max headcount
        return { image: REWARD_IMAGES.tier5, hasBillboard: true };
    }
    
    return { image: REWARD_IMAGES.tier1, hasBillboard: false };
  }, [quizData]);

  const handleShare = async (platform: 'whatsapp' | 'linkedin') => {
    // Track share click
    await onShareClick(platform);
    
    const text = "I just won huge rewards in A Huat Thing from AJobThing. Come tap your ong and win angpau too!";
    const url = "https://ajobthing.promotion.com"; 
    
    if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    } else {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onReferralSubmit(referralData);
      setStep('REFERRAL_SUCCESS');
    } catch (error) {
      console.error('[v0] Referral submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start sm:justify-center p-2 sm:p-3 md:p-4 lg:p-6 text-center overflow-y-auto">
      {/* Responsive container */}
      <div className="max-w-4xl lg:max-w-5xl w-full bg-white rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] p-3 sm:p-4 md:p-6 lg:p-8 shadow-[0_0_30px_rgba(234,179,8,0.25)] sm:shadow-[0_0_60px_rgba(234,179,8,0.35)] relative border-[4px] sm:border-[5px] md:border-[7px] lg:border-[10px] border-yellow-500 animate-scale-bounce solid-shadow flex flex-col justify-start sm:justify-center my-2 sm:my-auto min-h-0 sm:min-h-[60vh]">
        
        {step === 'REVEAL' && (
          <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center w-full">
            <div className="w-full mb-3 sm:mb-4 md:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-red-700 leading-tight italic uppercase tracking-tighter mb-1 sm:mb-2">
                    CONGRATS, YOU WON!
                </h2>
                <div className="w-20 sm:w-28 md:w-32 h-1 sm:h-1.5 md:h-2 bg-yellow-400 mx-auto rounded-full mb-1 sm:mb-2"></div>
            </div>
            
            {/* Rewards Container */}
            <div className="w-full grid gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 items-stretch grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center">
                
                {/* Main Voucher - Shows if within campaign date */}
                {showStandardPrizes && (
                  <div className="bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 border-red-100 shadow-lg flex flex-col items-center justify-center hover:border-red-300 transition-colors group">
                      <span className="text-[10px] sm:text-xs font-black text-red-500 mb-1 sm:mb-2 uppercase tracking-wide sm:tracking-widest bg-red-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">Main Reward</span>
                      <img 
                          src={rewardData.image} 
                          alt="Voucher" 
                          className="w-full h-auto rounded-md sm:rounded-lg max-h-32 sm:max-h-44 md:max-h-56 object-contain group-hover:scale-105 transition-transform duration-200"
                          loading="eager"
                      />
                  </div>
                )}

                {/* TnG Reload - Date Restricted */}
                {showTnG && (
                    <div 
                        onClick={async () => {
                          await onTngoClick();
                          setIsTnGModalOpen(true);
                        }}
                        className="cursor-pointer bg-blue-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-blue-200 shadow-lg flex flex-col items-center justify-center relative overflow-hidden transition-all active:scale-95 hover:bg-blue-100 group"
                    >
                        <span className="text-[10px] sm:text-xs font-black text-blue-500 mb-1 sm:mb-2 uppercase tracking-wide sm:tracking-widest bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">TnG Reload</span>
                        <img 
                            src="https://play-lh.googleusercontent.com/RSjanNWkLuOzTRgj4Yi67PjZ0Qyrbc91856YqBqWewutnzLYj5cYKMPIEM9wRt5KSg" 
                            alt="TnG" 
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-2 sm:mb-3 rounded-xl sm:rounded-2xl shadow-sm group-hover:rotate-6 transition-transform"
                            loading="lazy"
                        />
                        <span className="text-xs sm:text-sm font-black text-blue-700 text-center leading-tight animate-pulse bg-blue-200/50 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full">
                            Tap to Reveal Code
                        </span>
                    </div>
                )}

                 {/* Billboard Logic - Date Restricted & Headcount Logic */}
                 {showStandardPrizes && rewardData.hasBillboard && (
                     <div className="bg-yellow-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-yellow-200 shadow-lg flex flex-col items-center justify-between relative hover:bg-yellow-100 transition-colors h-full min-h-[10rem] sm:min-h-[14rem] md:min-h-[16rem]">
                        <span className="text-[10px] sm:text-xs font-black text-yellow-600 mb-1 sm:mb-2 uppercase tracking-wide sm:tracking-widest bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">A Chance to Get</span>
                        <img src={REWARD_IMAGES.billboard} alt="Billboard" className="w-full h-20 sm:h-28 md:h-32 object-contain my-1 sm:my-2" loading="lazy" />
                        <span className="text-xs sm:text-sm font-bold text-center leading-tight text-yellow-800">Free Billboard Ad* worth RM5,000</span>
                     </div>
                 )}
            </div>

            {/* Additional Text Info */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm w-full bg-red-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-2 border-red-100 shadow-inner">
                {showLunch && (
                    <>
                        <p className="font-bold text-gray-800 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                            <i className="fa-solid fa-star text-yellow-500 text-[10px] sm:text-sm"></i>
                            <span>Chance to win <span className="text-red-600 font-black">Free Lunch Treat</span> from AJobThing!</span>
                        </p>
                        <div className="w-1/2 mx-auto h-px bg-red-200"></div>
                    </>
                )}
                
                <div className="flex flex-col gap-1 sm:gap-2 text-center">
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">
                        Voucher valid until 18 February 2026
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium leading-relaxed">
                        If you're hiring, our Hiring Support will guide you to use this voucher. Please be ready to be Called or Whatsapp.
                    </p>
                </div>
            </div>

            {/* Share Section */}
            <div className="w-full mb-4 sm:mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <p className="text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest whitespace-nowrap">Share the Prosperity</p>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <div className="flex gap-2 sm:gap-4 justify-center">
                    <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-1.5 sm:gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95">
                        <i className="fa-brands fa-whatsapp text-base sm:text-xl md:text-2xl"></i> 
                        <span className="text-xs sm:text-base md:text-lg">WhatsApp</span>
                    </button>
                    <button onClick={() => handleShare('linkedin')} className="flex items-center gap-1.5 sm:gap-3 bg-[#0077b5] hover:bg-[#00669c] text-white px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95">
                        <i className="fa-brands fa-linkedin text-base sm:text-xl md:text-2xl"></i> 
                        <span className="text-xs sm:text-base md:text-lg">LinkedIn</span>
                    </button>
                </div>
            </div>

            <div className="w-full max-w-xl mx-auto">
               <button 
                onClick={async () => {
                  await onMoreHuatClick();
                  setStep('REFERRAL');
                }}
                className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:brightness-110 text-red-900 font-black text-sm sm:text-lg md:text-xl py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgba(234,179,8,0.4)] transform active:scale-95 transition-all uppercase tracking-wide sm:tracking-widest border-b-[3px] sm:border-b-[4px] md:border-b-[6px] border-yellow-700 flex items-center justify-center gap-2 sm:gap-3 animate-pulse group"
               >
                 <span>WANT MORE HUAT?</span>
                 <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform text-xs sm:text-base"></i>
               </button>
            </div>
          </div>
        )}

        {step === 'REFERRAL' && (
            <div className="animate-in fade-in slide-in-from-right duration-500 w-full text-left max-w-3xl mx-auto">
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <div className="inline-block bg-red-100 text-red-600 rounded-full p-2 sm:p-3 md:p-4 mb-2 sm:mb-4">
                        <i className="fa-solid fa-users-viewfinder text-xl sm:text-3xl md:text-4xl"></i>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight mb-1 sm:mb-2">Refer a HR Friend</h2>
                    <p className="text-gray-500 font-medium max-w-lg mx-auto text-xs sm:text-sm md:text-base px-2">
                        Refer a friend from the same or a different company to unlock more Huat rewards.
                    </p>
                </div>

                <form onSubmit={handleReferralSubmit} className="space-y-3 sm:space-y-4 md:space-y-6 bg-gray-50 p-3 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-100 shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {/* Name Field */}
                        <div className="relative group">
                            <label className="block text-[10px] sm:text-xs font-black text-gray-500 uppercase mb-1 sm:mb-2 ml-1">Friend's Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-user text-gray-300 group-focus-within:text-red-500 transition-colors text-xs sm:text-sm"></i>
                                </div>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="John Doe"
                                    className="w-full bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 pl-8 sm:pl-11 pr-3 sm:pr-4 font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-100 transition-all placeholder-gray-300 text-sm sm:text-base" 
                                    value={referralData.name}
                                    onChange={e => setReferralData({...referralData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Position Field */}
                        <div className="relative group">
                            <label className="block text-[10px] sm:text-xs font-black text-gray-500 uppercase mb-1 sm:mb-2 ml-1">Job Position</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-briefcase text-gray-300 group-focus-within:text-red-500 transition-colors text-xs sm:text-sm"></i>
                                </div>
                                <select 
                                    className="w-full bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 pl-8 sm:pl-11 pr-3 sm:pr-4 font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-100 transition-all appearance-none text-sm sm:text-base"
                                    value={referralData.position}
                                    onChange={e => setReferralData({...referralData, position: e.target.value})}
                                >
                                    {jobPositions.map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-chevron-down text-[10px] sm:text-xs text-gray-400"></i>
                                </div>
                            </div>
                            {referralData.position === 'Others' && (
                                 <input 
                                    type="text" 
                                    placeholder="Please specify"
                                    className="w-full mt-2 sm:mt-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-100 transition-all animate-in fade-in slide-in-from-top-2 text-sm sm:text-base" 
                                />
                            )}
                        </div>

                        {/* Company Field */}
                        <div className="relative group">
                            <label className="block text-[10px] sm:text-xs font-black text-gray-500 uppercase mb-1 sm:mb-2 ml-1">Company Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-building text-gray-300 group-focus-within:text-red-500 transition-colors text-xs sm:text-sm"></i>
                                </div>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Company Sdn Bhd"
                                    className="w-full bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 pl-8 sm:pl-11 pr-3 sm:pr-4 font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-100 transition-all placeholder-gray-300 text-sm sm:text-base" 
                                    value={referralData.companyName}
                                    onChange={e => setReferralData({...referralData, companyName: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="relative group">
                            <label className="block text-[10px] sm:text-xs font-black text-gray-500 uppercase mb-1 sm:mb-2 ml-1">Phone Number</label>
                            <div className="flex">
                                <span className="bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-lg sm:rounded-l-xl px-2 sm:px-4 py-2 sm:py-2.5 md:py-3 font-bold text-gray-500 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                    <span>🇲🇾</span> +60
                                </span>
                                <input 
                                    required 
                                    type="tel" 
                                    placeholder="12 345 6789"
                                    className="w-full bg-white border-2 border-l-0 border-gray-200 rounded-r-lg sm:rounded-r-xl py-2 sm:py-2.5 md:py-3 pr-3 sm:pr-4 font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-100 transition-all placeholder-gray-300 text-sm sm:text-base" 
                                    value={referralData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setReferralData({...referralData, phone: val});
                                    }}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative group sm:col-span-2">
                            <label className="block text-[10px] sm:text-xs font-black text-gray-500 uppercase mb-1 sm:mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-envelope text-gray-300 group-focus-within:text-red-500 transition-colors text-xs sm:text-sm"></i>
                                </div>
                                <input 
                                    required 
                                    type="email" 
                                    placeholder="friend@company.com"
                                    className="w-full bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 pl-8 sm:pl-11 pr-3 sm:pr-4 font-bold text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 sm:focus:ring-4 focus:ring-red-100 transition-all placeholder-gray-300 text-sm sm:text-base" 
                                    value={referralData.email}
                                    onChange={e => setReferralData({...referralData, email: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 sm:pt-3 md:pt-4 space-y-2 sm:space-y-3">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 text-white font-black text-sm sm:text-lg md:text-xl py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-wide sm:tracking-widest transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Referral'} <i className={`fa-solid ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} ml-1 sm:ml-2 text-xs sm:text-base`}></i>
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => setStep('REVEAL')}
                            className="w-full text-gray-400 font-bold text-xs sm:text-sm py-2 sm:py-3 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        >
                            Cancel & Back to Rewards
                        </button>
                    </div>
                </form>
            </div>
        )}

        {step === 'REFERRAL_SUCCESS' && (
            <div className="animate-in fade-in zoom-in duration-500 w-full flex flex-col items-center">
                 <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-red-700 uppercase tracking-tighter mb-2 sm:mb-4 leading-tight text-center px-2">
                    Congrats, You Won<br/>
                    <span className="text-yellow-600 bg-yellow-50 px-1 sm:px-2 rounded-md sm:rounded-lg text-lg sm:text-xl md:text-3xl">1 Free Internship Job Ad!</span>
                 </h2>
                 
                 <div className="w-full max-w-[200px] sm:max-w-xs md:max-w-sm mb-4 sm:mb-6 md:mb-8 relative group">
                    <div className="absolute inset-0 bg-yellow-400/30 blur-xl sm:blur-2xl rounded-full animate-pulse"></div>
                    <img 
                        src="https://files.ajt.my/images/marketing-campaign/image-410dff8d-530c-4496-9e94-58d9aa3d8a54.png" 
                        alt="Internship Reward" 
                        className="relative z-10 w-full h-auto object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                 </div>

                 <div className="bg-gray-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 mb-4 sm:mb-6 md:mb-8 max-w-lg w-full">
                     <p className="text-gray-600 font-bold text-center leading-relaxed text-xs sm:text-sm md:text-base">
                        If you don't have an AJobThing account, please make sure to <span className="text-red-600">register</span>. <br/>
                        If you have an account, please <span className="text-yellow-600">login and claim</span>.
                     </p>
                 </div>

                 <div className="w-full max-w-md space-y-2 sm:space-y-3 md:space-y-4 px-2">
                     <a 
                        href="https://ajobthing.com/register" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full bg-red-600 text-white font-black text-sm sm:text-lg md:text-xl py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-wide sm:tracking-widest hover:-translate-y-1 text-center"
                     >
                        Register Account
                     </a>
                     
                     <a 
                        href="https://ajobthing.com/login" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full bg-yellow-400 text-red-900 font-black text-sm sm:text-lg md:text-xl py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-lg hover:bg-yellow-300 transition-all uppercase tracking-wide sm:tracking-widest border-b-2 sm:border-b-4 border-yellow-600 hover:-translate-y-1 text-center"
                     >
                        Login & Claim
                     </a>
                 </div>

                 <button 
                    onClick={() => onReset()}
                    className="mt-4 sm:mt-6 md:mt-8 text-gray-400 font-bold text-xs sm:text-sm hover:text-red-500 underline decoration-2 decoration-red-200"
                 >
                    Back to Start
                 </button>
            </div>
        )}
      </div>

      {/* TnG Modal */}
      {isTnGModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-[280px] sm:max-w-sm w-full text-center relative border-[4px] sm:border-[6px] border-blue-500 shadow-2xl">
                  <button 
                    onClick={() => setIsTnGModalOpen(false)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-600 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                      <i className="fa-solid fa-times text-xs sm:text-sm"></i>
                  </button>
                  
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-blue-600 text-xl sm:text-3xl">
                      <i className="fa-solid fa-wallet"></i>
                  </div>
                  
                  <h3 className="text-lg sm:text-2xl font-black text-blue-600 uppercase mb-3 sm:mb-6 tracking-tight">Your TnG Code</h3>
                  
                  <div className="bg-blue-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl mb-3 sm:mb-6 border-2 border-blue-100 dashed-border">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TnGRedemptionCode123" 
                        alt="TnG QR" 
                        className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mix-blend-multiply mb-2 sm:mb-4"
                      />
                      <div className="bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg border border-blue-200">
                          <p className="font-mono font-bold text-base sm:text-xl text-gray-800 tracking-wider sm:tracking-widest select-all">
                              TNG-HUAT-888
                          </p>
                      </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                      Scan QR or copy code to redeem <span className="text-blue-600 font-bold">RM88</span> credit.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};

export default PrizeReveal;
