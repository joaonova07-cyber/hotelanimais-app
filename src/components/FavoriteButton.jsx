import { useState } from 'react'
import { isFavorite, toggleFavorite } from '../utils/favorites'

function FavoriteButton({ itemId }) {
  const [favorite, setFavorite] = useState(() => isFavorite(itemId))

  function handleFavoriteClick() {
    const updatedIds = toggleFavorite(itemId)
    setFavorite(updatedIds.includes(Number(itemId)))
  }

  return (
    <button
      type="button"
      onClick={handleFavoriteClick}
      aria-label={
        favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
      }
      aria-pressed={favorite}
      title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {favorite ? '♥' : '♡'}
    </button>
  )
}

export default FavoriteButton