import { create } from 'zustand'

import { initDatabase } from '@/core/db/client'
import * as repo from '@/core/db/repos'
import type { NewRoutineRow, RoutineRow } from '@/core/db/schema'

interface RoutinesState {
  loaded: boolean
  routines: RoutineRow[]
  load: () => Promise<void>
  add: (input: Omit<NewRoutineRow, 'id'>) => Promise<void>
  edit: (id: string, patch: Partial<NewRoutineRow>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useRoutinesStore = create<RoutinesState>((set) => ({
  loaded: false,
  routines: [],

  load: async () => {
    await initDatabase()
    set({ routines: await repo.listRoutines(), loaded: true })
  },

  add: async (input) => {
    await repo.insertRoutine({ ...input, id: repo.newId() })
    set({ routines: await repo.listRoutines() })
  },

  edit: async (id, patch) => {
    await repo.updateRoutine(id, patch)
    set({ routines: await repo.listRoutines() })
  },

  remove: async (id) => {
    await repo.deleteRoutine(id)
    set({ routines: await repo.listRoutines() })
  },
}))
