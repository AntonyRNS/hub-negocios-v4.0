'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Ajuste o caminho do seu arquivo supabase

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FORMA PROFISSIONAL: Pergunta direto ao Supabase se há uma sessão ativa
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      } else {
        // Se não tiver sessão real no Supabase, manda pro login
        router.push('/login');
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    // Desloga no servidor do Supabase de verdade
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Olá, {user?.user_metadata?.full_name || 'Usuário'}!</h1>
          <p className="col-md-8 fs-4 text-muted">
            Sua sessão está autenticada via tokens seguros do Supabase. <br />
            E-mail: <strong>{user?.email}</strong>
          </p>
          <button onClick={handleLogout} className="btn btn-danger btn-lg" type="button">
            Sair com Segurança
          </button>
        </div>
      </div>
    </div>
  );
}