import { createContext, useContext, useState, type ReactNode } from 'react'

export type FilterState = {
  type: 'category' | 'price' | 'az' | 'za' | 'new' | 'featured' | 'recommended' | null
  category: string | null
  minPrice: string
  maxPrice: string
}

export const DEFAULT_FILTER: FilterState = { type: null, category: null, minPrice: '', maxPrice: '' }

type Ctx = { filter: FilterState; setFilter: (f: FilterState) => void }
const FilterContext = createContext<Ctx>({ filter: DEFAULT_FILTER, setFilter: () => {} })

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  return <FilterContext.Provider value={{ filter, setFilter }}>{children}</FilterContext.Provider>
}

export const useFilter = () => useContext(FilterContext)
