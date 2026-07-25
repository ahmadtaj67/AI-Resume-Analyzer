const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 25

const parsePositiveInteger = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallbackValue
  }

  return parsedValue
}

export const getPaginationParams = (query) => {
  const page = parsePositiveInteger(query?.page, DEFAULT_PAGE)
  const requestedLimit = parsePositiveInteger(query?.limit, DEFAULT_LIMIT)
  const limit = Math.min(requestedLimit, MAX_LIMIT)
  const from = (page - 1) * limit
  const to = from + limit - 1

  return {
    page,
    limit,
    from,
    to,
  }
}

export const buildPaginationMeta = ({ page, limit, totalItems }) => {
  const safeTotalItems = Number.isInteger(totalItems) && totalItems > 0 ? totalItems : 0
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / limit))

  return {
    page,
    limit,
    totalItems: safeTotalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && safeTotalItems > 0,
  }
}

