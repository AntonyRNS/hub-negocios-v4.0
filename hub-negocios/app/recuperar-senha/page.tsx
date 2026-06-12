'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Padrão App Router [2]
import Link from 'next/link';

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validação básica de campos
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // 1. Busca os usuários no LocalStorage [3]
    const savedUsers = localStorage.getItem('local_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // 2. Localiza o índice do usuário pelo e-mail
    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex !== -1) {
      // 3. Atualiza a senha no array
      users[userIndex].password = newPassword;

      // 4. Salva o array atualizado de volta no LocalStorage [3, 4]
      localStorage.setItem('local_users', JSON.stringify(users));

      setMessage('Senha alterada com sucesso! Redirecionando para o login...');
      
      // 5. Redireciona após 2 segundos para o usuário ler a mensagem
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError('E-mail não encontrado no sistema.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Redefinir Senha</h1>
      <p>Informe seu e-mail e a nova senha desejada.</p>

      <form onSubmit={handleUpdatePassword} style={{ marginTop: '20px' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <div style={{ marginBottom: '15px' }}>
          <label>E-mail:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Nova Senha:</label><br />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Confirmar Nova Senha:</label><br />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
          Atualizar Senha
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}