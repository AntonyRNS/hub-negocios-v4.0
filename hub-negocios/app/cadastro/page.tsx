'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; 

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name, // Isso alimenta o 'new.raw_user_meta_data' que o seu gatilho do banco precisa!
            name: name
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data?.user) {
        setSuccess('Cadastro realizado com sucesso! Redirecionando...');
        
        
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Criar sua conta</h2>
                  <p className="text-muted small">Preencha os dados abaixo</p>
                </div>

                <form onSubmit={handleRegister}>
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  {success && <div className="alert alert-success py-2 small">{success}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nome Completo</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">E-mail</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold">Senha</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary w-100 rounded-3 shadow-sm fw-bold">
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Cadastrar'}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <span className="text-muted small">Já tem uma conta? </span>
                  <Link href="/login" className="text-decoration-none text-primary fw-bold small">Faça Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}