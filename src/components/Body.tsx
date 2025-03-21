import { useState, useRef, useEffect } from 'react';

// Constants for validation
const MAX_MULTIPLIER = 1000;
const MAX_BET_AMOUNT = 1000000;

// Utility function for safe number parsing and validation
const safeParseFloat = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
};

// Utility function for safe division
const safeDivide = (numerator: number, denominator: number): number => {
  if (denominator === 0 || !isFinite(denominator) || !isFinite(numerator)) return 0;
  const result = numerator / denominator;
  return isFinite(result) ? Number(result.toFixed(2)) : 0;
};

function Body() {
    // State to store the final values
    const [a, setA] = useState<number>(0);
    const [b, setB] = useState<number>(0);
    const [betAmount, setBetAmount] = useState<number>(0);
    const [actualBetAmount, setActualBetAmount] = useState<number>(0);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    // Create refs for the input elements
    const teamAInputRef = useRef<HTMLInputElement>(null);
    const teamBInputRef = useRef<HTMLInputElement>(null);
    const betAmountInputRef = useRef<HTMLInputElement>(null);
    
    // Validate and handle input
    const validateInput = (value: number, type: 'multiplier' | 'bet'): string => {
      if (value < 0) return "Value cannot be negative";
      if (type === 'multiplier' && value > MAX_MULTIPLIER) {
        return `Multiplier cannot exceed ${MAX_MULTIPLIER}`;
      }
      if (type === 'bet' && value > MAX_BET_AMOUNT) {
        return `Bet amount cannot exceed ₹${MAX_BET_AMOUNT.toLocaleString()}`;
      }
      return "";
    };

    // Handle button clicks with validation
    const handleASubmit = () => {
      const inputValue = teamAInputRef.current?.value || '';
      const newValue = safeParseFloat(inputValue);
      const error = validateInput(newValue, 'multiplier');
      
      if (error) {
        setErrors(prev => ({ ...prev, teamA: error }));
        return;
      }
      
      setErrors(prev => ({ ...prev, teamA: '' }));
      setA(newValue);
      console.log("Team A submitted value:", newValue);
    };
    
    const handleBSubmit = () => {
      const inputValue = teamBInputRef.current?.value || '';
      const newValue = safeParseFloat(inputValue);
      const error = validateInput(newValue, 'multiplier');
      
      if (error) {
        setErrors(prev => ({ ...prev, teamB: error }));
        return;
      }
      
      setErrors(prev => ({ ...prev, teamB: '' }));
      setB(newValue);
      console.log("Team B submitted value:", newValue);
    };

    const handleBetAmountSubmit = () => {
      const inputValue = betAmountInputRef.current?.value || '';
      const newValue = safeParseFloat(inputValue);
      const error = validateInput(newValue, 'bet');
      
      if (error) {
          setErrors(prev => ({ ...prev, betAmount: error }));
          return;
      }
      
      setErrors(prev => ({ ...prev, betAmount: '' }));
      setBetAmount(newValue);
      console.log("Bet amount submitted:", newValue);
    };
    
    // Calculate team-specific bet amounts with safe division
    const calculateTeamABet = () => {
      if (a <= 0) return 0;
      return safeDivide(betAmount, a);
    };
    
    const calculateTeamBBet = () => {
      if (b <= 0) return 0;
      return safeDivide(betAmount, b);
    };
    
    // Calculate team-specific returns with precision handling
    const calculateTeamAReturns = () => {
      const teamABet = calculateTeamABet();
      return Number((teamABet * a).toFixed(2)) || 0;
    };
    
    const calculateTeamBReturns = () => {
      const teamBBet = calculateTeamBBet();
      return Number((teamBBet * b).toFixed(2)) || 0;
    };
    
    // Check if returns exceed the risk threshold (2145)
    const isTeamAReturnsExceedingThreshold = () => {
      return calculateTeamAReturns() > 2145;
    };
    
    const isTeamBReturnsExceedingThreshold = () => {
      return calculateTeamBReturns() > 2145;
    };
    
    // Calculate best profit with precision handling
    const calculateBestProfit = () => {
      const teamAReturns = calculateTeamAReturns();
      const teamBReturns = calculateTeamBReturns();
      const totalReturns = teamAReturns + teamBReturns;
      return totalReturns > 0 ? Number((totalReturns - actualBetAmount).toFixed(2)) : 0;
    };
    
    // Calculate worst case outcome with improved precision
    const calculateWorstCase = () => {
      const teamAReturns = calculateTeamAReturns();
      const teamBReturns = calculateTeamBReturns();
      
      let minReturns;
      if (a > 0 && b > 0) {
          minReturns = Math.min(teamAReturns, teamBReturns);
      } else if (a > 0) {
          minReturns = teamAReturns;
      } else if (b > 0) {
          minReturns = teamBReturns;
      } else {
          minReturns = 0;
      }
      
      return Number((minReturns - actualBetAmount).toFixed(2));
    };
    
    // Helper function to determine if worst case is profit or loss
    const isWorstCaseProfit = () => {
      return calculateWorstCase() >= 0;
    };
    
    // Update actual bet amount with precision handling
    useEffect(() => {
      const teamABet = calculateTeamABet();
      const teamBBet = calculateTeamBBet();
      const newActualBetAmount = Number((teamABet + teamBBet).toFixed(2));
      
      if (isFinite(newActualBetAmount)) {
        setActualBetAmount(newActualBetAmount);
      }
    }, [a, b, betAmount]); // Remove actualBetAmount from dependency array to avoid circular updates

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Stake Betting</h1>
      
      {/* Betting Amount Section */}
      <div className="mb-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Bet</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-gray-700">Enter the amount you want to bet</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input 
              type="number" 
              placeholder="Amount" 
              className="input input-bordered w-full pl-8 bg-white focus:border-purple-500 focus:ring focus:ring-purple-200"
              ref={betAmountInputRef}
              defaultValue=""
            />
          </div>
          {errors.betAmount && <p className="text-xs text-red-500 mt-1">{errors.betAmount}</p>}
          <p className="text-xs text-gray-500 mt-2">Enter the total amount you wish to bet on this game</p>
          
          <button 
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            onClick={handleBetAmountSubmit}
          >
            Set Bet
          </button>
        </div>
      </div>
      
      {/* Team Multipliers Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Team A Card */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 flex-1 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
              <span className="text-white font-bold">A</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Team A</h2>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Enter Multiplier</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">(×)</span>
              <input 
                type="number" 
                placeholder="Multiplier" 
                className="input input-bordered w-full pl-10 bg-white focus:border-blue-500 focus:ring focus:ring-blue-200"
                ref={teamAInputRef}
                defaultValue=""
              />
            </div>
            {errors.teamA && <p className="text-xs text-red-500 mt-1">{errors.teamA}</p>}
            <p className="text-xs text-gray-500 mt-2">Enter the multiplier on Team A</p>
            
            <button 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              onClick={handleASubmit}
            >
              Enter
            </button>
            
            {/* Team A Bet Amount Section */}
            {a > 0 && betAmount > 0 && (
              <div className="mt-6 p-3 bg-blue-100 rounded-md">
                <h3 className="font-semibold text-blue-800 mb-1">Your bet on Team A</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-blue-700">₹{calculateTeamABet().toFixed(2)}</p>
                  <div className="bg-blue-200 px-2 py-1 rounded text-xs text-blue-800">
                    {betAmount > 0 && a > 0 ? `₹${betAmount} ÷ ${a}` : '-'}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Amount to bet on Team A to balance risk</p>
              </div>
            )}
            
            {/* Team A Returns Section */}
            {a > 0 && betAmount > 0 && (
              <div className="mt-3 p-3 bg-green-100 rounded-md">
                <h3 className="font-semibold text-green-800 mb-1">Estimated Returns if Team A wins</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-green-700">₹{calculateTeamAReturns().toFixed(2)}</p>
                  <div className="bg-green-200 px-2 py-1 rounded text-xs text-green-800">
                    ₹{calculateTeamABet().toFixed(2)} × {a}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Your bet amount multiplied by Team A's odds
                </p>
                <div className="mt-2 pt-2 border-t border-green-200 flex justify-between items-center">
                  <span className="text-xs font-medium text-green-800">Net Profit:</span>
                  <span className="text-xs font-bold text-green-800">
                    +₹{(calculateTeamAReturns() - calculateTeamABet()).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Team A Risk Alert */}
            {isTeamAReturnsExceedingThreshold() && (
              <div className="mt-3 p-3 bg-indigo-100 border border-indigo-300 rounded-md animate-pulse">
                <div className="flex items-start">
                  <div className="bg-indigo-400 p-1 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-800">High Risk Warning</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      Your potential returns exceed ₹2,145. Maximum Bonus amount could not be more than $25.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team B Card */}
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 flex-1 border border-amber-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mr-3">
              <span className="text-white font-bold">B</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Team B</h2>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Enter Multiplier</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">(×)</span>
              <input 
                type="number" 
                placeholder="Multiplier" 
                className="input input-bordered w-full pl-10 bg-white focus:border-amber-500 focus:ring focus:ring-amber-200"
                ref={teamBInputRef}
                defaultValue=""
              />
            </div>
            {errors.teamB && <p className="text-xs text-red-500 mt-1">{errors.teamB}</p>}
            <p className="text-xs text-gray-500 mt-2">Enter the multiplier on Team B</p>
            
            <button 
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              onClick={handleBSubmit}
            >
              Enter
            </button>
            
            {/* Team B Bet Amount Section */}
            {b > 0 && betAmount > 0 && (
              <div className="mt-6 p-3 bg-amber-100 rounded-md">
                <h3 className="font-semibold text-amber-800 mb-1">Your bet on Team B</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-amber-700">₹{calculateTeamBBet().toFixed(2)}</p>
                  <div className="bg-amber-200 px-2 py-1 rounded text-xs text-amber-800">
                    {betAmount > 0 && b > 0 ? `₹${betAmount} ÷ ${b}` : '-'}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Amount to bet on Team B to balance risk</p>
              </div>
            )}
            
            {/* Team B Returns Section */}
            {b > 0 && betAmount > 0 && (
              <div className="mt-3 p-3 bg-green-100 rounded-md">
                <h3 className="font-semibold text-green-800 mb-1">Estimated Returns if Team B wins</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-green-700">₹{calculateTeamBReturns().toFixed(2)}</p>
                  <div className="bg-green-200 px-2 py-1 rounded text-xs text-green-800">
                    ₹{calculateTeamBBet().toFixed(2)} × {b}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Your bet amount multiplied by Team B's odds
                </p>
                <div className="mt-2 pt-2 border-t border-green-200 flex justify-between items-center">
                  <span className="text-xs font-medium text-green-800">Net Profit:</span>
                  <span className="text-xs font-bold text-green-800">
                    +₹{(calculateTeamBReturns() - calculateTeamBBet()).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Team B Risk Alert */}
            {isTeamBReturnsExceedingThreshold() && (
              <div className="mt-3 p-3 bg-teal-100 border border-teal-300 rounded-md animate-pulse">
                <div className="flex items-start">
                  <div className="bg-teal-400 p-1 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-teal-800">High Risk Warning</h4>
                    <p className="text-xs text-teal-700 mt-1">
                      Your potential returns exceed ₹2,145. Maximum Bonus amount could not be more than $25.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Summary Section */}
      {(a > 0 || b > 0 || betAmount > 0) && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center">Bet Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Team A Multiplier</p>
              <p className="text-xl font-bold">{a || "-"}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Target Bet Amount</p>
              <p className="text-xl font-bold">₹{betAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded">
              <p className="text-sm text-gray-600">Team B Multiplier</p>
              <p className="text-xl font-bold">{b || "-"}</p>
            </div>
          </div>
          
          {/* Actual Bet Amount */}
          {actualBetAmount > 0 && (
            <div className="p-4 bg-indigo-50 rounded-lg mb-6 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Actual Bet Amount</h3>
                  <p className="text-2xl font-bold text-indigo-600">₹{actualBetAmount.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <div className="flex items-center text-sm">
                    <div className="bg-blue-200 px-2 py-1 rounded mr-2">
                      <span className="font-medium text-blue-800">₹{calculateTeamABet().toFixed(2)}</span>
                    </div>
                    <span className="text-gray-600">+</span>
                    <div className="bg-amber-200 px-2 py-1 rounded ml-2">
                      <span className="font-medium text-amber-800">₹{calculateTeamBBet().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sum of individual bets on Team A and Team B
              </p>
            </div>
          )}
          
          {/* Best Case / Worst Case Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Best Case Profit */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-100">
              <h3 className="font-bold text-lg text-green-800 mb-2">Best Case Scenario</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profit Amount</p>
                  <p className="text-2xl font-bold text-green-600">+₹{calculateBestProfit().toFixed(2)}</p>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Calculated as: Sum of all returns - Actual betting amount
                </p>
                {/* Only show the calculation details if there are valid returns */}
                {(a > 0 || b > 0) && actualBetAmount > 0 && (
                  <div className="mt-2 bg-green-50 p-2 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Team A Returns:</span>
                      <span>₹{calculateTeamAReturns().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">+ Team B Returns:</span>
                      <span>₹{calculateTeamBReturns().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">- Actual Bet Amount:</span>
                      <span>₹{actualBetAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-green-200 mt-1 pt-1 flex justify-between items-center">
                      <span className="font-medium text-green-700">Best Profit:</span>
                      <span className="font-medium text-green-700">₹{calculateBestProfit().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Worst Case - Can be either profit or loss now */}
            <div className={`p-4 bg-gradient-to-br ${
                isWorstCaseProfit() ? 'from-green-50 to-green-100 border-green-100' : 'from-red-50 to-red-100 border-red-100'
              } rounded-lg border`}>
              <h3 className={`font-bold text-lg ${
                isWorstCaseProfit() ? 'text-green-800' : 'text-red-800'
              } mb-2`}>Worst Case Scenario</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{isWorstCaseProfit() ? 'Profit Amount' : 'Loss Amount'}</p>
                  <p className={`text-2xl font-bold ${
                    isWorstCaseProfit() ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isWorstCaseProfit() ? '+' : '-'}₹{Math.abs(calculateWorstCase()).toFixed(2)}
                  </p>
                </div>
                <div className={`${
                  isWorstCaseProfit() ? 'bg-green-200' : 'bg-red-200'
                } p-3 rounded-full`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                    isWorstCaseProfit() ? 'text-green-700' : 'text-red-700'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      isWorstCaseProfit() 
                        ? "M5 10l7-7m0 0l7 7m-7-7v18" // up arrow for profit
                        : "M19 14l-7 7m0 0l-7-7m7 7V3" // down arrow for loss
                    } />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Calculated as: Min(Team returns) - Actual betting amount
                </p>
                {/* Only show the calculation details if there are valid returns */}
                {(a > 0 || b > 0) && actualBetAmount > 0 && (
                  <div className={`mt-2 ${
                    isWorstCaseProfit() ? 'bg-green-50' : 'bg-red-50'
                  } p-2 rounded text-xs`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Min Returns:</span>
                      <span>₹{Math.min(
                        a > 0 ? calculateTeamAReturns() : Infinity,
                        b > 0 ? calculateTeamBReturns() : Infinity
                      ).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600">- Actual Bet Amount:</span>
                      <span>₹{actualBetAmount.toFixed(2)}</span>
                    </div>
                    <div className={`border-t ${
                      isWorstCaseProfit() ? 'border-green-200' : 'border-red-200'
                    } mt-1 pt-1 flex justify-between items-center`}>
                      <span className={`font-medium ${
                        isWorstCaseProfit() ? 'text-green-700' : 'text-red-700'
                      }`}>{isWorstCaseProfit() ? 'Worst Profit:' : 'Worst Loss:'}</span>
                      <span className={`font-medium ${
                        isWorstCaseProfit() ? 'text-green-700' : 'text-red-700'
                      }`}>{isWorstCaseProfit() ? '+' : '-'}₹{Math.abs(calculateWorstCase()).toFixed(2)}</span>
                    </div>
                    
                    {/* Show special notice when both multipliers are > 1 */}
                    {a > 1 && b > 1 && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                        <p className="text-xs text-green-700 font-medium">
                          Both multipliers are greater than 1, guaranteeing a profit in all scenarios!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Body
