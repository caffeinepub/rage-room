# Rage Room

## Current State
- Full level-based smash game with 30s timer, combos, leaderboard, and level-up transitions
- SMASH IT ALL button always visible during play
- Red rage overlay flashes on screen when SMASH IT ALL is used
- Leaderboard only accessible via manual button
- Game over screen shows top scores

## Requested Changes (Diff)

### Add
- **Level 1 End Comparison Popup**: When level 1 ends (timer hits 0), before the level-up screen, show a popup comparing the player's score to other players on the leaderboard (e.g., "You beat X% of players", your rank, nearby scores)
- **Angry Emoji Burst Popup**: When all 8 objects are simultaneously smashed (all slots in non-idle state), instead of / in addition to rage overlay, show a full-screen animated popup of random angry/raging emojis (😤 😡 🤬 💢 🔥 👊 😠 💀 🤯 👿) exploding outward
- **Power Boost state**: After all objects are smashed at once, trigger a "POWER BOOST" visual effect: multiple raging emoji popups fly across screen AND the SMASH IT ALL button re-appears with glowing boost effect
- **SMASH IT ALL 15-second timer**: Button hidden at game start, appears after 15 seconds, disappears after use, reappears 15 seconds later on a repeating cycle

### Modify
- SMASH IT ALL button: hidden initially, shown/hidden based on 15-second cycle
- Rage overlay: replaced/supplemented by emoji popup when all smashed
- Level-up transition for level 1: add score comparison before next level begins

### Remove
- Always-visible SMASH IT ALL button (now timer-gated)

## Implementation Plan
1. Add `smashItAllVisible` state + 15s interval that shows/hides the button
2. Track when all slots are non-idle simultaneously → trigger emoji burst popup
3. Emoji burst popup: animated overlay with flying angry emojis, auto-dismisses after ~2s
4. Power Boost: after all-smash trigger, show POWER BOOST text + emoji rain + reset SMASH IT ALL visibility with glow
5. Level 1 end: after timer hits 0 at level 1, show a comparison card (rank among leaderboard, % beaten) for 3s before level-up screen
