'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  async function signIn() {
    const email = prompt('メールアドレスを入力');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    alert(error ? error.message : '認証メールを送信しました');
  }

  async function signOut() {
    await supabase.auth.signOut();
    location.reload();
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">暗記サイト</h1>
      {!user ? (
        <button onClick={signIn} className="border px-4 py-2">メールでログイン</button>
      ) : (
        <div className="space-x-4">
          <a className="underline" href="/review">学習を開始</a>
          <a className="underline" href="/cards">カード管理</a>
          <button className="border px-3 py-1" onClick={signOut}>ログアウト</button>
        </div>
      )}
    </main>
  );
}
