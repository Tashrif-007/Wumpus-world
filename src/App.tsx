import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Globe, 
  Bot, 
  Skull, 
  Zap, 
  Trophy, 
  Wind, 
  Eye, 
  Settings, 
  Play, 
  Square, 
  RotateCcw, 
  Upload, 
  MapPin, 
  Activity, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Wifi,
  WifiOff,
  Loader,
  Circle,
  CircleDot,
  Target,
  X
} from 'lucide-react';

interface GameState {
  grid: string[][];
  playing_grid: string[][];
  agent_pos: [number, number];
  agent_alive: boolean;
  game_over: boolean;
  has_gold: boolean;
  has_arrow: boolean;
  arrow_used: boolean;
  knowledge_base: Array<{
    type: string;
    content: string;
    confidence: number;
  }>;
  last_inference: string;
  percepts: string[];
}

interface AgentAction {
  action: string;
  position: [number, number];
  reasoning: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastAction, setLastAction] = useState<AgentAction | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && gameState && !gameState.game_over) {
      intervalRef.current = setInterval(() => {
        handleStep();
      }, 200); // Reduced from 500ms to 100ms for faster simulation
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, gameState]);

  const connectWebSocket = () => {
    setConnectionStatus('connecting');
    wsRef.current = new WebSocket(`ws://${window.location.hostname}:8000/ws`);
    
    wsRef.current.onopen = () => {
      setConnectionStatus('connected');
      console.log('WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'game_state') {
        setGameState(message.data);
      } else if (message.type === 'agent_action') {
        setLastAction(message.data);
      }
    };
    
    wsRef.current.onclose = () => {
      setConnectionStatus('disconnected');
      console.log('WebSocket disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
  };

  const handleReset = async () => {
    setIsRunning(false);
    try {
      await fetch(`http://${window.location.hostname}:8000/api/reset`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  };

  const handleStart = async () => {
    setIsRunning(true);
    try {
      await fetch(`http://${window.location.hostname}:8000/api/start`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to start game:', error);
      setIsRunning(false);
    }
  };

  const handleStep = async () => {
    try {
      await fetch(`http://${window.location.hostname}:8000/api/step`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to execute step:', error);
    }
  };

  const handleUploadEnv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`http://${window.location.hostname}:8000/api/upload_env`, {
        method: "POST",
        body: formData,
      });
      setIsRunning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      alert("Failed to upload environment file.");
    }
  };

  const getCellDisplay = (cell: string, x: number, y: number) => {
    const isAgent = gameState && gameState.agent_pos[0] === x && gameState.agent_pos[1] === y;
    
    let content = null;
    let bgColor = 'bg-slate-50';
    let textColor = 'text-slate-600';
    let borderColor = 'border-slate-200';
    
    if (isAgent) {
      content = <Bot className="w-6 h-6 text-blue-600" />;
      bgColor = 'bg-blue-100';
      borderColor = 'border-blue-300';
    } else if (cell.includes('W')) {
      content = <Skull className="w-6 h-6 text-red-600" />;
      bgColor = 'bg-red-100';
      borderColor = 'border-red-300';
    } else if (cell.includes('P')) {
      content = <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-black rounded-full"></div></div>;
      bgColor = 'bg-gray-800';
      textColor = 'text-white';
      borderColor = 'border-gray-600';
    } else if (cell.includes('G')) {
      content = <Trophy className="w-6 h-6 text-yellow-600" />;
      bgColor = 'bg-yellow-100';
      borderColor = 'border-yellow-300';
    }
    
    return { content, bgColor, textColor, borderColor };
  };

  const getPlayingCellDisplay = (val: string, x: number, y: number) => {
    const isAgent = gameState && gameState.agent_pos[0] === x && gameState.agent_pos[1] === y;
    
    let content = null;
    let bgColor = 'bg-gray-700';
    let textColor = 'text-gray-400';
    let borderColor = 'border-gray-600';
    
    if (isAgent) {
      content = <Bot className="w-4 h-4 text-blue-400" />;
      bgColor = 'bg-blue-900/50';
      borderColor = 'border-blue-400';
    } else if (val === "0") {
      content = <Circle className="w-4 h-4 text-gray-500" />;
      bgColor = 'bg-gray-800';
      borderColor = 'border-gray-600';
    } else if (val === "1") {
      content = <CheckCircle className="w-4 h-4 text-green-400" />;
      bgColor = 'bg-green-900/40';
      textColor = 'text-green-400';
      borderColor = 'border-green-400';
    } else if (val === "99") {
      content = <Trophy className="w-4 h-4 text-yellow-400" />;
      bgColor = 'bg-yellow-900/40';
      textColor = 'text-yellow-400';
      borderColor = 'border-yellow-400';
    } else if (val === "-1") {
      content = <Target className="w-4 h-4 text-yellow-400" />;
      bgColor = 'bg-yellow-900/30';
      textColor = 'text-yellow-400';
      borderColor = 'border-yellow-400';
    } else if (val === "-2") {
      content = <CircleDot className="w-4 h-4 text-cyan-400" />;
      bgColor = 'bg-cyan-900/30';
      textColor = 'text-cyan-400';
      borderColor = 'border-cyan-400';
    } else if (val === "-3") {
      content = <Skull className="w-4 h-4 text-red-400" />;
      bgColor = 'bg-red-900/40';
      textColor = 'text-red-400';
      borderColor = 'border-red-400';
    } else if (val === "-4") {
      content = <X className="w-4 h-4 text-gray-300" />;
      bgColor = 'bg-gray-900';
      textColor = 'text-gray-300';
      borderColor = 'border-gray-400';
    } else if (val === "-5") {
      content = <AlertTriangle className="w-4 h-4 text-purple-400" />;
      bgColor = 'bg-purple-900/30';
      textColor = 'text-purple-400';
      borderColor = 'border-purple-400';
    } else if (val === "-6") {
      content = <AlertTriangle className="w-4 h-4 text-orange-400" />;
      bgColor = 'bg-orange-900/30';
      textColor = 'text-orange-400';
      borderColor = 'border-orange-400';
    } else if (val === "S") {
      content = <Skull className="w-4 h-4 text-purple-400" />;
      bgColor = 'bg-purple-900/30';
      textColor = 'text-purple-400';
      borderColor = 'border-purple-400';
    } else if (val === "B") {
      content = <Wind className="w-4 h-4 text-cyan-400" />;
      bgColor = 'bg-cyan-900/30';
      textColor = 'text-cyan-400';
      borderColor = 'border-cyan-400';
    } else if (val === "T") {
      content = <div className="flex items-center"><Skull className="w-3 h-3 text-indigo-400" /><Wind className="w-3 h-3 text-indigo-400" /></div>;
      bgColor = 'bg-indigo-900/30';
      textColor = 'text-indigo-400';
      borderColor = 'border-indigo-400';
    }
    
    return { content, bgColor, textColor, borderColor };
  };


  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <h2 className="text-xl font-semibold mb-2">Initializing Wumpus AI Agent</h2>
          <p className="text-blue-200 flex items-center justify-center">
            {connectionStatus === 'connected' ? (
              <><Wifi className="w-4 h-4 mr-2" />Connected</>
            ) : connectionStatus === 'connecting' ? (
              <><Loader className="w-4 h-4 mr-2 animate-spin" />Connecting to server...</>
            ) : (
              <><WifiOff className="w-4 h-4 mr-2" />Disconnected</>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Panel - Agent's Knowledge */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-yellow-400 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Agent's Knowledge
          </h2>
        </div>
        
        <div className="p-4">
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="grid grid-cols-10 gap-1.5">
              {gameState.playing_grid.map((row, y) =>
                row.map((val, x) => {
                  const { content, bgColor, textColor, borderColor } = getPlayingCellDisplay(val, x, y);
                  return (
                    <div
                      key={`knowledge-${x}-${y}`}
                      className={`w-8 h-8 border-2 ${borderColor} ${bgColor} ${textColor} flex items-center justify-center text-xs font-medium rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer backdrop-blur-sm`}
                      title={`(${x},${y}) ${val === "0" ? 'Unknown' : 
                               val === "1" ? 'Visited & Safe' : 
                               val === "99" ? 'Gold' : 
                               val === "-1" ? 'Possible Wumpus (Target)' : 
                               val === "-2" ? 'Possible Pit' : 
                               val === "-3" ? 'Confirmed Wumpus (Dangerous!)' : 
                               val === "-4" ? 'Confirmed Pit (Dangerous!)' : 
                               val === "-5" ? 'Possible Wumpus or Pit' :
                               val === "-6" ? 'Low Confidence Threat' :
                               val}`}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Legend for Agent's Knowledge */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="text-yellow-400 font-semibold mb-2">Legend:</div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <Circle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">Unknown</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Visited & Safe</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Possible Wumpus</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <CircleDot className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">Possible Pit</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <Skull className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300">Confirmed Wumpus</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <X className="w-4 h-4 text-gray-300" />
                  <span className="text-gray-300">Confirmed Pit</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Gold</span>
                </div>
                <div className="flex items-center space-x-2 p-1 rounded bg-gray-600/30">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Agent Position</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Complete World Map */}
      <div className="flex-1 bg-gray-800">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-yellow-400 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Complete World Map
          </h2>
        </div>
        
        <div className="p-8 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-10 gap-2">
              {gameState.grid.map((row, y) =>
                row.map((cell, x) => {
                  const { content, bgColor, textColor, borderColor } = getCellDisplay(cell, x, y);
                  return (
                    <div
                      key={`world-${x}-${y}`}
                      className={`w-12 h-12 border-2 ${borderColor} ${bgColor} ${textColor} flex items-center justify-center text-lg font-medium rounded transition-all hover:scale-105 cursor-pointer`}
                      title={`(${x},${y}) ${cell === '-' ? 'Empty' : cell}`}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Legend for World Map */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Skull className="w-6 h-6 text-red-500" />
                <span className="text-slate-700">Wumpus</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                </div>
                <span className="text-slate-700">Pit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-slate-700">Gold</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="w-6 h-6 text-cyan-500" />
                <span className="text-slate-700">Breeze</span>
              </div>
              <div className="flex items-center space-x-2">
                <Skull className="w-6 h-6 text-purple-500" />
                <span className="text-slate-700">Stench</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-500" />
                <span className="text-slate-700">Agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Analysis */}
      <div className="w-1/3 bg-gray-800 border-l border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-pink-400 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            AI Analysis
          </h2>
        </div>
        
        <div className="p-4 space-y-4 h-screen overflow-y-auto">
          {/* World Setup */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              World Setup
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="radio" id="random" name="worldType" defaultChecked className="text-blue-400" />
                <label htmlFor="random" className="text-sm">Random World</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="custom" name="worldType" className="text-blue-400" />
                <label htmlFor="custom" className="text-sm">Custom World</label>
              </div>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.txt';
                  input.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files) {
                      const fakeEvent = {
                        target: { files: target.files }
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleUploadEnv(fakeEvent);
                    }
                  });
                  input.click();
                }}
                className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mt-2 text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                LOAD WORLD
              </button>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-2">
            <button
              onClick={isRunning ? () => setIsRunning(false) : handleStart}
              className={`w-full px-4 py-2 rounded font-medium transition-colors flex items-center justify-center ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  STOP
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  START
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              RESET
            </button>
          </div>

          {/* Current Status */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Current Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Stop:</span>
                <span className="text-yellow-400">0</span>
              </div>
              <div className="flex justify-between">
                <span>Position:</span>
                <span className="text-yellow-400">({gameState.agent_pos[0]}, {gameState.agent_pos[1]})</span>
              </div>
              <div className="flex justify-between">
                <span>Direction:</span>
                <span className="text-yellow-400">Right</span>
              </div>
              <div className="flex justify-between">
                <span>Has Arrow:</span>
                <span className="text-yellow-400">{gameState.has_arrow ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Gold Collected:</span>
                <span className="text-yellow-400">{gameState.has_gold ? '1' : '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Agent Alive:</span>
                <span className="text-yellow-400">{gameState.agent_alive ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Current Percepts */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Current Percepts
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Stench:</span>
                <span className="text-yellow-400">{gameState.percepts?.includes('Stench') ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Breeze:</span>
                <span className="text-yellow-400">{gameState.percepts?.includes('Breeze') ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Glitter:</span>
                <span className="text-yellow-400">{gameState.percepts?.includes('Glitter') ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-pink-400 font-semibold mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              AI Reasoning
            </h3>
            <div className="text-sm text-gray-300">
              {lastAction ? (
                <div className="space-y-2">
                  <div><strong>Action:</strong> {lastAction.action}</div>
                  <div><strong>Reasoning:</strong> {lastAction.reasoning}</div>
                </div>
              ) : (
                <div className="text-gray-400">Ready to start AI analysis...</div>
              )}
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Knowledge Base
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Safe Rooms:</span>
                <span className="text-yellow-400">[{gameState.playing_grid.flat().filter(val => val === "1").length}]</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {gameState.knowledge_base.slice(-5).map((item, index) => (
                  <div key={index} className="text-xs text-gray-300 bg-gray-600 rounded p-2">
                    <div className="truncate">{item.content}</div>
                  </div>
                ))}
                
                {gameState.knowledge_base.length === 0 && (
                  <div className="text-gray-400 text-center py-2">
                    No knowledge acquired yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {connectionStatus === 'connected' ? (
                <><Wifi className="w-3 h-3 mr-1" />Connected</>
              ) : connectionStatus === 'connecting' ? (
                <><Loader className="w-3 h-3 mr-1 animate-spin" />Connecting</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" />Disconnected</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;