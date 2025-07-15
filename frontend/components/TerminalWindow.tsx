"use client";
import React, { useRef, useEffect, useState } from "react";

interface TerminalWindowProps {
  history: { type: "input" | "output"; value: string }[];
  loading: boolean;
  input: string;
  setInput: (val: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  outputRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  lastScan: Date | null;
  prompt?: string;
  children?: React.ReactNode;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  history,
  loading,
  input,
  setInput,
  onInputKeyDown,
  outputRef,
  inputRef,
  lastScan,
  prompt = "C:\\>",
  children,
}) => {
  // Prevent horizontal scroll on the terminal window
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollLeft = 0;
    }
  }, [history]);

  // Draggable window state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Window state: normal, minimized, maximized, closed
  const [windowState, setWindowState] = useState<'normal' | 'minimized' | 'maximized' | 'closed'>('normal');

  // Blinking cursor state
  const [cursorVisible, setCursorVisible] = useState(true);

  // CRT flicker effect
  const [crtFlicker, setCrtFlicker] = useState(false);

  // Startup animation
  const [startupComplete, setStartupComplete] = useState(false);

  // Save previous position/size for restore
  const prevPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Window control handlers
  const handleClose = () => {
    // Play system sound effect (visual feedback)
    setCrtFlicker(true);
    setTimeout(() => {
      setWindowState('closed');
      setCrtFlicker(false);
    }, 200);
  };
  
  const handleMinimize = () => setWindowState('minimized');
  const handleMaximize = () => setWindowState(windowState === 'maximized' ? 'normal' : 'maximized');

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Startup animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartupComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (windowState === 'maximized') return;
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    // Prevent text selection
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // Window style for draggable and maximized/minimized states
  const windowStyle: React.CSSProperties = {
    zIndex: 1000,
    top: windowState === 'maximized' ? 0 : position.y,
    left: windowState === 'maximized' ? 0 : position.x,
    width: windowState === 'maximized' ? '100vw' : 720,
    height: windowState === 'maximized' ? '100vh' : undefined,
    minWidth: 320,
    minHeight: 120,
    display: windowState === 'closed' ? 'none' : 'block',
    transition: windowState === 'maximized' ? 'all 0.15s cubic-bezier(.4,2,.6,1)' : 'none',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    filter: crtFlicker ? 'brightness(1.5)' : 'none',
  };

  // ASCII art startup screen
  const startupScreen = `
╔════════════════════════════════════════════════╗
║           BLOCKCHAIN TERMINAL V2.0             ║
║         (C) 1995 CyberCorp Industries          ║
╠════════════════════════════════════════════════╣
║  Starting MS-DOS...                            ║
║  HIMEM is testing extended memory...done.      ║
║  Loading COMMAND.COM...                        ║
║  Loading BLOCKCHAIN.EXE...                     ║
║                                                ║
║  Type 'HELP' for available commands            ║
╚════════════════════════════════════════════════╝
`;

  return (
    <>
      {/* Global CRT styles */}
      <style jsx global>{`
        @keyframes flicker {
          0% { opacity: 0.97; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
        
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        
        .crt-effect {
          animation: flicker 0.15s infinite;
        }
        
        .crt-scanlines::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(0, 255, 0, 0.1);
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        
        .terminal-glow {
          text-shadow: 
            0 0 3px #00ff41,
            0 0 5px #00ff41,
            0 0 8px #00ff41;
        }
        
        .blink-cursor::after {
          content: "_";
          animation: blink 1s step-start infinite;
        }
        
        @keyframes blink {
          50% { opacity: 0; }
        }
        
        .dos-scrollbar::-webkit-scrollbar {
          width: 16px;
          background: #c0c0c0;
          border-left: 2px solid #fff;
        }
        
        .dos-scrollbar::-webkit-scrollbar-track {
          background: #c0c0c0;
          border: 1px inset #808080;
        }
        
        .dos-scrollbar::-webkit-scrollbar-thumb {
          background: #c0c0c0;
          border: 2px outset #fff;
          border-right-color: #808080;
          border-bottom-color: #808080;
        }
        
        .dos-scrollbar::-webkit-scrollbar-button {
          width: 16px;
          height: 16px;
          background: #c0c0c0;
          border: 2px outset #fff;
          border-right-color: #808080;
          border-bottom-color: #808080;
        }
      `}</style>

      <div className="fixed" style={windowStyle}>
        <div
          style={{
            pointerEvents: 'auto',
            height: windowState === 'minimized' ? 40 : undefined,
            border: '2px solid #dfdfdf',
            borderBottom: '2px solid #000',
            borderRight: '2px solid #000',
            borderRadius: 0,
            background: '#c0c0c0',
            boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #808080, 4px 4px 8px rgba(0,0,0,0.5)',
          }}
        >
          {/* Windows 95 Top Bar - draggable */}
          <div
            className="flex items-center h-8 px-1 select-none"
            style={{
              background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
              borderBottom: '1px solid #000',
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: '"MS Sans Serif", "Tahoma", sans-serif',
              fontSize: 14,
              letterSpacing: 0.5,
              userSelect: 'none',
              cursor: windowState === 'maximized' ? 'default' : 'move',
            }}
            onMouseDown={onMouseDown}
          >
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE5SURBVDiNpZMxTsNAEEXfLDuOE0SKBAWioKGgoaCgoaBEiIIbcAFuwAW4ARfgBlQUFBQUFBSIgpIGJCII2I6dvR8FG8eJnQjxpZVmZ/e9mf2zAiAiYozRIqJFRAwRMSKi0+k0fd+vDw4Hv9/vG6qq6vl8Pjy3iGhFUbBSKiwIgmBFEATLsizb7/e7ruvutNvtb8dxGOAP6rquVyqVLk3TnAPgnHMiouM4bKvVYgBZkiTP5XL5RkSOABzNbJqmLQdBcAfgFMAZgDNjzGWn03kLwzCXz+dfXNe9BnAB4Ng/j0ej0YPneXUAl0VRjIBvP3iet5TP52si8iAim1P7q6qqe51Op2GMuRaRjQl0IpI2m80Hz/N2ReRURDYBcABcRGRVVdWdWq32Nh6P7/8yZ0MsFot7pVLp5QfajWj2AlI1FQAAAABJRU5ErkJggg=="
              alt="Terminal"
              style={{ width: 16, height: 16, marginRight: 4, imageRendering: 'pixelated' }}
            />
            <span style={{ textShadow: '1px 1px 0 #000' }}>MS-DOS Prompt - BLOCKCHAIN TERMINAL</span>
            <div className="ml-auto flex" style={{ marginRight: 2 }}>
              {/* Win95 style buttons */}
              <button
                title="Minimize"
                onClick={handleMinimize}
                tabIndex={-1}
                style={{
                  width: 16,
                  height: 16,
                  background: '#c0c0c0',
                  border: '1px solid #000',
                  borderTop: '1px solid #fff',
                  borderLeft: '1px solid #fff',
                  marginLeft: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: 10,
                  boxShadow: 'inset -1px -1px #808080',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'Marlett, sans-serif',
                }}
              >_</button>
              <button
                title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
                onClick={handleMaximize}
                tabIndex={-1}
                style={{
                  width: 16,
                  height: 16,
                  background: '#c0c0c0',
                  border: '1px solid #000',
                  borderTop: '1px solid #fff',
                  borderLeft: '1px solid #fff',
                  marginLeft: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: 10,
                  boxShadow: 'inset -1px -1px #808080',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'Marlett, sans-serif',
                }}
              >□</button>
              <button
                title="Close"
                onClick={handleClose}
                tabIndex={-1}
                style={{
                  width: 16,
                  height: 16,
                  background: '#c0c0c0',
                  border: '1px solid #000',
                  borderTop: '1px solid #fff',
                  borderLeft: '1px solid #fff',
                  marginLeft: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: 12,
                  boxShadow: 'inset -1px -1px #808080',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'sans-serif',
                }}
              >×</button>
            </div>
          </div>
          {/* Terminal Output (hidden if minimized) */}
          {windowState !== 'minimized' && (
            <div
              className="crt-effect crt-scanlines"
              style={{
                background: '#000',
                minHeight: '60vh',
                borderTop: '2px solid #fff',
                borderLeft: '2px solid #fff',
                borderRight: '2px solid #808080',
                borderBottom: '2px solid #808080',
                boxShadow: 'inset 2px 2px 10px rgba(0,0,0,0.8)',
                fontFamily: '"Perfect DOS VGA 437", "Consolas", "Courier New", monospace',
                color: '#00ff41',
                fontSize: 16,
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                className="overflow-y-auto pr-2 pb-20 dos-scrollbar"
                id="terminal-output"
                ref={outputRef}
                style={{
                  height: '60vh',
                  fontSize: '1em',
                  lineHeight: '1.4',
                  letterSpacing: '0.02em',
                  fontFamily: 'inherit',
                  background: 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  overflowX: 'hidden',
                  color: 'inherit',
                  padding: '10px',
                }}
              >
                {!startupComplete && (
                  <pre style={{ 
                    color: '#00ff41', 
                    fontFamily: 'inherit',
                    margin: 0,
                    whiteSpace: 'pre',
                    textShadow: '0 0 5px #00ff41',
                  }}>
                    {startupScreen}
                  </pre>
                )}
                {startupComplete && history.map((entry, i) => (
                  <div 
                    key={i} 
                    className="terminal-glow"
                    style={{ 
                      color: entry.type === 'input' ? '#00ffff' : '#00ff41', 
                      fontFamily: 'inherit', 
                      whiteSpace: 'pre-wrap',
                      marginBottom: '2px',
                    }}
                  >
                    {entry.value}
                  </div>
                ))}
                {loading && (
                  <div className="terminal-glow" style={{ 
                    color: '#ffff00', 
                    fontStyle: 'normal',
                    marginTop: '4px',
                  }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>■</span> PROCESSING COMMAND...
                  </div>
                )}
                {children}
              </div>
              {/* Sticky Input Bar */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.9)',
                borderTop: '1px solid #00ff41',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 -2px 20px rgba(0,255,65,0.3)',
              }}>
                <span className="terminal-glow" style={{ 
                  color: '#00ffff', 
                  marginRight: 8, 
                  fontWeight: 'normal', 
                  fontFamily: 'inherit' 
                }}>
                  {prompt}
                </span>
                <input
                  ref={inputRef}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#00ffff',
                    fontFamily: 'inherit',
                    fontSize: 16,
                    padding: 0,
                    textShadow: '0 0 3px #00ffff',
                  }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  disabled={loading}
                  placeholder=""
                  autoFocus
                  spellCheck={false}
                />
                {cursorVisible && !loading && (
                  <span className="terminal-glow" style={{ 
                    color: '#00ffff',
                    animation: 'blink 1s step-start infinite',
                  }}>_</span>
                )}
              </div>
              {/* Windows 95 Status Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -24,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  fontSize: 11,
                  color: '#000',
                  background: '#c0c0c0',
                  borderTop: '1px solid #fff',
                  borderBottom: '1px solid #000',
                  borderLeft: '1px solid #fff',
                  borderRight: '1px solid #000',
                  pointerEvents: 'none',
                  fontFamily: '"MS Sans Serif", "Tahoma", sans-serif',
                  height: 22,
                  boxSizing: 'border-box',
                }}
              >
                {/* Left section with indented panel */}
                <div style={{
                  border: '1px solid #808080',
                  borderTop: '1px solid #000',
                  borderLeft: '1px solid #000',
                  padding: '2px 6px',
                  marginRight: 4,
                  background: '#c0c0c0',
                }}>
                  <span style={{ fontWeight: 'normal', color: '#000' }}>
                    {loading ? 'Working...' : 'Ready'}
                  </span>
                </div>
                {/* Middle section */}
                <div style={{
                  flex: 1,
                  border: '1px solid #808080',
                  borderTop: '1px solid #000',
                  borderLeft: '1px solid #000',
                  padding: '2px 6px',
                  marginRight: 4,
                  background: '#c0c0c0',
                }}>
                  <span style={{ fontWeight: 'normal', color: '#000' }}>
                    {lastScan ? `Last scan: ${lastScan.toLocaleTimeString()}` : 'For Help, type HELP and press Enter'}
                  </span>
                </div>
                {/* Right section with system info */}
                <div style={{
                  border: '1px solid #808080',
                  borderTop: '1px solid #000',
                  borderLeft: '1px solid #000',
                  padding: '2px 6px',
                  background: '#c0c0c0',
                  display: 'flex',
                  gap: 8,
                }}>
                  <span>NUM</span>
                  <span>CAPS</span>
                  <span>INS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Add global spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default TerminalWindow;