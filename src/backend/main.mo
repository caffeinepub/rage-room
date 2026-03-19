import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Order "mo:core/Order";


actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Rage Room types
  public type RageRoomScore = {
    playerName : Text;
    score : Nat;
    level : Nat;
  };

  module RageRoomScore {
    public func compareByScore(a : RageRoomScore, b : RageRoomScore) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  let scores = Map.empty<Text, RageRoomScore>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;
  let premiumPlayers = Map.empty<Text, Bool>();

  // Stripe configuration (admin-only)
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  // Stripe integration functions (public)
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  // Leaderboard functions
  public query ({ caller }) func getTopScores() : async [RageRoomScore] {
    let sortedScores = scores.values().toArray().sort(RageRoomScore.compareByScore);
    sortedScores.sliceToArray(0, Nat.min(10, scores.size()));
  };

  public query ({ caller }) func getPremiumStatus(playerName : Text) : async Bool {
    switch (premiumPlayers.get(playerName)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query ({ caller }) func isPlayerPremium(playerName : Text) : async Bool {
    switch (premiumPlayers.get(playerName)) {
      case (null) { false };
      case (?_) { true };
    };
  };
};
