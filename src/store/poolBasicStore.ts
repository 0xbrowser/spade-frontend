import { create } from 'zustand'

interface PoolBasicStore {
  selectedPoolId: string | null
  setSelectedPoolId: (id: string | null) => void
}

type SetState = {
  setState: (partial: PoolBasicStore | Partial<PoolBasicStore>) => void
}

export const usePoolBasicStore = create<PoolBasicStore>((set: SetState['setState']) => ({
  selectedPoolId: null,
  setSelectedPoolId: (id: string | null) => set({ selectedPoolId: id }),
})) 