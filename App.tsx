
// AJT Promotion App
import React, { useState, useEffect } from 'react';
import { GameState, UserData, QuizData, ReferralData } from './types';
import EntryPage from './components/EntryPage';
import GamePage from './components/GamePage';
import PreClaimModal from './components/PreClaimModal';
import PrizeReveal from './components/PrizeReveal';
import Layout from './components/Layout';
import { submitToGoogleSheets, getUtmParams, formatPhoneNumber, SheetSubmissionData } from './lib/googleSheets';

// Track user interactions
interface UserInteractions {
  clickShareLinkedin: boolean;
  clickShareWhatsapp: boolean;
  clickTngo: boolean;
  clickMoreHuat: boolean;
  clickRegister: boolean;
  clickLogin: boolean;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ENTRY');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [prizeWon, setPrizeWon] = useState<string>('');
  const [utmParams] = useState(() => getUtmParams());
  const [interactions, setInteractions] = useState<UserInteractions>({
    clickShareLinkedin: false,
    clickShareWhatsapp: false,
    clickTngo: false,
    clickMoreHuat: false,
    clickRegister: false,
    clickLogin: false,
  });
  const [submissionTimestamp] = useState(() => new Date().toISOString());

  // Daily play restriction check
  useEffect(() => {
    const lastPlayed = localStorage.getItem('cny_spin_last_played');
    const today = new Date().toDateString();
    if (lastPlayed === today) {
      console.log("Welcome back today!");
    }
  }, []);

  // Submit data to Google Sheets
  const submitData = async (
    user: UserData,
    quiz: QuizData | null,
    currentInteractions: UserInteractions,
    referral?: ReferralData
  ) => {
    // Calculate gift based on survey_q3 (headcount)
    const gift = quiz?.headcount ? determineGift(quiz.headcount) : '';
    
    const submissionData: SheetSubmissionData = {
      timestamp: submissionTimestamp,
      company_name: user.companyName,
      email: user.email,
      phone_number: formatPhoneNumber(user.countryCode, user.phone),
      survey_q1: quiz?.resignationFrequency || '',
      survey_q2: quiz?.hiringPlan || '',
      survey_q3: quiz?.headcount || '',
      gift: gift,
      click_share_linkedin: currentInteractions.clickShareLinkedin ? 'yes' : 'no',
      click_share_whatsapp: currentInteractions.clickShareWhatsapp ? 'yes' : 'no',
      click_tngo: currentInteractions.clickTngo ? 'yes' : 'no',
      click_more_huat: currentInteractions.clickMoreHuat ? 'yes' : 'no',
      click_register: currentInteractions.clickRegister ? 'yes' : 'no',
      click_login: currentInteractions.clickLogin ? 'yes' : 'no',
      referral_name: referral?.name || '',
      referral_phone: referral?.phone || '',
      referral_position: referral?.position || '',
      referral_email: referral?.email || '',
      referral_companyname: referral?.companyName || '',
      utm_campaign: utmParams.utmCampaign || 'direct',
      utm_source: utmParams.utmSource || 'direct',
      utm_medium: utmParams.utmMedium || 'direct',
    };
    await submitToGoogleSheets(submissionData);
  };

  // 1. When user submits entry form (Open Angpau)
  const handleStartSpin = async (data: UserData) => {
    setUserData(data);
    // Submit initial entry
    await submitData(data, null, interactions);
    setGameState('GAME');
  };

  const handleFinishSpins = (finalCount: number) => {
    setSpinCount(finalCount);
    setGameState('PRE_CLAIM');
  };

  // 2. When user completes survey
  const handleQuizSubmit = async (data: QuizData) => {
    setQuizData(data);
    localStorage.setItem('cny_spin_last_played', new Date().toDateString());
    
    if (!userData) return;
    
    const gift = determineGift(data.headcount);
    setPrizeWon(gift);
    
    // Submit with survey data
    await submitData(userData, data, interactions);
    
    setGameState('REVEAL');
  };

  // Determine gift based on headcount (survey_q3)
  const determineGift = (headcount: string): string => {
    if (headcount === "1 - 5 people") return "Disc RM288 off AJobThing Voucher";
    if (headcount === "6 - 10 people") return "Disc RM588 off AJobThing Voucher + FREE Billboard Ad";
    if (headcount === "11 - 30 people") return "Disc RM988 off AJobThing Voucher + FREE Billboard Ad";
    if (headcount === "31 - 100 people") return "Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad";
    if (headcount === "100 people") return "Disc RM1,888 off AJobThing Voucher + FREE Billboard Ad";
    return "Disc RM288 off AJobThing Voucher";
  };

  // 3. Track "Click More Huat"
  const handleMoreHuatClick = async () => {
    const newInteractions = { ...interactions, clickMoreHuat: true };
    setInteractions(newInteractions);
    
    if (userData && quizData) {
      await submitData(userData, quizData, newInteractions);
    }
  };

  // 4 & 5. Track share clicks (LinkedIn & WhatsApp)
  const handleShareClick = async (platform: 'linkedin' | 'whatsapp') => {
    const newInteractions = { 
      ...interactions, 
      clickShareLinkedin: platform === 'linkedin' ? true : interactions.clickShareLinkedin,
      clickShareWhatsapp: platform === 'whatsapp' ? true : interactions.clickShareWhatsapp,
    };
    setInteractions(newInteractions);
    
    if (userData && quizData) {
      await submitData(userData, quizData, newInteractions);
    }
  };

  // Track TnGo click
  const handleTngoClick = async () => {
    const newInteractions = { ...interactions, clickTngo: true };
    setInteractions(newInteractions);
    
    if (userData && quizData) {
      await submitData(userData, quizData, newInteractions);
    }
  };

  // 6. Submit Referral
  const handleReferralSubmit = async (referral: ReferralData) => {
    if (!userData || !quizData) return;
    await submitData(userData, quizData, interactions, referral);
  };

  // 7 & 8. Track Register/Login button clicks
  const handleRegisterClick = async () => {
    const newInteractions = { ...interactions, clickRegister: true };
    setInteractions(newInteractions);
    
    if (userData && quizData) {
      await submitData(userData, quizData, newInteractions);
    }
  };

  const handleLoginClick = async () => {
    const newInteractions = { ...interactions, clickLogin: true };
    setInteractions(newInteractions);
    
    if (userData && quizData) {
      await submitData(userData, quizData, newInteractions);
    }
  };

  return (
    <Layout isCompact={gameState !== 'ENTRY'}>
      {gameState === 'ENTRY' && <EntryPage onStart={handleStartSpin} />}
      {gameState === 'GAME' && (
        <GamePage 
          onComplete={handleFinishSpins} 
          currentSpin={spinCount}
          setSpinCount={setSpinCount}
        />
      )}
      {gameState === 'PRE_CLAIM' && (
        <PreClaimModal onSubmit={handleQuizSubmit} />
      )}
      {gameState === 'REVEAL' && (
        <PrizeReveal 
          spinCount={spinCount} 
          quizData={quizData}
          onReferralSubmit={handleReferralSubmit}
          onMoreHuatClick={handleMoreHuatClick}
          onShareClick={handleShareClick}
          onTngoClick={handleTngoClick}
          onRegisterClick={handleRegisterClick}
          onLoginClick={handleLoginClick}
          onReset={() => {
            setGameState('ENTRY');
            setSpinCount(0);
            setQuizData(null);
            setPrizeWon('');
            setInteractions({
              clickShareLinkedin: false,
              clickShareWhatsapp: false,
              clickTngo: false,
              clickMoreHuat: false,
              clickRegister: false,
              clickLogin: false,
            });
          }}
        />
      )}
    </Layout>
  );
};

export default App;
