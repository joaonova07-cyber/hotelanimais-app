import { useState } from 'react'
import { isFavorite, toggleFavorite } from '../utils/favorites'

function FavoriteButton({ itemId, onChange }) {
  const [favorite, setFavorite] = useState(() => isFavorite(itemId))

  function handleFavoriteClick() {
    const updatedIds = toggleFavorite(itemId)
    const estaFavorito = updatedIds.includes(Number(itemId))

    setFavorite(estaFavorito)
    onChange?.(estaFavorito)
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
      className={`botao-favorito${favorite ? ' ativo' : ''}`}
    >
      <span aria-hidden="true">{favorite ? '♥' : '♡'}</span>
    </button>
  )
}

export default FavoriteButton
