import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ShoppingNote, ShoppingNoteForm, ShoppingNoteStatus } from '@/types'

const noteSelect = `
  *,
  creator:members!shopping_notes_created_by_fkey(*),
  claimer:members!shopping_notes_claimer_id_fkey(*)
`

export function useShoppingNotes() {
  return useQuery({
    queryKey: ['shopping-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_notes')
        .select(noteSelect)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ShoppingNote[]
    },
  })
}

export function useAddShoppingNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ShoppingNoteForm & { created_by: string }) => {
      const { data, error } = await supabase
        .from('shopping_notes')
        .insert({
          item_name: payload.item_name,
          message: payload.message || null,
          created_by: payload.created_by,
        })
        .select(noteSelect)
        .single()

      if (error) throw error
      return data as ShoppingNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-notes'] })
    },
  })
}

export function useUpdateShoppingNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      item_name,
      message,
    }: ShoppingNoteForm & { id: string }) => {
      const { data, error } = await supabase
        .from('shopping_notes')
        .update({
          item_name,
          message: message || null,
        })
        .eq('id', id)
        .select(noteSelect)
        .single()

      if (error) throw error
      return data as ShoppingNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-notes'] })
    },
  })
}

export function useDeleteShoppingNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_notes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-notes'] })
    },
  })
}

export function useSetShoppingNoteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      claimer_id,
    }: {
      id: string
      status: ShoppingNoteStatus
      claimer_id: string | null
    }) => {
      const { data, error } = await supabase
        .from('shopping_notes')
        .update({
          status,
          claimer_id,
        })
        .eq('id', id)
        .select(noteSelect)
        .single()

      if (error) throw error
      return data as ShoppingNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-notes'] })
    },
  })
}
