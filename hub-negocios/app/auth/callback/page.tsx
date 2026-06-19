'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Pega o código de autenticação que o Google colocou na URL do navegador
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        // 2. Troca esse código por uma sessão real no Supabase (isso garante que o login terminou no banco)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error && data?.session) {
          // 3. Agora sim, com a sessão confirmada, guarda no localStorage
          localStorage.setItem('is_logged_in', 'true');
          localStorage.setItem('current_user', JSON.stringify(data.session.user));
        } else {
          console.error('Erro ao trocar código por sessão:', error);
        }
      }

      // 4. Só redireciona depois que toda a operação acima terminou
      router.push('/');
    };

    handleAuth();
  }, [router]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div className="spinner-border text-primary" role="status"></div>
      <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Finalizando sua autenticação...</p>
    </div>
  );
}