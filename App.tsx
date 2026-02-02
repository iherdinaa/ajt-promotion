
// AJT Promotion App
import React, { useState, useEffect } from 'react';
import { GameState, UserData, QuizData, ReferralData } from './types';
import EntryPage from './components/EntryPage';
import GamePage from './components/GamePage';
import PreClaimModal from './components/PreClaimModal';
import PrizeReveal from './components/PrizeReveal';
import Layout from './components/Layout';
import { submitToGoogleSheets, getUtmParams, formatPhoneNumber, SheetSubmissionData } from './lib/googleSheets';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ENTRY');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [prizeWon, setPrizeWon] = useState<string>('');
  const [utmParams] = useState(() => getUtmParams());

  // Daily play restriction check
  useEffect(() => {
    const lastPlayed = localStorage.getItem('cny_spin_last_played');
    const today = new Date().toDateString();
    if (lastPlayed === today) {
      console.log("Welcome back today!");
    }
  }, []);

  const handleStartSpin = (data: UserData) => {
    setUserData(data);
    setGameState('GAME');
  };

  const handleFinishSpins = (finalCount: number) => {
    setSpinCount(finalCount);
    setGameState('PRE_CLAIM');
  };

  const handleQuizSubmit = (data: QuizData) => {
    setQuizData(data);
    localStorage.setItem('cny_spin_last_played', new Date().toDateString());
    setGameState('REVEAL');
  };

  // Determine gift based on headcount (same logic as PrizeReveal)
  const determineGift = (headcount: string): string => {
    if (headcount === "1 - 5 people") return "Tier 1 Voucher";
    if (headcount === "6 - 10 people") return "Tier 2 Voucher + Billboard Chance";
    if (headcount === "11 - 30 people") return "Tier 3 Voucher + Billboard Chance";
    if (headcount === "31 - 100 people") return "Tier 4 Voucher + Billboard Chance";
    if (headcount === "100 people") return "Tier 5 Voucher + Billboard Chance";
    return "Tier 1 Voucher";
  };

  // Submit initial entry data (without referral) to Google Sheets
  const submitEntryToSheets = async (quiz: QuizData) => {
    if (!userData) return;
    
    const gift = determineGift(quiz.headcount);
    setPrizeWon(gift);
    
    const submissionData: SheetSubmissionData = {
      timestamp: new Date().toISOString(),
      entry_point: window.location.pathname || '/',
      company_name: userData.companyName,
      email: userData.email,
      phone_number: formatPhoneNumber(userData.countryCode, userData.phone),
      survey_q1: quiz.resignationFrequency,
      survey_q2: quiz.hiringPlan,
      survey_q3: quiz.headcount,
      gift: gift,
      referral_name: '',
      referral_company: '',
      referral_email: '',
      referral_phone: '',
      referral_position: '',
      utm_source: utmParams.utmSource,
      utm_medium: utmParams.utmMedium,
      utm_campaign: utmParams.utmCampaign,
    };
    
    await submitToGoogleSheets(submissionData);
  };

  // Handle referral submission
  const handleReferralSubmit = async (referral: ReferralData) => {
    if (!userData || !quizData) return;
    
    const submissionData: SheetSubmissionData = {
      timestamp: new Date().toISOString(),
      entry_point: window.location.pathname || '/',
      company_name: userData.companyName,
      email: userData.email,
      phone_number: formatPhoneNumber(userData.countryCode, userData.phone),
      survey_q1: quizData.resignationFrequency,
      survey_q2: quizData.hiringPlan,
      survey_q3: quizData.headcount,
      gift: prizeWon + ' + Referral Bonus (Free Internship Ad)',
      referral_name: referral.name,
      referral_company: referral.companyName,
      referral_email: referral.email,
      referral_phone: referral.phone,
      referral_position: referral.position,
      utm_source: utmParams.utmSource,
      utm_medium: utmParams.utmMedium,
      utm_campaign: utmParams.utmCampaign,
    };
    
    await submitToGoogleSheets(submissionData);
  };

  // Effect to submit entry data when quiz is completed
  useEffect(() => {
    if (quizData && userData) {
      submitEntryToSheets(quizData);
    }
  }, [quizData]);

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
          onReset={() => {
            setGameState('ENTRY');
            setSpinCount(0);
            setQuizData(null);
            setPrizeWon('');
          }}
        />
      )}
    </Layout>
  );
};

export default App;
