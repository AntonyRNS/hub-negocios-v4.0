'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Importamos o usePathname aqui
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Ele nos diz exatamente em qual página o usuário está agora
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Verifica se a página atual é o Perfil
  const isProfilePage = pathname === '/perfil';

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-10 bg-white border-b border-[#E2E8F0] shadow-sm py-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-[#00629e] no-underline">Job Hub</Link>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3f4852]">sarc</span>
          <input className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#00629e] text-sm" placeholder="Pesquisar vagas, empresas..." type="text"/>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-[#3f4852] hover:text-[#00629e] text-sm no-underline transition-colors">Home</Link>
          <a className="text-[#3f4852] hover:text-[#00629e] text-sm no-underline transition-colors" href="#">Jobs</a>
          <a className="text-[#3f4852] hover:text-[#00629e] text-sm no-underline transition-colors" href="#">Network</a>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors">Sair</button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#3f4852] hover:bg-[#eff4ff] transition-all rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          {/* LOGIC INTERESSANTE: Só mostra o indicador de perfil se NÃO estiver na página de perfil */}
          {!isProfilePage && (
            <Link href="/perfil" className="relative ml-4 block cursor-pointer active:scale-95 transition-transform">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-[#00629e]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#d3e4fe] flex items-center justify-center border-2 border-[#00629e]">
                  <span className="material-symbols-outlined text-[#00629e]">person</span>
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}