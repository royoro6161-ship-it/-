'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Card = { id: string; front: string; back: string; tags: string[] };

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');

  async function load() {
    const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false });
    if (error) alert(error.message); else setCards(data as any);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('ログインしてください');
    const tagArr = tags ? tags.split(',').map(s=>s.trim()) : [];
    const { error } = await supabase.from('cards').insert({ owner: user.id, front, back, tags: tagArr });
    if (error) alert(error.message); else { setFront(''); setBack(''); setTags(''); load(); }
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">カード管理</h1>
      <div className="flex flex-wrap gap-2 items-center">
        <input className="border p-2" placeholder="表" value={front} onChange={e=>setFront(e.target.value)} />
        <input className="border p-2" placeholder="裏" value={back} onChange={e=>setBack(e.target.value)} />
        <input className="border p-2" placeholder="タグ（カンマ区切り）" value={tags} onChange={e=>setTags(e.target.value)} />
        <button className="border px-3 py-2" onClick={add}>追加</button>
      </div>
      <ul className="space-y-2">
        {cards.map(c => (
          <li key={c.id} className="border p-3 rounded">
            <div className="font-semibold">{c.front}</div>
            <div className="text-gray-600">{c.back}</div>
            {c.tags?.length ? <div className="text-xs text-gray-500 mt-1">[{c.tags.join(', ')}]</div> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
