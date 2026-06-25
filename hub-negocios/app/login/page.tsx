'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const checkLoggedUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkLoggedUser();
  }, [router]);

  // Login Normal (Supabase/Prisma via API)
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Conecta direto com o Supabase sem precisar de API intermediária
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else if (data?.session) {
      // Login feito com sucesso! O cookie já foi salvo pelo SDK.
      router.push('/'); 
    }
  } catch (err) {
    setError('Erro ao conectar com o servidor.');
  } finally {
    setLoading(false);
  }
};

  // NOVO: Função de Login com Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Acesse sua conta</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">E-mail</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-bold">Senha</label>
                      <Link href="/recuperar-senha" style={{ fontSize: '0.8rem' }} className="text-decoration-none text-primary">Esqueceu a senha?</Link>
                    </div>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary w-100 rounded-3 shadow-sm fw-bold">
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Entrar'}
                  </button>
                </form>

                <div className="my-4 d-flex align-items-center">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 text-muted small">OU</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* BOTÃO DO GOOGLE EM BOOTSTRAP */}
                <button 
                  onClick={handleGoogleLogin}
                  className="btn btn-outline-dark w-100 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
                  Entrar com Google
                </button>

                <div className="text-center mt-4">
                  <span className="text-muted small">Não tem conta? </span>
                  <Link href="/cadastro" className="text-decoration-none text-primary fw-bold small">Cadastre-se</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}