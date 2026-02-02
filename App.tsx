
// AJT Promotion App
import React, { useState, useEffect } from 'react';
import { GameState, UserData, QuizData } from './types';
import EntryPage from './components/EntryPage';
import GamePage from './components/GamePage';
import PreClaimModal from './components/PreClaimModal';
import PrizeReveal from './components/PrizeReveal';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ENTRY');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [spinCount, setSpinCount] = useState(0);

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
          onReset={() => {
            setGameState('ENTRY');
            setSpinCount(0);
            setQuizData(null);
          }}
        />
      )}
    </Layout>
  );
};

export default App;
