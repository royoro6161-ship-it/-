export type Sm2State = {
  interval: number; // days
  ef: number;       // ease factor
  reps: number;
  lapses: number;
};

export function sm2Update(state: Sm2State, quality: 0|1|2|3|4|5): Sm2State {
  let { interval, ef, reps, lapses } = state;

  if (quality < 3) {
    reps = 0;
    lapses += 1;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps += 1;
  }

  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  return { interval, ef, reps, lapses };
}
