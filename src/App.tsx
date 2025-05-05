'use client'

import { useState, useEffect } from 'react'
import './App.css'
import {
  createGame,
  joinGame,
  getGameState,
  makeMove,
  resetGame,
  subscribeToGameEvents,
} from './api'
import { GameUI } from './gameUi'

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [status, setStatus] = useState('')
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winningCells, setWinningCells] = useState<number[]>([])
  const [gameId, setGameId] = useState<string | null>(null)
  const [playerSymbol, setPlayerSymbol] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startNewGame = async () => {
    try {
      setLoading(true)
      setError(null)

      const { gameId } = await createGame()
      setGameId(gameId)

      const { symbol } = await joinGame(gameId)
      setPlayerSymbol(symbol)

      setGameUrl(`${window.location.origin}?game=${gameId}`)

      setLoading(false)

      const initialState = await getGameState(gameId)
      updateGameState(initialState)
    } catch (error) {
      console.error('Error creating game:', error)
      setLoading(false)
    }
  }

  const joinExistingGame = async (gameId: string) => {
    try {
      setLoading(true)
      setError(null)
      setGameId(gameId)

      const gameState = await getGameState(gameId)

      const { symbol } = await joinGame(gameId)
      setPlayerSymbol(symbol)

      setGameUrl(`${window.location.origin}?game=${gameId}`)

      updateGameState(gameState)

      setLoading(false)
    } catch (error) {
      console.error('Error joining the game:', error)
      setLoading(false)
    }
  }

  const updateGameState = (gameState: any) => {
    if (!gameState) return

    setBoard(gameState.board || Array(9).fill(null))
    setIsXNext(gameState.isXNext)
    setGameOver(gameState.gameOver)
    setWinningCells(gameState.winningCells || [])
    setScores(gameState.scores || { X: 0, O: 0, ties: 0 })

    if (gameState.gameOver) {
      if (gameState.winningCells && gameState.winningCells.length > 0) {
        const winner = gameState.board[gameState.winningCells[0]]
        setStatus(`¡${winner} has won!`)
      } else {
        setStatus('Draw!')
      }
    } else {
      setStatus(`turn of ${gameState.isXNext ? 'X' : 'O'}`)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gameIdFromUrl = params.get('game')

    if (gameIdFromUrl) {
      joinExistingGame(gameIdFromUrl)
    }
  })

  useEffect(() => {
    if (!gameId) return

    const unsubscribe = subscribeToGameEvents(gameId, (gameState) => {
      updateGameState(gameState)
      setConnected(true)
    })

    return () => {
      unsubscribe()
    }
  }, [gameId])

  const canMakeMove = () => {
    if (!playerSymbol || !connected) return false
    if (gameOver) return false

    const currentPlayerTurn = isXNext ? 'X' : 'O'
    const canMove = playerSymbol === currentPlayerTurn

    return canMove
  }

  const handlePress = async (index: number) => {
    if (!gameId || board[index] || !canMakeMove()) {
      return
    }

    try {
      await makeMove(gameId, index)
    } catch (error) {
      console.error('Error when performing movement:', error)
    }
  }

  const handleResetGame = async () => {
    if (!gameId) return

    try {
      await resetGame(gameId)
    } catch (error) {
      console.error('Error restarting game:', error)
    }
  }

  const copyGameLink = () => {
    if (gameUrl) {
      navigator.clipboard.writeText(gameUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <GameUI
      board={board}
      gameId={gameId}
      loading={loading}
      error={error}
      scores={scores}
      status={status}
      winningCells={winningCells}
      playerSymbol={playerSymbol}
      gameUrl={gameUrl}
      connected={connected}
      startNewGame={startNewGame}
      handlePress={handlePress}
      handleResetGame={handleResetGame}
      copyGameLink={copyGameLink}
      canMakeMove={canMakeMove}
    />
  )
}
