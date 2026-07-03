'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Ajuste o caminho até a sua pasta lib se necessário

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // Método profissional do Supabase para atualizar a senha do usuário atual (autenticado via link do e-mail)
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Senha alterada com sucesso! Redirecionando...');
        
        // Aguarda 2 segundos para o usuário ler a mensagem e joga para o login
        setTimeout(() => {
          router.push('/login'); 
        }, 2000);
      }
    } catch (err) {
      setError('Falha na conexão com o servidor do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Nova Senha</h2>
                  <p className="text-muted small">Atualize seus dados de acesso</p>
                </div>

                <form onSubmit={handleUpdatePassword}>
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  {message && <div className="alert alert-success py-2 small">{message}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nova Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Repita a nova senha"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 rounded-3 fw-bold shadow-sm"
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      'Atualizar Senha'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <Link href="/login" className="text-decoration-none text-primary small fw-bold">
                    Voltar para o Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}