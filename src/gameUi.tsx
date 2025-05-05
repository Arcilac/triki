interface GameUIProps {
  board: (string | null)[]
  gameId: string | null
  loading: boolean
  error: string | null
  scores: { X: number; O: number; ties: number }
  status: string
  winningCells: number[]
  playerSymbol: string | null
  gameUrl: string | null
  connected: boolean
  startNewGame: () => void
  handlePress: (index: number) => void
  handleResetGame: () => void
  copyGameLink: () => void
  canMakeMove: () => boolean
}

export function GameUI({
  board,
  gameId,
  loading,
  error,
  scores,
  status,
  winningCells,
  playerSymbol,
  gameUrl,
  connected,
  startNewGame,
  handlePress,
  handleResetGame,
  copyGameLink,
  canMakeMove,
}: GameUIProps) {
  const renderCell = (index: number) => {
    const isWinningCell = winningCells.includes(index)

    return (
      <div
        key={index}
        className={`cell ${isWinningCell ? 'winning-cell' : ''} ${
          !canMakeMove() ? 'disabled' : ''
        }`}
        onClick={() => handlePress(index)}
        style={{ cursor: canMakeMove() && !board[index] ? 'pointer' : 'default' }}
      >
        {board[index] && (
          <div className="cell-content">
            {board[index] === 'X' ? (
              <div className="x-mark">X</div>
            ) : (
              <div className="o-mark">O</div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!gameId) {
    return (
      <div className="container">
        <h1 className="title">Triki</h1>
        {error && <div className="error-message">{error}</div>}
        <button className="reset-button" onClick={startNewGame} disabled={loading}>
          {loading ? 'Creating game...' : 'Create new game'}
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="title">Triki</h1>

      {error && <div className="error-message">{error}</div>}

      {playerSymbol && (
        <div className="player-info">
          You are the player:{' '}
          <span className={playerSymbol === 'X' ? 'x-color' : 'o-color'}>{playerSymbol}</span>
          {canMakeMove() && <span className="turn-indicator"> (Your turn!)</span>}
        </div>
      )}

      {gameUrl && (
        <div className="game-link">
          <p>Share this link with your opponent:</p>
          <div className="link-container">
            <input type="text" value={gameUrl} readOnly className="game-url" />
            <button onClick={copyGameLink} className="copy-button">
              Copy
            </button>
          </div>
        </div>
      )}

      {!connected && <div className="loading">Connecting to server...</div>}

      <div className="score-board">
        <div className="score-item">
          <div className="score-label x-color">X</div>
          <div className="score-value">{scores.X}</div>
        </div>
        <div className="score-item">
          <div className="score-label">Draws</div>
          <div className="score-value">{scores.ties}</div>
        </div>
        <div className="score-item">
          <div className="score-label o-color">O</div>
          <div className="score-value">{scores.O}</div>
        </div>
      </div>

      <div className="status">{status}</div>

      <div className="board">
        {Array(9)
          .fill(null)
          .map((_, index) => renderCell(index))}
      </div>

      <button className="reset-button" onClick={handleResetGame}>
        Restart game
      </button>
    </div>
  )
}
