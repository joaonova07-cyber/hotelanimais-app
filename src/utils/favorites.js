const STORAGE_KEY = 'hotelanimais-favoritos'

export function getFavoriteIds() {
  const storedValue = localStorage.getItem(STORAGE_KEY)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

export function saveFavoriteIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function isFavorite(id) {
  const favoriteIds = getFavoriteIds()
  return favoriteIds.includes(Number(id))
}

export function toggleFavorite(id) {
  const numericId = Number(id)
  const favoriteIds = getFavoriteIds()

  const updatedIds = favoriteIds.includes(numericId)
    ? favoriteIds.filter((favoriteId) => favoriteId !== numericId)
    : [...favoriteIds, numericId]

  saveFavoriteIds(updatedIds)

  return updatedIds
}