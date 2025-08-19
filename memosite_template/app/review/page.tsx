'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sm2Update } from '@/lib/sm2';
import { addDays } from 'date-fns';

type Card = { id: string; front: string; back: string };

export default function Review() {
  const [card, setCard] = useState<Card|null>(null);
  const [showBack, setShowBack] = useState(false);

  async function loadNext() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // 期日カードを1枚
    const { data: due, error } = await supabase
      .from('schedules')
      .select('card_id, interval_days, ef, reps, lapses, cards!inner(id,front,back)')
      .eq('user_id', user.id)
      .lte('due_date', new Date().toISOString().slice(0,10))
      .limit(1);
    if (error) { alert(error.message); return; }
    if (due && due.length) {
      const d: any = due[0];
      setCard({ id: d.cards.id, front: d.cards.front, back: d.cards.back });
      return;
    }
    // 新規カード
    const { data: nc, error: e2 } = await supabase.rpc('assign_new_card');
    if (e2) { alert(e2.message); return; }
    if (nc && nc.length) setCard(nc[0] as any);
    else setCard(null);
  }

  async function grade(q: 0|1|2|3|4|5) {
    if (!card) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: cur } = await supabase.from('schedules')
      .select('interval_days,ef,reps,lapses').eq('user_id', user.id).eq('card_id', card.id).maybeSingle();
    const state = cur ?? { interval_days: 1, ef: 2.5, reps: 0, lapses: 0 };
    const next = sm2Update(
      { interval: state.interval_days, ef: Number(state.ef), reps: state.reps, lapses: state.lapses },
      q
    );
    const due = addDays(new Date(), next.interval);
    await supabase.from('reviews').insert({ user_id: user.id, card_id: card.id, rating: q });
    await supabase.from('schedules').upsert({
      user_id: user.id, card_id: card.id,
      interval_days: next.interval, ef: next.ef, reps: next.reps, lapses: next.lapses,
      due_date: due.toISOString().slice(0,10)
    });
    setShowBack(false);
    loadNext();
  }

  useEffect(() => { loadNext(); }, []);

  if (!card) return <main className="p-6">出題可能なカードがありません。カードを追加してください。</main>;

  return (
    <main className="space-y-4">
      <div className="text-lg font-bold">学習</div>
      <div className="border p-6 cursor-pointer min-h-32 rounded" onClick={() => setShowBack(true)}>
        {showBack ? card.back : card.front}
      </div>
      {showBack && (
        <div className="flex gap-2">
          {[0,1,2,3,4,5].map(q =>
            <button key={q} className="border px-3 py-2 rounded" onClick={() => grade(q as any)}>{q}</button>
          )}
        </div>
      )}
    </main>
  );
}
