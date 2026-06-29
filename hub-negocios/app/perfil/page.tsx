'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Garanta que o caminho para sua lib está correto
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  
  // Estados para gerenciar os dados vindos do Supabase
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Controle do Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados dos campos do formulário (vão espelhar as colunas do banco)
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // 1. BUSCA AS INFORMAÇÕES NO SUPABASE AO ENTRAR NA PÁGINA
  const fetchProfileData = async () => {
    // Pega o usuário que acabou de logar
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login'); // Se não tiver logado, barra e joga pro login
      return;
    }

    // Busca na tabela 'profiles' a linha correspondente ao ID/Email logado
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, username, location, bio')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      // Preenche os inputs com o que já existe salvo no banco
      setUsername(data.username || '');
      setLocation(data.location || '');
      setBio(data.bio || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // 2. SALVA AS ALTERAÇÕES DIRETO NO BANCO DE DADOS
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Mudamos para UPSERT e passamos o ID e o EMAIL para garantir a criação/vínculo
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,         // Chave primária obrigatória para o upsert saber quem é
          email: session.user.email,   // Garante que o e-mail fica salvo e amarrado à conta
          username: username,
          location: location,
          bio: bio
        });

      if (error) throw error;

      // Atualiza a tela imediatamente
      setProfile({ ...profile, username, location, bio, email: session.user.email });
      setIsModalOpen(false);
      alert('Perfil guardado com sucesso no Supabase! 🎉');
    } catch (error: any) {
      alert('Erro ao salvar no Supabase: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary font-semibold">Conectando ao banco de dados...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
        
        {/* Card de Perfil */}
        <aside className="md:col-span-4 space-y-stack-md">
          <div className="bg-surface-white border border-border-subtle rounded-lg p-stack-lg shadow-sm">
            
            <div className="flex flex-col items-center text-center">
              {/* Ícone de Usuário padrão */}
              <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center mb-4 border border-border-subtle">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant"></span>
              </div>

              {/* Informações Amarradas ao e-mail e colunas do banco */}
              <h1 className="text-lg font-bold text-on-surface">
                {profile?.username ? `@${profile.username}` : 'Usuário sem username'}
              </h1>
              
              <p className="text-sm text-on-surface-variant mt-1 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">Localizado em </span>
                {profile?.location || 'Nenhuma localização cadastrada'}
              </p>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full py-2 bg-primary text-surface-white hover:bg-opacity-90 transition-all rounded-lg text-sm font-semibold cursor-pointer border-none"
              >
                Preencher dados do Perfil
              </button>
            </div>

            {/* Vinculação permanente ao e-mail de cadastro */}
            <div className="mt-6 border-t border-border-subtle pt-4">
              <span className="text-xs text-on-surface-variant block mb-1 font-bold">E-mail da Conta</span>
              <span className="text-sm text-on-surface font-medium block truncate">{profile?.email}</span>
            </div>
          </div>

          {/* Seção Sobre (Biografia) */}
          <div className="bg-surface-white border border-border-subtle rounded-lg p-stack-lg shadow-sm">
            <h2 className="text-sm font-bold text-on-surface mb-2">Sobre mim</h2>
            <p className="text-sm text-on-surface-variant whitespace-pre-line">
              {profile?.bio || 'Nenhuma descrição encontrada no banco de dados.'}
            </p>
          </div>
        </aside>

        {/* Feed Central Secundário */}
        <div className="md:col-span-8">
          <div className="bg-surface-white border border-border-subtle rounded-lg p-stack-md shadow-sm">
            <h2 className="text-base font-bold text-on-surface">Atividade do Usuário</h2>
            <p className="text-sm text-on-surface-variant mt-1">Sua conta está sincronizada e ativa no banco de dados.</p>
          </div>
        </div>
      </main>

      {/* MODAL DE EDIÇÃO INTEGRADO AO BANCO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-white rounded-xl p-6 w-full max-w-md shadow-xl border border-border-subtle mx-4">
            
            <div className="flex justify-between items-center border-b border-border-subtle pb-3 mb-4">
              <h3 className="text-base font-bold text-on-surface">Atualizar dados no Banco</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Nome de Usuário (username)</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                  placeholder="Ex: joao_negocios"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Localização (location)</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Biografia (bio)</label>
                <textarea 
                  rows={4}
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Conte sua trajetória profissional..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg bg-transparent border-none cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-surface-white rounded-lg hover:bg-opacity-90 font-semibold cursor-pointer border-none disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar no Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}