'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Ajuste o caminho

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Método profissional do Supabase que envia o e-mail de recuperação
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`, // Para onde o link do e-mail vai mandar ele de volta
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Se o e-mail existir, um link de redefinição foi enviado!');
      }
    } catch (err) {
      setError('Ocorreu um erro ao processar a solicitação.');
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
                  <h2 className="fw-bold">Recuperar Senha</h2>
                  <p className="text-muted small">Digite seu e-mail para receber o link</p>
                </div>

                <form onSubmit={handleRequestReset}>
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  {message && <div className="alert alert-success py-2 small">{message}</div>}

                  <div className="mb-4">
                    <label className="form-label small fw-bold">E-mail Cadastrado</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary w-100 rounded-3 fw-bold shadow-sm">
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Enviar Link'}
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