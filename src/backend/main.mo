import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  type ScoreEntry = {
    playerName : Text;
    score : Nat;
  };

  module ScoreEntry {
    public func compareByScore(a : ScoreEntry, b : ScoreEntry) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  let scores = Map.empty<Text, ScoreEntry>();

  public shared ({ caller }) func submitScore(playerName : Text, score : Nat) : async () {
    let entry : ScoreEntry = {
      playerName;
      score;
    };
    scores.add(playerName, entry);
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    scores.values().toArray().sort(ScoreEntry.compareByScore).sliceToArray(0, Nat.min(10, scores.size()));
  };
};
