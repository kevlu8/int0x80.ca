'use client';

import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';

// Simple chess game state tracking
class ChessGame {
  constructor() {
    this.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true
    };
    this.reset();
  }

  reset() {
    this.board = this.createInitialBoard();
    this.turn = 'white';
    this.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true
    };
    this.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  createInitialBoard() {
    return new Map([
      ['a8', { color: 'black', role: 'rook' }],
      ['b8', { color: 'black', role: 'knight' }],
      ['c8', { color: 'black', role: 'bishop' }],
      ['d8', { color: 'black', role: 'queen' }],
      ['e8', { color: 'black', role: 'king' }],
      ['f8', { color: 'black', role: 'bishop' }],
      ['g8', { color: 'black', role: 'knight' }],
      ['h8', { color: 'black', role: 'rook' }],
      ['a7', { color: 'black', role: 'pawn' }],
      ['b7', { color: 'black', role: 'pawn' }],
      ['c7', { color: 'black', role: 'pawn' }],
      ['d7', { color: 'black', role: 'pawn' }],
      ['e7', { color: 'black', role: 'pawn' }],
      ['f7', { color: 'black', role: 'pawn' }],
      ['g7', { color: 'black', role: 'pawn' }],
      ['h7', { color: 'black', role: 'pawn' }],
      ['a2', { color: 'white', role: 'pawn' }],
      ['b2', { color: 'white', role: 'pawn' }],
      ['c2', { color: 'white', role: 'pawn' }],
      ['d2', { color: 'white', role: 'pawn' }],
      ['e2', { color: 'white', role: 'pawn' }],
      ['f2', { color: 'white', role: 'pawn' }],
      ['g2', { color: 'white', role: 'pawn' }],
      ['h2', { color: 'white', role: 'pawn' }],
      ['a1', { color: 'white', role: 'rook' }],
      ['b1', { color: 'white', role: 'knight' }],
      ['c1', { color: 'white', role: 'bishop' }],
      ['d1', { color: 'white', role: 'queen' }],
      ['e1', { color: 'white', role: 'king' }],
      ['f1', { color: 'white', role: 'bishop' }],
      ['g1', { color: 'white', role: 'knight' }],
      ['h1', { color: 'white', role: 'rook' }],
    ]);
  }

  makeMove(from, to) {
    const piece = this.board.get(from);
    console.log(`makeMove called: ${from} to ${to}, piece:`, piece, `turn: ${this.turn}`);
    
    if (!piece || piece.color !== this.turn) {
      console.log(`Move rejected: no piece (${!piece}) or wrong color (${piece?.color} !== ${this.turn})`);
      return false;
    }

    // Update castling rights before making the move
    this.updateCastlingRights(from, to, piece);

    // Handle castling
    if (piece.role === 'king' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
      console.log('Castling move detected');
      
      // King side castling
      if (to === 'g1' || to === 'g8') {
        const rookFrom = to === 'g1' ? 'h1' : 'h8';
        const rookTo = to === 'g1' ? 'f1' : 'f8';
        const rook = this.board.get(rookFrom);
        
        if (rook && rook.role === 'rook' && rook.color === piece.color) {
          // Move king and rook
          this.board.set(to, piece);
          this.board.delete(from);
          this.board.set(rookTo, rook);
          this.board.delete(rookFrom);
          console.log(`Castling: King ${from}-${to}, Rook ${rookFrom}-${rookTo}`);
        } else {
          console.log('Invalid castling - rook not found');
          return false;
        }
      }
      // Queen side castling
      else if (to === 'c1' || to === 'c8') {
        const rookFrom = to === 'c1' ? 'a1' : 'a8';
        const rookTo = to === 'c1' ? 'd1' : 'd8';
        const rook = this.board.get(rookFrom);
        
        if (rook && rook.role === 'rook' && rook.color === piece.color) {
          // Move king and rook
          this.board.set(to, piece);
          this.board.delete(from);
          this.board.set(rookTo, rook);
          this.board.delete(rookFrom);
          console.log(`Castling: King ${from}-${to}, Rook ${rookFrom}-${rookTo}`);
        } else {
          console.log('Invalid castling - rook not found');
          return false;
        }
      }
    } else {
      // Regular move
      this.board.set(to, piece);
      this.board.delete(from);
      
      // Handle pawn promotion
      if (piece.role === 'pawn') {
        const targetRank = to.charAt(1);
        // White pawn reaches 8th rank or black pawn reaches 1st rank
        if ((piece.color === 'white' && targetRank === '8') || 
            (piece.color === 'black' && targetRank === '1')) {
          // Promote to queen
          console.log(`Pawn promotion: ${piece.color} pawn on ${to} promoted to queen`);
          this.board.set(to, { color: piece.color, role: 'queen' });
        }
      }
    }
    
    // Switch turns
    this.turn = this.turn === 'white' ? 'black' : 'white';
    
    // Update FEN
    this.updateFen();
    
    console.log(`Move successful: ${from}-${to}, new turn: ${this.turn}`);
    return true;
  }

  updateCastlingRights(from, to, piece) {
    // If king moves, lose all castling rights for that side
    if (piece.role === 'king') {
      if (piece.color === 'white') {
        this.castlingRights.whiteKingSide = false;
        this.castlingRights.whiteQueenSide = false;
      } else {
        this.castlingRights.blackKingSide = false;
        this.castlingRights.blackQueenSide = false;
      }
    }

    // If rook moves from its starting position, lose castling rights for that side
    if (piece.role === 'rook') {
      if (from === 'a1') this.castlingRights.whiteQueenSide = false;
      else if (from === 'h1') this.castlingRights.whiteKingSide = false;
      else if (from === 'a8') this.castlingRights.blackQueenSide = false;
      else if (from === 'h8') this.castlingRights.blackKingSide = false;
    }

    // If a rook is captured, lose castling rights for that side
    const capturedPiece = this.board.get(to);
    if (capturedPiece && capturedPiece.role === 'rook') {
      if (to === 'a1') this.castlingRights.whiteQueenSide = false;
      else if (to === 'h1') this.castlingRights.whiteKingSide = false;
      else if (to === 'a8') this.castlingRights.blackQueenSide = false;
      else if (to === 'h8') this.castlingRights.blackKingSide = false;
    }
  }

  updateFen() {
    // Generate FEN from current board state
    let fen = '';
    
    // Build board representation (ranks 8 to 1)
    for (let rank = 8; rank >= 1; rank--) {
      let emptyCount = 0;
      let rankStr = '';
      
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank; // a1, b1, etc.
        const piece = this.board.get(square);
        
        if (piece) {
          if (emptyCount > 0) {
            rankStr += emptyCount;
            emptyCount = 0;
          }
          
          let pieceChar = piece.role.charAt(0);
          if (piece.role === 'knight') pieceChar = 'n';
          if (piece.color === 'white') pieceChar = pieceChar.toUpperCase();
          rankStr += pieceChar;
        } else {
          emptyCount++;
        }
      }
      
      if (emptyCount > 0) {
        rankStr += emptyCount;
      }
      
      if (rank < 8) fen += '/';
      fen += rankStr;
    }
    
    // Add turn, castling, en passant, halfmove, fullmove
    const turnChar = this.turn === 'white' ? 'w' : 'b';
    
    // Generate castling rights string
    let castling = '';
    if (this.castlingRights.whiteKingSide) castling += 'K';
    if (this.castlingRights.whiteQueenSide) castling += 'Q';
    if (this.castlingRights.blackKingSide) castling += 'k';
    if (this.castlingRights.blackQueenSide) castling += 'q';
    if (castling === '') castling = '-';
    
    fen += ` ${turnChar} ${castling} - 0 1`;
    
    this.fen = fen;
    console.log('Generated FEN:', fen);
  }

  getPieces() {
    const pieces = {};
    for (const [square, piece] of this.board.entries()) {
      pieces[square] = piece;
    }
    return pieces;
  }
}

export default function ChessPage() {
  const boardRef = useRef(null);
  const chessgroundRef = useRef(null);
  const moduleRef = useRef(null);
  const gameRef = useRef(new ChessGame());
  const [isEngineLoaded, setIsEngineLoaded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [gamePosition, setGamePosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [status, setStatus] = useState('Loading...');

  // Load the WASM engine
  useEffect(() => {
    const loadEngine = async () => {
      try {
        setStatus('Loading chess engine...');
        
        // Create Module configuration before loading script
        console.log('Setting up Module configuration...');
        window.Module = {
          onRuntimeInitialized: () => {
            console.log('=== ENGINE RUNTIME INITIALIZED ===');
            console.log('Module object:', window.Module);
            console.log('Available functions:', Object.keys(window.Module));
            console.log('Module._main exists:', typeof window.Module._main);
            console.log('Module.ccall exists:', typeof window.Module.ccall);
            console.log('Module.cwrap exists:', typeof window.Module.cwrap);
            
            // Test if ccall is available
            if (typeof window.Module.ccall === 'function') {
              console.log('✅ ccall is available - engine should work');
              
              // Test if search_fen is available
              try {
                const testResult = window.Module.ccall('search_fen', 'string', ['string', 'number'], ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 100]);
                console.log('✅ Test engine call successful:', testResult);
                
                moduleRef.current = window.Module;
                setIsEngineLoaded(true);
                setStatus('Engine loaded - Your turn');
              } catch (error) {
                console.error('❌ Test engine call failed:', error);
                setStatus('Engine loaded but search_fen unavailable');
              }
            } else {
              console.error('❌ ccall is not available');
              setStatus('Engine loaded but ccall unavailable');
            }
          },
          onAbort: (what) => {
            console.error('Engine aborted:', what);
            setStatus('Engine failed to load');
          },
          print: (text) => {
            console.log('Engine:', text);
          },
          printErr: (text) => {
            console.error('Engine error:', text);
          }
        };

        // Load the engine script from public directory
        console.log('Creating script element for engine.js...');
        const script = document.createElement('script');
        script.src = '/engine.js';
        script.async = true;
        
        script.onload = () => {
          console.log('✅ Engine script loaded successfully');
          console.log('Script loaded, waiting for Module.onRuntimeInitialized...');
          // Module initialization will be handled by onRuntimeInitialized
        };
        
        script.onerror = (error) => {
          console.error('❌ Failed to load engine.js:', error);
          console.error('Script src was:', script.src);
          setStatus('Failed to load engine script');
        };
        
        document.head.appendChild(script);
        
        // Cleanup function
        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Failed to load chess engine:', error);
        setStatus('Failed to load engine');
      }
    };

    loadEngine();
  }, []);

  // Define handleMove function
  const handleMove = async (orig, dest) => {
    console.log(`=== HANDLEMOVE CALLED === ${orig} to ${dest}`);
    console.log('isEngineLoaded:', isEngineLoaded);
    console.log('isThinking:', isThinking);
    
    if (isThinking) {
      console.log('Move blocked - engine thinking');
      return;
    }

    console.log(`Player move: ${orig} to ${dest}`);
    
    const game = gameRef.current;
    
    // Make the move in our game state
    if (!game.makeMove(orig, dest)) {
      console.log('Invalid move');
      return;
    }

    // Update chessground to reflect the move
    chessgroundRef.current.set({
      fen: game.fen,
      turnColor: game.turn,
      movable: {
        color: game.turn,
        free: true,
        dests: new Map()
      }
    });

    // Update state
    setGamePosition(game.fen);

    // If it's now black's turn, let the engine play
    if (game.turn === 'black' && moduleRef.current) {
      setIsThinking(true);
      setStatus('Engine thinking...');

      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI feedback
        
        const searchTime = 1000; // 1 second
        console.log('Calling engine with FEN:', game.fen);
        
        const result = moduleRef.current.ccall(
          'search_fen',
          'string',
          ['string', 'number'],
          [game.fen, searchTime]
        );

        console.log('Engine result raw:', result);
        console.log('Result type:', typeof result);
        console.log('Result length:', result ? result.length : 'null/undefined');

        if (result && result.length >= 4) {
          const engineOrig = result.slice(0, 2);
          const engineDest = result.slice(2, 4);
          // Check if it's a promotion move (5 characters like "e7e8q")
          const isPromotion = result.length >= 5 && /[a-h][1-8][a-h][1-8][qrnb]/i.test(result.slice(0, 5));
          const uciMove = isPromotion ? result.slice(0, 5) : result.slice(0, 4);
          const evaluation = isPromotion ? result.slice(6) : result.slice(5);

          console.log(`Engine move: ${engineOrig} to ${engineDest}${isPromotion ? ' (promotion)' : ''}`);
          console.log('Current board state before engine move:', Array.from(game.board.entries()));
          console.log('Engine move piece check:', game.board.get(engineOrig));

          // Make the engine move
          if (game.makeMove(engineOrig, engineDest)) {
            // Update chessground
            chessgroundRef.current.set({
              fen: game.fen,
              turnColor: game.turn,
              movable: {
                color: game.turn,
                free: true,
                dests: new Map()
              }
            });

            setGamePosition(game.fen);
            setStatus(`Engine played: ${uciMove} - Eval: ${evaluation ? (-evaluation / 100).toFixed(2) : 'N/A'}`);
          } else {
            console.error('Engine move was invalid');
            setStatus('Engine made invalid move - Your turn');
            // Revert to white's turn
            game.turn = 'white';
            chessgroundRef.current.set({
              turnColor: 'white',
              movable: { color: 'white', free: true, dests: new Map() }
            });
          }
        } else {
          console.error('Invalid engine response:', result);
          setStatus('Engine error - Your turn');
          // Revert to white's turn
          game.turn = 'white';
          chessgroundRef.current.set({
            turnColor: 'white',
            movable: { color: 'white', free: true, dests: new Map() }
          });
        }
      } catch (error) {
        console.error('Engine error:', error);
        setStatus('Engine error - Your turn');
        // Revert to white's turn
        game.turn = 'white';
        chessgroundRef.current.set({
          turnColor: 'white',
          movable: { color: 'white', free: true, dests: new Map() }
        });
      }

      setIsThinking(false);
    } else if (game.turn === 'black' && !moduleRef.current) {
      setStatus('Engine not loaded - human vs human mode');
      // Allow black to move manually
      chessgroundRef.current.set({
        turnColor: 'black',
        movable: {
          color: 'black',
          free: true,
          dests: new Map()
        }
      });
    } else {
      const currentTurn = game.turn === 'white' ? 'White' : 'Black';
      setStatus(`${currentTurn} to move`);
      
      // If engine isn't loaded, allow both colors to move manually
      if (!moduleRef.current) {
        chessgroundRef.current.set({
          turnColor: game.turn,
          movable: {
            color: game.turn,
            free: true,
            dests: new Map(),
          }
        });
      }
    }
  };

  // Initialize chessground
  useEffect(() => {
    if (boardRef.current && !chessgroundRef.current) {
      console.log('Initializing chessground...');
      const game = gameRef.current;
      
      try {
        console.log('Creating chessground with handleMove:', typeof handleMove);
        
        chessgroundRef.current = Chessground(boardRef.current, {
          fen: gamePosition,
          orientation: 'white',
          turnColor: 'white',
          coordinates: true,
          movable: {
            color: 'white',
            free: true, // Only allow legal moves
            dests: new Map(), // We'll populate this with legal moves
          },
          drawable: {
            enabled: true,
            visible: true,
          },
          events: {
            move: (orig, dest) => {
              console.log('=== CHESSGROUND MOVE EVENT ===', orig, dest);
              handleMove(orig, dest);
            },
          },
        });

        console.log('Chessground initialized successfully');
        console.log('Chessground instance:', chessgroundRef.current);

        // Set initial position
        chessgroundRef.current.set({
          fen: gamePosition,
          turnColor: 'white',
          movable: {
            color: 'white',
            free: true,
            dests: new Map()
          }
        });

        console.log('Initial position set');
      } catch (error) {
        console.error('Failed to initialize chessground:', error);
        setStatus('Failed to initialize chess board');
      }
    }
  }, []);

  const resetGame = () => {
    const game = gameRef.current;
    game.reset();
    
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    setGamePosition(startFen);
    setStatus(isEngineLoaded ? 'Game reset - Your turn' : 'Loading...');
    
    if (chessgroundRef.current) {
      chessgroundRef.current.set({
        fen: startFen,
        turnColor: 'white',
        movable: {
          color: 'white',
          free: true,
          dests: new Map()
        },
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-center font-mono text-3xl mb-8">Chess Engine</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Chess Board */}
          <div className="flex flex-col items-center">
            <div 
              ref={boardRef}
              className="chess-board mb-4"
              style={{ 
                width: '400px', 
                height: '400px',
                border: '2px solid #4a5568',
                backgroundColor: '#f0f0f0'
              }}
            />
            
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-mono disabled:bg-gray-500"
                disabled={isThinking}
              >
                New Game
              </button>
              
              <div className="px-4 py-2 bg-gray-700 text-white rounded font-mono flex items-center">
                {isThinking ? '🤔' : isEngineLoaded ? '⚡' : '⏳'} {status}
              </div>

              {!isEngineLoaded && (
                <div className="px-4 py-2 bg-yellow-600 text-white rounded font-mono text-sm">
                  Playing without engine (human vs human)
                </div>
              )}
            </div>
          </div>
          
          {/* Game Info */}
          <div className="space-y-6">
            <div className="border border-gray-700 rounded-lg p-6">
              <h2 className="font-mono text-xl mb-4">Game Information</h2>
              
              <div className="space-y-3 font-mono text-sm">
                <div>
                  <span className="text-gray-400">Engine Status:</span>
                  <span className="ml-2">
                    {isEngineLoaded ? '✅ Loaded' : '⏳ Loading...'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400">Position:</span>
                  <div className="mt-1 p-2 bg-gray-800 rounded text-xs break-all">
                    {gamePosition}
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Engine Info */}
            <div className="border border-gray-700 rounded-lg p-6">
              <h3 className="font-mono text-lg mb-4">About the Engine</h3>
              <div className="font-mono text-sm text-gray-300 space-y-2">
                <p>This is a WebAssembly chess engine compiled from C++.</p>
                <p>The engine searches for the best move using alpha-beta pruning and various chess-specific optimizations.</p>
                <p>Search time is currently set to 1 second per move.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
