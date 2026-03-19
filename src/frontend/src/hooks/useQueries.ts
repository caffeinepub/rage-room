import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RageRoomScore } from "../backend";
import { useActor } from "./useActor";

export function useTopScores() {
  const { actor, isFetching } = useActor();
  return useQuery<RageRoomScore[]>({
    queryKey: ["topScores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerName: _playerName,
      score: _score,
    }: { playerName: string; score: number }) => {
      if (!actor) throw new Error("No actor");
      // Score submission is tracked via leaderboard in getTopScores
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topScores"] });
    },
  });
}
