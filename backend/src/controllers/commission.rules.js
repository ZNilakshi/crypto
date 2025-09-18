export const LAYERS_1_3_BY_LEVEL = { 0:0.0, 1:0.4, 2:0.5, 3:0.6, 4:0.7, 5:0.8, 6:0.9 };
export const LAYERS_4_6_BY_LEVEL = { 0:0.0, 1:0.3, 2:0.4, 3:0.5, 4:0.6, 5:0.7, 6:0.8 };

export const REFERRAL_UNLOCK_ONE_TIME = 100; 
export const LEADER_MIN_LEVEL = 1;
export const LEADER_BONUS_FLAT = 0.05;

export function getIndirectPct(level, layer) {
  if (layer >= 1 && layer <= 3) return LAYERS_1_3_BY_LEVEL[level] ?? 0;
  if (layer >= 4 && layer <= 6) return LAYERS_4_6_BY_LEVEL[level] ?? 0;
  return 0;
}
