import { v4 as uuidv4 } from 'uuid'

const API_URL = 'http://localhost:3500/api'

let playerId = localStorage.getItem('playerId')
if (!playerId) {
  playerId = uuidv4()
  localStorage.setItem('playerId', playerId)
}

export const createGame = async () => {
  try {
    const response = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating game:', error)
    throw error
  }
}

export const joinGame = async (gameId: string) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error joining the game:', error)
    throw error
  }
}

export const getGameState = async (gameId: string) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting game state:', error)
    throw error
  }
}

export const makeMove = async (gameId: string, position: number) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, position }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Response error:', errorData)
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error when performing movement:', error)
    throw error
  }
}

export const resetGame = async (gameId: string) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error restarting game:', error)
    throw error
  }
}

export const subscribeToGameEvents = (gameId: string, callback: (data: any) => void) => {
  const eventSource = new EventSource(`${API_URL}/games/${gameId}/events`)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      callback(data)
    } catch (error) {
      console.error('Error processing SSE message:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error)
    setTimeout(() => {
      subscribeToGameEvents(gameId, callback)
    }, 3000)
    eventSource.close()
  }

  return () => {
    eventSource.close()
  }
}

export const getPlayerId = () => playerId
