import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { generateFlashcards } from '../src/services/geminiService';
import { updateFlashcardSRS } from '../src/services/srsService';
import { Flashcard, FlashcardDeck } from '../types';
import { useUser } from '../App';

const Flashcards = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDeckTopic, setNewDeckTopic] = useState('');
  const [notesText, setNotesText] = useState('');
  
  // Review State
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewSessionComplete, setReviewSessionComplete] = useState(false);

  useEffect(() => {
    const savedDecks = localStorage.getItem(`decks_${user?.email}`);
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    }
  }, [user]);

  const saveDecks = (updatedDecks: FlashcardDeck[]) => {
    setDecks(updatedDecks);
    localStorage.setItem(`decks_${user?.email}`, JSON.stringify(updatedDecks));
  };

  const handleGenerateDeck = async () => {
    if (!newDeckTopic.trim()) return;
    setIsGenerating(true);
    try {
      const cards = await generateFlashcards(newDeckTopic, notesText);
      const newDeck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        title: newDeckTopic,
        subject: 'General',
        cards: cards,
        createdAt: new Date().toISOString()
      };
      saveDecks([newDeck, ...decks]);
      setNewDeckTopic('');
      setNotesText('');
    } catch (error) {
      console.error("Failed to generate cards", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startReview = (deck: FlashcardDeck) => {
    const now = new Date();
    const dueCards = deck.cards.filter(card => new Date(card.nextReview) <= now);
    
    // For demo/empty SRS, if no cards are due, review all cards
    const cardsToReview = dueCards.length > 0 ? dueCards : deck.cards;
    
    setReviewCards(cardsToReview);
    setActiveDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setReviewSessionComplete(false);
  };

  const handleSRSResponse = (quality: number) => {
    if (!activeDeck) return;

    const currentCard = reviewCards[currentCardIndex];
    const updatedCard = updateFlashcardSRS(currentCard, quality);

    const updatedDeck = {
      ...activeDeck,
      cards: activeDeck.cards.map(c => c.id === currentCard.id ? updatedCard : c),
      lastStudied: new Date().toISOString()
    };

    const newDecks = decks.map(d => d.id === activeDeck.id ? updatedDeck : d);
    saveDecks(newDecks);
    setActiveDeck(updatedDeck);

    if (currentCardIndex < reviewCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setReviewSessionComplete(true);
    }
  };

  const deleteDeck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveDecks(decks.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen p-8 bg-bg-base text-text-primary font-sans transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center justify-between bg-surface/80 backdrop-blur-xl border border-border-subtle p-8 rounded-2xl">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
                Flashcard Decks
              </h1>
              <p className="text-text-secondary font-medium">Smart AI Generation • Spaced Repetition Mastery</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20 shadow-2xl">
                  <Brain size={24} />
               </div>
            </div>
          </div>
        </div>

        {!activeDeck ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Generate Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface/80 border border-border-subtle rounded-3xl p-6 space-y-6 sticky top-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-brand-400" size={20} />
                  <h2 className="text-xl font-bold">New AI Deck</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest pl-1">Topic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Quantum Physics, React Hooks..."
                      className="w-full mt-2 bg-text-primary/5 dark:bg-slate-950/50 border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm font-medium"
                      value={newDeckTopic}
                      onChange={(e) => setNewDeckTopic(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest pl-1">Study Material (Optional)</label>
                    <textarea 
                      placeholder="Paste your notes here for custom cards..."
                      className="w-full mt-2 bg-text-primary/5 dark:bg-slate-950/50 border border-border-subtle rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-sm font-medium h-32 resize-none"
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={handleGenerateDeck}
                    disabled={isGenerating || !newDeckTopic.trim()}
                    className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 py-4 rounded-xl font-bold text-sm shadow-lg shadow-brand-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating Cards...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Decks List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {decks.length === 0 && !isGenerating && (
                  <div className="md:col-span-2 py-24 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-surface flex items-center justify-center mx-auto text-text-muted border border-border-subtle">
                      <BookOpen size={40} />
                    </div>
                    <p className="text-text-secondary font-medium tracking-tight">No decks yet. Use AI to build your first one!</p>
                  </div>
                )}
                
                {decks.map((deck) => {
                   const now = new Date();
                   const dueCount = deck.cards.filter(c => new Date(c.nextReview) <= now).length;
                   
                   return (
                    <motion.div 
                      key={deck.id}
                      layoutId={deck.id}
                      onClick={() => startReview(deck)}
                      className="group cursor-pointer bg-surface/80 border border-border-subtle rounded-3xl p-6 hover:bg-surface-hover hover:border-brand-500/30 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => deleteDeck(deck.id, e)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                         </button>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-500 transition-colors">{deck.title}</h3>
                            <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest">
                               <BookOpen size={12} />
                               {deck.cards.length} Cards
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                           {dueCount > 0 ? (
                             <div className="px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black rounded-lg border border-brand-500/20 flex items-center gap-2 animate-pulse">
                                <Clock size={12} />
                                {dueCount} DUE NOW
                             </div>
                           ) : (
                              <div className="px-3 py-1.5 bg-text-primary/10 text-text-muted text-[10px] font-black rounded-lg flex items-center gap-2">
                                <CheckCircle2 size={12} />
                                ALL CAUGHT UP
                              </div>
                           )}
                           <div className="flex-1" />
                           <div className="p-2 rounded-full border border-border-subtle bg-bg-base text-text-muted group-hover:text-brand-500 group-hover:border-brand-500/30 transition-all">
                              <ChevronRight size={16} />
                           </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-text-primary/10 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-gradient-to-r from-brand-600 to-indigo-500"
                              style={{ width: `${(deck.cards.filter(c => c.interval > 0).length / deck.cards.length) * 100}%` }}
                           />
                        </div>
                      </div>
                    </motion.div>
                   );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE REVIEW SESSION */
          <div className="max-w-4xl mx-auto space-y-12">
            
            <div className="flex items-center justify-between">
               <button 
                  onClick={() => setActiveDeck(null)}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-bold text-sm"
               >
                  <ChevronLeft size={20} /> Exit Review
               </button>
               
               <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-2">Session Progress</span>
                  <div className="flex gap-1 h-1.5 w-48 bg-text-primary/10 rounded-full overflow-hidden">
                    {reviewCards.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-full transition-all duration-500 ${i < currentCardIndex ? 'bg-brand-500' : i === currentCardIndex ? 'bg-brand-500 animate-pulse' : 'bg-transparent'}`}
                        style={{ width: `${100 / reviewCards.length}%` }}
                      />
                    ))}
                  </div>
               </div>
               
               <div className="w-24" /> {/* Spacer */}
            </div>

            {!reviewSessionComplete ? (
              <div className="space-y-12">
                {/* THE CARD */}
                <div 
                  className="relative h-[480px] w-full perspective-1000 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCardIndex + (isFlipped ? '-back' : '-front')}
                      initial={{ opacity: 0, rotateY: isFlipped ? -20 : 20, scale: 0.95 }}
                      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                      exit={{ opacity: 0, rotateY: isFlipped ? 20 : -20, scale: 0.95 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                      className={`absolute inset-0 rounded-[40px] border p-12 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl ${
                        isFlipped 
                          ? 'bg-surface border-indigo-500/30' 
                          : 'bg-surface border-border-subtle'
                      }`}
                    >
                      <div className="absolute top-8 left-12 flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                         {isFlipped ? <Sparkles size={12} className="text-brand-500" /> : <Brain size={12} className="text-text-muted" />}
                         {isFlipped ? 'Response' : 'Question'}
                      </div>

                      <div className="space-y-6 max-w-2xl">
                         <h2 className={`font-bold leading-tight ${isFlipped ? 'text-3xl text-text-primary' : 'text-4xl text-text-primary'}`}>
                           {isFlipped ? reviewCards[currentCardIndex].back : reviewCards[currentCardIndex].front}
                         </h2>
                         {isFlipped && reviewCards[currentCardIndex].explanation && (
                            <p className="text-text-secondary text-lg font-medium leading-relaxed italic">
                              "{reviewCards[currentCardIndex].explanation}"
                            </p>
                         )}
                      </div>

                      <div className="absolute bottom-8 text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                         <RotateCcw size={12} /> Click Card to Flip
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* SRS Controls */}
                <div className="flex justify-center items-center gap-4">
                  {isFlipped ? (
                    <div className="flex gap-4 p-2 bg-surface/50 border border-border-subtle rounded-[30px] backdrop-blur-xl">
                       <button 
                        onClick={() => handleSRSResponse(0)}
                        className="px-8 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm transition-all border border-red-500/20"
                       >
                         Again
                       </button>
                       <button 
                        onClick={() => handleSRSResponse(1)}
                        className="px-8 py-4 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-sm transition-all border border-orange-500/20"
                       >
                         Hard
                       </button>
                       <button 
                        onClick={() => handleSRSResponse(3)}
                        className="px-8 py-4 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-sm transition-all border border-brand-500/20"
                       >
                         Good
                       </button>
                       <button 
                        onClick={() => handleSRSResponse(5)}
                        className="px-8 py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm transition-all border border-emerald-500/20"
                       >
                         Easy
                       </button>
                    </div>
                  ) : (
                    <div className="h-[74px] flex items-center text-text-muted font-bold text-sm tracking-tight animate-pulse">
                      Recall the answer, then flip to score your performance
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SESSION COMPLETE */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center space-y-8 text-center"
              >
                 <div className="relative">
                   <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-20 animate-pulse"></div>
                   <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl relative">
                      <CheckCircle2 size={40} />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black text-text-primary">Memory Cycle Complete!</h2>
                    <p className="text-text-secondary text-lg font-medium max-w-sm">You've strengthened your neural connections for "{activeDeck.title}".</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-surface border border-border-subtle p-6 rounded-3xl text-center">
                       <p className="text-3xl font-black text-text-primary">{reviewCards.length}</p>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Cards Mastered</p>
                    </div>
                    <div className="bg-surface border border-border-subtle p-6 rounded-3xl text-center">
                       <p className="text-3xl font-black text-brand-600 dark:text-brand-400">+{reviewCards.length * 10}XP</p>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Bonus Earned</p>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                   <button 
                    onClick={() => setActiveDeck(null)}
                    className="px-8 py-4 bg-text-primary text-bg-base font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-text-primary/10 whitespace-nowrap"
                   >
                      CONTINUE STUDYING
                   </button>
                   <button 
                    onClick={() => navigate('/quiz', { state: { topic: activeDeck.title, difficulty: 'Mixed', count: 10, autoStart: true } })}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-500/20 whitespace-nowrap"
                   >
                      <Brain size={18} />
                      TAKE A QUIZ
                   </button>
                 </div>
              </motion.div>

            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Flashcards;
