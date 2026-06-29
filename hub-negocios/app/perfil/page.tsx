'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  
  // Estados do Perfil e do Modal
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // ================= ESTADOS NOVOS PARA O SISTEMA DE POSTS =================
  const [posts, setPosts] = useState<any[]>([]);          // Guarda a lista de posts do banco
  const [newPostContent, setNewPostContent] = useState(''); // Guarda o texto do novo post
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Guarda o arquivo da imagem
  const [posting, setPosting] = useState(false);           // Status de carregamento do post

  // 1. BUSCA OS DADOS DO PERFIL E OS POSTS DO BANCO
  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Busca dados do perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, email, username, location, bio')
      .eq('id', session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setUsername(profileData.username || '');
      setLocation(profileData.location || '');
      setBio(profileData.bio || '');
    }

    // Chamamos a função para carregar o feed de posts
    await fetchPosts();
    setLoading(false);
  };

  // Função isolada para buscar os posts (usamos para atualizar a tela após postar)
  const fetchPosts = async () => {
    // Aqui fazemos a query relacional: traz o post E os dados do perfil de quem criou!
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        image_url,
        created_at,
        profiles (
          username,
          location
        )
      `)
      .order('created_at', { ascending: false }); // Mostra os mais recentes primeiro

    if (data) {
      setPosts(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. FUNÇÃO PARA CRIAR UM NOVO POST (TEXTO + IMAGEM OPCIONAL)
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedImage) return; // Não posta se estiver tudo vazio

    setPosting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let uploadedImageUrl = null;

      // SE o usuário escolheu uma imagem, fazemos o upload para o Storage primeiro
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

        // Envia o arquivo para o seu Bucket (Ajuste o nome 'post-images' se o seu for diferente)
        const { error: uploadError } = await supabase.storage
          .from('post-images') 
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        // Pega a URL pública dessa imagem que acabou de ser guardada no Storage
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrl; // Guarda o link para salvar na tabela
      }

      // Agora insere a linha na tabela 'posts' com o texto e o link da imagem
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          content: newPostContent,
          file: uploadedImageUrl // Será null se ele não tiver enviado foto
        });

      if (insertError) throw insertError;

      // Limpa os campos após o sucesso
      setNewPostContent('');
      setSelectedImage(null);
      
      // Atualiza a lista de posts na tela
      await fetchPosts();
      alert('Publicado com sucesso! 🚀');
    } catch (error: any) {
      alert('Erro ao publicar: ' + error.message);
    } finally {
      setPosting(false);
    }
  };

  // 3. SALVA AS ALTERAÇÕES DO PERFIL (Mantido do passo anterior)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          username: username,
          location: location,
          bio: bio
        });

      if (error) throw error;
      setProfile({ ...profile, username, location, bio, email: session.user.email });
      setIsModalOpen(false);
    } catch (error: any) {
      alert('Erro ao salvar no Supabase: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary font-semibold">Carregando Job Hub...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
        
        {/* COLUNA ESQUERDA: CARD PERFIL E SOBRE */}
        <aside className="md:col-span-4 space-y-stack-md">
          <div className="bg-surface-white border border-border-subtle rounded-lg p-stack-lg shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center mb-4 mx-auto border border-border-subtle">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
            </div>
            <h1 className="text-lg font-bold text-on-surface">
              {profile?.username ? `@${profile.username}` : 'Usuário sem username'}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {profile?.location || 'Nenhuma localização cadastrada'}
            </p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 w-full py-2 bg-primary text-surface-white hover:bg-opacity-90 transition-all rounded-lg text-sm font-semibold cursor-pointer border-none">
              Editar Perfil
            </button>
            <div className="mt-6 border-t border-border-subtle pt-4 text-left">
              <span className="text-xs text-on-surface-variant block mb-1 font-bold">E-mail da Conta</span>
              <span className="text-sm text-on-surface font-medium block truncate">{profile?.email}</span>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle rounded-lg p-stack-lg shadow-sm">
            <h2 className="text-sm font-bold text-on-surface mb-2">Sobre mim</h2>
            <p className="text-sm text-on-surface-variant whitespace-pre-line">{profile?.bio || 'Nenhuma descrição.'}</p>
          </div>
        </aside>

        {/* COLUNA CENTRAL: CAIXA DE POSTAGEM E FEED REAL */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Formulário de Criação de Post (Composer) */}
          <div className="bg-surface-white border border-border-subtle rounded-lg p-4 shadow-sm">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="No que você está pensando para os seus negócios hoje?..."
                rows={3}
                className="w-full border-none p-2 text-sm text-on-surface bg-transparent focus:outline-none resize-none"
              />

              {/* Preview da imagem selecionada antes de enviar */}
              {selectedImage && (
                <div className="relative inline-block mt-2">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="max-h-48 rounded-lg object-cover border border-border-subtle"
                  />
                  <button 
                    type="button" 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border-none cursor-pointer"
                  >
                    X
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-border-subtle pt-3">
                {/* Input escondido para upload de arquivo */}
                <label className="flex items-center gap-2 text-sm text-primary font-medium cursor-pointer hover:opacity-80">
                  <span className="material-symbols-outlined text-lg">image</span>
                  <span>Adicionar Foto</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files && setSelectedImage(e.target.files[0])}
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={posting}
                  className="px-5 py-1.5 bg-primary text-surface-white font-semibold text-sm rounded-full border-none cursor-pointer hover:bg-opacity-90 disabled:opacity-50"
                >
                  {posting ? 'A publicar...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>

          {/* Listagem do Feed Dinâmico */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-on-surface-variant px-1">Publicações Recentes</h3>
            
            {posts.length === 0 ? (
              <div className="bg-surface-white border border-border-subtle rounded-lg p-6 text-center">
                <p className="text-sm text-on-surface-variant">Nenhuma publicação por enquanto. Seja o primeiro a postar!</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="bg-surface-white border border-border-subtle rounded-lg p-4 shadow-sm space-y-3">
                  {/* Cabeçalho do Post (Autor) */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-border-subtle">
                      <span className="material-symbols-outlined text-xl text-on-surface-variant">person</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">
                        {post.profiles?.username ? `@${post.profiles.username}` : '@anonimo'}
                      </h4>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontSize: '12px' }}>location_on</span>
                        {post.profiles?.location || 'Sem localização'} • {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Conteúdo do Texto */}
                  <p className="text-sm text-on-surface whitespace-pre-line">{post.content}</p>

                  {/* Imagem do Post (se houver) */}
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden border border-border-subtle max-h-96 bg-surface-container-low">
                      <img src={post.image_url} alt="Imagem do Post" className="w-full h-full object-cover" />
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE EDIÇÃO DO PERFIL (Mantido do passo anterior) */}
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
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="Ex: joao_negocios"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Localização (location)</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="Ex: São Paulo, SP"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Biografia (bio)</label>
                <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary resize-none" placeholder="Conte sua trajetória profissional..."/>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg bg-transparent border-none cursor-pointer">Cancelar</button>
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